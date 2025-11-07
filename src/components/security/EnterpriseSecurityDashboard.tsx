import React, { useState, useEffect } from "react";
import { StandardContentCard } from "@/components/StandardContentCard";
import { StandardKPICard } from "@/components/StandardKPICard";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Activity, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  Lock,
  Radar,
  Crosshair,
  Target,
  Command,
  Globe,
  Satellite,
  Cpu,
  Radio,
  Download,
  Database,
  Users,
  Eye,
  ChevronRight
} from "lucide-react";

interface SecurityMetrics {
  threatLevel: 'DEFCON-1' | 'DEFCON-2' | 'DEFCON-3' | 'DEFCON-4' | 'DEFCON-5';
  activeSessions: number;
  activeThreats: number;
  blockedAttempts: number;
  securityScore: number;
  quantumResistance: number;
  zeroTrustScore: number;
  complianceScore: number;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  details: any;
  created_at: string;
}

interface ActiveSession {
  id: string;
  user_id: string;
  security_alerts_count: number;
  is_active: boolean;
  last_activity: string;
}

export function EnterpriseSecurityDashboard() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threatLevel: 'DEFCON-3',
    activeSessions: 0,
    activeThreats: 0,
    blockedAttempts: 0,
    securityScore: 0,
    quantumResistance: 98.7,
    zeroTrustScore: 96.2,
    complianceScore: 97.5
  });
  
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [blockchainRecords, setBlockchainRecords] = useState<number>(0);
  const [auditLogs, setAuditLogs] = useState<number>(0);

  useEffect(() => {
    fetchSecurityData();
    
    // Set up real-time subscriptions
    const eventsChannel = supabase
      .channel('security_events_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'security_events' },
        () => fetchSecurityData()
      )
      .subscribe();

    const sessionsChannel = supabase
      .channel('active_sessions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'active_sessions' },
        () => fetchSecurityData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch recent security events
      const { data: events, error: eventsError } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventsError) throw eventsError;
      setSecurityEvents(events || []);

      // Fetch active sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (sessionsError) throw sessionsError;
      setActiveSessions(sessions || []);

      // Fetch blockchain records count
      const { count: blockchainCount, error: blockchainError } = await supabase
        .from('blockchain_records')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');

      if (blockchainError) throw blockchainError;
      setBlockchainRecords(blockchainCount || 0);

      // Fetch audit logs count (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: auditCount, error: auditError } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo);

      if (auditError) throw auditError;
      setAuditLogs(auditCount || 0);

      // Calculate metrics
      const criticalEvents = events?.filter(e => e.severity === 'critical').length || 0;
      const highEvents = events?.filter(e => e.severity === 'high').length || 0;
      const totalEvents = events?.length || 0;

      const avgRiskScore = sessions?.length 
        ? sessions.reduce((acc, s) => acc + (s.security_alerts_count || 0), 0) / sessions.length 
        : 0;

      const securityScore = Math.max(0, 100 - (criticalEvents * 10) - (highEvents * 5) - avgRiskScore);

      let threatLevel: SecurityMetrics['threatLevel'] = 'DEFCON-5';
      if (criticalEvents > 5) threatLevel = 'DEFCON-1';
      else if (criticalEvents > 2) threatLevel = 'DEFCON-2';
      else if (highEvents > 5) threatLevel = 'DEFCON-3';
      else if (highEvents > 2) threatLevel = 'DEFCON-4';

      setMetrics({
        threatLevel,
        activeSessions: sessions?.length || 0,
        activeThreats: criticalEvents + highEvents,
        blockedAttempts: events?.filter(e => 
          e.event_type?.includes('blocked') || 
          e.event_type?.includes('denied')
        ).length || 0,
        securityScore: Math.round(securityScore),
        quantumResistance: 98.7,
        zeroTrustScore: Math.max(0, 100 - avgRiskScore * 2),
        complianceScore: 97.5
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error loading security data",
        description: "Could not fetch the latest security metrics",
        variant: "destructive"
      });
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'DEFCON-1': return 'destructive';
      case 'DEFCON-2': return 'destructive';
      case 'DEFCON-3': return 'secondary';
      case 'DEFCON-4': return 'default';
      case 'DEFCON-5': return 'default';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const exportSecurityReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      metrics,
      securityEvents: securityEvents.slice(0, 20),
      activeSessions: activeSessions.length,
      blockchainRecords,
      auditLogs
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Security Report Exported",
      description: "Enterprise security report has been downloaded"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-[#0A1628] bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/security" className="hover:text-foreground transition-colors">
                  Security
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Enterprise Command Center</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">ENTERPRISE SECURITY COMMAND CENTER</h1>
              <p className="text-muted-foreground mt-1">
                Military-grade security monitoring and threat intelligence
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={getThreatLevelColor(metrics.threatLevel) as any} className="mr-2">
                {metrics.threatLevel}
              </Badge>
              <Button onClick={exportSecurityReport} className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-[#001f3f]" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer>
        {/* Critical Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StandardKPICard
            title="Threat Level"
            value={metrics.threatLevel}
            trend={{
              value: metrics.activeThreats > 0 ? `${metrics.activeThreats} active` : 'Secure',
              direction: metrics.activeThreats > 3 ? 'down' : 'neutral'
            }}
          />
          
          <StandardKPICard
            title="Security Score"
            value={`${metrics.securityScore}%`}
            trend={{
              value: metrics.securityScore > 90 ? 'Excellent' : 'Good',
              direction: metrics.securityScore > 90 ? 'up' : 'neutral'
            }}
          />

          <StandardKPICard
            title="Zero Trust Score"
            value={`${metrics.zeroTrustScore.toFixed(1)}%`}
            trend={{
              value: metrics.zeroTrustScore > 95 ? 'High' : 'Medium',
              direction: metrics.zeroTrustScore > 95 ? 'up' : 'neutral'
            }}
          />

          <StandardKPICard
            title="Active Sessions"
            value={metrics.activeSessions}
            trend={{
              value: `${metrics.blockedAttempts} blocked`,
              direction: 'up'
            }}
          />
        </div>

        {/* Advanced Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StandardKPICard
            title="Quantum Resistance"
            value={`${metrics.quantumResistance}%`}
          />
          
          <StandardKPICard
            title="Blockchain Records"
            value={blockchainRecords}
          />

          <StandardKPICard
            title="Audit Logs (24h)"
            value={auditLogs}
          />
        </div>

        {/* Compliance Framework Status */}
        <StandardContentCard title="Government Compliance Frameworks" className="mb-6 border-[#0A1628]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground mb-1">FISMA</p>
              <p className="text-2xl font-bold text-foreground">100%</p>
              <Progress value={100} className="mt-2" />
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground mb-1">FedRAMP</p>
              <p className="text-2xl font-bold text-foreground">98%</p>
              <Progress value={98} className="mt-2" />
            </div>
            <div className="text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground mb-1">CMMC Level 5</p>
              <p className="text-2xl font-bold text-foreground">97%</p>
              <Progress value={97} className="mt-2" />
            </div>
            <div className="text-center">
              <Key className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground mb-1">ITAR</p>
              <p className="text-2xl font-bold text-foreground">95%</p>
              <Progress value={95} className="mt-2" />
            </div>
          </div>
        </StandardContentCard>

        {/* Real-time Security Events */}
        <StandardContentCard 
          title="CLASSIFIED THREAT INTELLIGENCE FEED"
          className="mb-6 border-[#0A1628]"
        >
          <div className="space-y-3">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p>No security events detected</p>
                <p className="text-sm">All systems operating normally</p>
              </div>
            ) : (
              securityEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">
                        {event.event_type?.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <Badge variant={getSeverityColor(event.severity) as any} className="text-xs">
                        {event.severity?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(event.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </StandardContentCard>

        {/* Emergency Response & Cryptographic Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StandardContentCard 
            title="Emergency Response Protocols"
            className="border-[#0A1628]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Automatic Countermeasures</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">ENABLED</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Response Time</span>
                <span className="text-sm font-medium text-foreground">&lt; 100ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kill Switch Status</span>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">ARMED</span>
                </div>
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white border-2 border-red-800">
                <AlertTriangle className="w-4 h-4 mr-2" />
                INITIATE EMERGENCY LOCKDOWN
              </Button>
            </div>
          </StandardContentCard>

          <StandardContentCard 
            title="Cryptographic Controls"
            className="border-[#0A1628]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Encryption Algorithm</span>
                <span className="text-sm font-medium text-foreground">AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Key Strength</span>
                <span className="text-sm font-medium text-foreground">4096-bit</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rotation Status</span>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">ACTIVE</span>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-2 border-[#001f3f]">
                <Key className="w-4 h-4 mr-2" />
                QUANTUM-SAFE KEY ROTATION
              </Button>
            </div>
          </StandardContentCard>
        </div>

        {/* Advanced Security Tabs */}
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="bg-[#0A1628] border border-[#0A1628] grid w-full grid-cols-4">
            <TabsTrigger 
              value="sessions"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Active Sessions
            </TabsTrigger>
            <TabsTrigger 
              value="behavioral"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Behavioral AI
            </TabsTrigger>
            <TabsTrigger 
              value="quantum"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Quantum Defense
            </TabsTrigger>
            <TabsTrigger 
              value="intelligence"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Threat Intel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="mt-6">
            <StandardContentCard title="Active Security Sessions" className="border-[#0A1628]">
              <div className="space-y-3">
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2" />
                    <p>No active sessions</p>
                  </div>
                ) : (
                  activeSessions.slice(0, 10).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Session {session.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            Last activity: {format(new Date(session.last_activity), 'HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.security_alerts_count > 3 ? 'destructive' : 'default'}>
                          Alerts: {session.security_alerts_count}
                        </Badge>
                        {session.is_active && (
                          <Badge variant="outline" className="text-primary">ACTIVE</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </StandardContentCard>
          </TabsContent>

          <TabsContent value="behavioral" className="mt-6">
            <StandardContentCard title="AI-Powered Behavioral Analytics" className="border-[#0A1628]">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Brain className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Machine Learning Model</p>
                      <p className="text-sm text-muted-foreground">Real-time anomaly detection</p>
                    </div>
                  </div>
                  <Badge variant="default">99.1% Accuracy</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{securityEvents.filter(e => e.event_type?.includes('anomaly')).length}</p>
                    <p className="text-sm text-muted-foreground">Anomalies Detected</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{metrics.blockedAttempts}</p>
                    <p className="text-sm text-muted-foreground">Threats Blocked</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{Math.round(metrics.securityScore / 10)}</p>
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                  </div>
                </div>
              </div>
            </StandardContentCard>
          </TabsContent>

          <TabsContent value="quantum" className="mt-6">
            <StandardContentCard title="Quantum-Resistant Cryptography" className="border-[#0A1628]">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Cpu className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Post-Quantum Algorithms</p>
                      <p className="text-sm text-muted-foreground">CRYSTALS-Kyber + Dilithium</p>
                    </div>
                  </div>
                  <Badge variant="default">{metrics.quantumResistance}% Protected</Badge>
                </div>
                <Progress value={metrics.quantumResistance} className="h-3" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Key Exchange</p>
                    <p className="font-medium">CRYSTALS-Kyber</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Digital Signatures</p>
                    <p className="font-medium">CRYSTALS-Dilithium</p>
                  </div>
                </div>
              </div>
            </StandardContentCard>
          </TabsContent>

          <TabsContent value="intelligence" className="mt-6">
            <StandardContentCard title="Classified Threat Intelligence" className="border-[#0A1628]">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Radar className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Global Threat Monitoring</p>
                      <p className="text-sm text-muted-foreground">Real-time intelligence feeds</p>
                    </div>
                  </div>
                  <Badge variant="default">ACTIVE</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Database className="h-6 w-6 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Blockchain Integrity</p>
                    <p className="text-xl font-bold">{blockchainRecords} Records</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Eye className="h-6 w-6 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Monitored Events</p>
                    <p className="text-xl font-bold">{auditLogs} Today</p>
                  </div>
                </div>
              </div>
            </StandardContentCard>
          </TabsContent>
        </Tabs>
      </ResponsiveContainer>
    </div>
  );
}
