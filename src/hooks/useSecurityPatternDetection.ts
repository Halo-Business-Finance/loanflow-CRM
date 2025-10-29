import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface SecurityPattern {
  pattern_type: string;
  severity: string;
  count: number;
  description: string;
  affected_users: string[];
}

interface PatternAlert {
  id: string;
  pattern_type: string;
  severity: string;
  detection_count: number;
  description: string;
  affected_user_ids: string[];
  detected_at: string;
  acknowledged: boolean;
  resolved: boolean;
}

export const useSecurityPatternDetection = () => {
  const [patterns, setPatterns] = useState<SecurityPattern[]>([]);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole('admin') || hasRole('super_admin');

  const detectPatterns = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setIsScanning(true);

      const { data, error } = await supabase.rpc('detect_suspicious_patterns');

      if (error) throw error;

      if (data && data.length > 0) {
        setPatterns(data);

        // Create alerts for critical patterns
        const criticalPatterns = data.filter(
          (p: SecurityPattern) => p.severity === 'critical'
        );

        if (criticalPatterns.length > 0) {
          for (const pattern of criticalPatterns) {
            // Insert into security_pattern_alerts
            await supabase.from('security_pattern_alerts').insert({
              pattern_type: pattern.pattern_type,
              severity: pattern.severity,
              detection_count: pattern.count,
              description: pattern.description,
              affected_user_ids: pattern.affected_users,
            });

            toast({
              title: "Critical Security Threat Detected",
              description: pattern.description,
              variant: "destructive",
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error detecting security patterns:', error);
    } finally {
      setIsScanning(false);
    }
  }, [isAdmin, toast]);

  const loadAlerts = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('security_pattern_alerts')
        .select('*')
        .eq('resolved', false)
        .order('detected_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) setAlerts(data);
    } catch (error: any) {
      console.error('Error loading security alerts:', error);
    }
  }, [isAdmin]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    if (!isAdmin || !user) return;

    try {
      const { error } = await supabase
        .from('security_pattern_alerts')
        .update({
          acknowledged: true,
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Acknowledged",
        description: "Security alert has been acknowledged",
      });

      await loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      });
    }
  }, [isAdmin, user, toast, loadAlerts]);

  const resolveAlert = useCallback(async (alertId: string, notes: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('security_pattern_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert Resolved",
        description: "Security alert has been marked as resolved",
      });

      await loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  }, [isAdmin, toast, loadAlerts]);

  // Real-time subscription to new alerts
  useEffect(() => {
    if (!isAdmin || !user) return;

    const channel = supabase
      .channel('security_pattern_alerts_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_pattern_alerts',
        },
        (payload) => {
          const newAlert = payload.new as PatternAlert;
          setAlerts((prev) => [newAlert, ...prev]);

          if (newAlert.severity === 'critical') {
            toast({
              title: "🚨 Critical Security Pattern Detected",
              description: newAlert.description,
              variant: "destructive",
              duration: 10000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [isAdmin, user, toast]);

  // Auto-scan every 5 minutes
  useEffect(() => {
    if (!isAdmin) return;

    loadAlerts();
    detectPatterns();

    const interval = setInterval(() => {
      detectPatterns();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAdmin, detectPatterns, loadAlerts]);

  return {
    patterns,
    alerts,
    isScanning,
    detectPatterns,
    acknowledgeAlert,
    resolveAlert,
    loadAlerts,
  };
};