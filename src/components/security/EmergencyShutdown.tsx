import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  AlertTriangle, 
  Power, 
  Lock, 
  Unlock, 
  Activity,
  ShieldAlert,
  RefreshCw
} from "lucide-react";

interface EmergencyEvent {
  id: string;
  threat_type: string;
  severity: 'critical' | 'high';
  trigger_source: string;
  auto_shutdown: boolean;
  manual_override: boolean;
  triggered_at: string;
  resolved_at?: string;
}

interface ShutdownStatus {
  is_shutdown: boolean;
  shutdown_reason: string;
  shutdown_level: 'partial' | 'complete';
  triggered_by: string;
  triggered_at: string;
  auto_restore_at?: string;
}

export function EmergencyShutdown() {
  const { toast } = useToast();
  const [shutdownStatus, setShutdownStatus] = useState<ShutdownStatus | null>(null);
  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check authorization level
  const checkAuthorization = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user.id)
        .eq('is_active', true);

      const hasAdminRole = roles?.some(r => 
        ['admin', 'super_admin', 'security_admin'].includes(r.role)
      );
      
      setIsAuthorized(hasAdminRole || false);
      return hasAdminRole || false;
    } catch (error) {
      console.error('Authorization check failed:', error);
      return false;
    }
  }, []);

  // Initialize emergency shutdown system
  const initializeShutdownSystem = useCallback(async () => {
    try {
      // Check current shutdown status using the database function
      const { data: statusData } = await supabase.rpc('is_system_shutdown');
      
      const status = statusData as any;
      if (status?.is_shutdown) {
        setShutdownStatus({
          is_shutdown: true,
          shutdown_reason: status.reason,
          shutdown_level: status.shutdown_level,
          triggered_by: status.triggered_by,
          triggered_at: status.triggered_at
        });
      }

      // Fetch recent emergency events
      const { data: events } = await supabase
        .from('emergency_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (events) {
        setEmergencyEvents(events.map(event => ({
          id: event.id,
          threat_type: event.threat_type,
          severity: event.severity as 'critical' | 'high',
          trigger_source: event.trigger_source,
          auto_shutdown: event.auto_shutdown,
          manual_override: event.manual_override,
          triggered_at: event.created_at,
          resolved_at: event.resolved_at
        })));
      }

    } catch (error) {
      console.error('Failed to initialize shutdown system:', error);
      toast({
        title: "System Initialization Error",
        description: "Failed to initialize emergency shutdown system",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Manual emergency shutdown
  const triggerEmergencyShutdown = useCallback(async (
    reason: string, 
    level: 'partial' | 'complete' = 'complete'
  ) => {
    if (!isAuthorized) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to trigger emergency shutdown",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Log emergency event
      await supabase.from('emergency_events').insert({
        threat_type: 'manual_shutdown',
        severity: 'critical',
        trigger_source: 'security_admin',
        auto_shutdown: false,
        manual_override: true,
        event_data: { reason, level, admin_user: user.user?.email }
      });

      // Activate shutdown
      await supabase.from('emergency_shutdown').insert({
        reason,
        shutdown_level: level,
        triggered_by: user.user?.email || 'security_admin',
        is_active: true,
        auto_restore_at: level === 'partial' ? 
          new Date(Date.now() + 30 * 60 * 1000).toISOString() : // 30 mins for partial
          null // Manual restore for complete shutdown
      });

      setShutdownStatus({
        is_shutdown: true,
        shutdown_reason: reason,
        shutdown_level: level,
        triggered_by: user.user?.email || 'security_admin',
        triggered_at: new Date().toISOString()
      });

      toast({
        title: "Emergency Shutdown Activated",
        description: `Application has been ${level === 'complete' ? 'completely' : 'partially'} shut down`,
        variant: "destructive"
      });

      // If complete shutdown, redirect after short delay
      if (level === 'complete') {
        setTimeout(() => {
          window.location.href = '/emergency-maintenance';
        }, 3000);
      }

    } catch (error) {
      console.error('Emergency shutdown failed:', error);
      toast({
        title: "Shutdown Failed",
        description: "Failed to activate emergency shutdown",
        variant: "destructive"
      });
    }
  }, [isAuthorized, toast]);

  // Restore system
  const restoreSystem = useCallback(async () => {
    if (!isAuthorized) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to restore the system",
        variant: "destructive"
      });
      return;
    }

    try {
      // Deactivate shutdown
      await supabase
        .from('emergency_shutdown')
        .update({ 
          is_active: false, 
          resolved_at: new Date().toISOString() 
        })
        .eq('is_active', true);

      setShutdownStatus(null);

      toast({
        title: "System Restored",
        description: "Application has been restored to normal operation",
        variant: "default"
      });

    } catch (error) {
      console.error('System restore failed:', error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore system operation",
        variant: "destructive"
      });
    }
  }, [isAuthorized, toast]);

  // Auto-shutdown trigger for security bots
  const autoShutdownTrigger = useCallback(async (
    threatType: string, 
    severity: 'critical' | 'high',
    triggerSource: string,
    threatData: any
  ) => {
    // Only trigger auto-shutdown for critical threats
    if (severity !== 'critical') return;

    try {
      // Log emergency event
      await supabase.from('emergency_events').insert({
        threat_type: threatType,
        severity,
        trigger_source: triggerSource,
        auto_shutdown: true,
        manual_override: false,
        event_data: threatData
      });

      // Check if auto-shutdown is enabled for this threat type
      const autoShutdownEnabled = [
        'multiple_breach_attempts',
        'data_exfiltration_detected',
        'malware_injection',
        'privilege_escalation',
        'critical_vulnerability_exploit'
      ].includes(threatType);

      if (autoShutdownEnabled) {
        await supabase.from('emergency_shutdown').insert({
          reason: `Auto-shutdown: ${threatType} detected`,
          shutdown_level: 'partial',
          triggered_by: `AI_Bot_${triggerSource}`,
          is_active: true,
          auto_restore_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min auto-restore
        });

        setShutdownStatus({
          is_shutdown: true,
          shutdown_reason: `Auto-shutdown: ${threatType} detected`,
          shutdown_level: 'partial',
          triggered_by: `AI_Bot_${triggerSource}`,
          triggered_at: new Date().toISOString(),
          auto_restore_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        });

        toast({
          title: "EMERGENCY AUTO-SHUTDOWN",
          description: `Critical threat detected: ${threatType}. System automatically secured.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Auto-shutdown trigger failed:', error);
    }
  }, [toast]);

  // Expose auto-shutdown trigger globally for security bots
  useEffect(() => {
    (window as any).emergencyShutdownTrigger = autoShutdownTrigger;
    return () => {
      delete (window as any).emergencyShutdownTrigger;
    };
  }, [autoShutdownTrigger]);

  useEffect(() => {
    checkAuthorization().then(() => {
      initializeShutdownSystem();
    });
  }, [checkAuthorization, initializeShutdownSystem]);

  // Real-time monitoring for auto-restore
  useEffect(() => {
    if (shutdownStatus?.auto_restore_at) {
      const restoreTime = new Date(shutdownStatus.auto_restore_at).getTime();
      const now = Date.now();
      
      if (restoreTime > now) {
        const timeout = setTimeout(() => {
          restoreSystem();
        }, restoreTime - now);
        
        return () => clearTimeout(timeout);
      }
    }
  }, [shutdownStatus, restoreSystem]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Emergency Shutdown System
            <Badge variant={shutdownStatus?.is_shutdown ? "destructive" : "secondary"}>
              {shutdownStatus?.is_shutdown ? "SHUTDOWN ACTIVE" : "OPERATIONAL"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shutdownStatus?.is_shutdown ? (
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>System Status:</strong> {shutdownStatus.shutdown_level.toUpperCase()} SHUTDOWN</p>
                  <p><strong>Reason:</strong> {shutdownStatus.shutdown_reason}</p>
                  <p><strong>Triggered by:</strong> {shutdownStatus.triggered_by}</p>
                  <p><strong>Time:</strong> {new Date(shutdownStatus.triggered_at).toLocaleString()}</p>
                  {shutdownStatus.auto_restore_at && (
                    <p><strong>Auto-restore:</strong> {new Date(shutdownStatus.auto_restore_at).toLocaleString()}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                System is operational. AI Security Bots are monitoring for threats and can trigger automatic shutdown for critical incidents.
              </AlertDescription>
            </Alert>
          )}

          {isAuthorized && (
            <div className="flex gap-4">
              {!shutdownStatus?.is_shutdown ? (
                <>
                  <Button 
                    onClick={() => triggerEmergencyShutdown("Manual security shutdown", "partial")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Power className="h-4 w-4" />
                    Partial Shutdown
                  </Button>
                  <Button 
                    onClick={() => triggerEmergencyShutdown("Manual emergency shutdown", "complete")}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Complete Shutdown
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={restoreSystem}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  Restore System
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Emergency Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Emergency Events Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emergencyEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No emergency events recorded
            </p>
          ) : (
            <div className="space-y-3">
              {emergencyEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant={event.severity === 'critical' ? 'destructive' : 'default'}>
                        {event.severity}
                      </Badge>
                      {event.auto_shutdown && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          AUTO-SHUTDOWN
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium capitalize mt-1">
                      {event.threat_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Source: {event.trigger_source} • {new Date(event.triggered_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={event.resolved_at ? "secondary" : "destructive"}>
                    {event.resolved_at ? 'Resolved' : 'Active'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bot Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>AI Security Bot Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Auto-shutdown triggers:</strong></p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Multiple breach attempts detected</li>
              <li>Data exfiltration patterns identified</li>
              <li>Malware injection detected</li>
              <li>Privilege escalation attempts</li>
              <li>Critical vulnerability exploitation</li>
            </ul>
            <p className="mt-4"><strong>Response levels:</strong></p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong>Partial Shutdown:</strong> Blocks new connections, limits functionality (15min auto-restore)</li>
              <li><strong>Complete Shutdown:</strong> Full system lockdown (manual restore required)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}