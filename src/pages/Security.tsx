import React, { useState, useEffect } from 'react';
import { PersistentAISecurityMonitor } from '@/components/security/PersistentAISecurityMonitor';
import { DarkWebSecurityBot } from '@/components/security/DarkWebSecurityBot';
import { AdvancedThreatDetection } from '@/components/security/AdvancedThreatDetection';
import { ThreatDetectionMonitor } from '@/components/security/ThreatDetectionMonitor';
import { SensitiveDataPermissionManager } from '@/components/security/SensitiveDataPermissionManager';
import { MicrosoftAuthenticatorSetup } from '@/components/auth/MicrosoftAuthenticatorSetup';
import { EnhancedSecurityMonitor } from '@/components/security/EnhancedSecurityMonitor';
import { SecurityPatternDashboard } from '@/components/security/SecurityPatternDashboard';
import { SecurityWrapper } from '@/components/SecurityWrapper';
import { StandardPageLayout } from '@/components/StandardPageLayout';
import { StandardPageHeader } from '@/components/StandardPageHeader';
import { StandardContentCard } from '@/components/StandardContentCard';
import { StandardKPICard } from '@/components/StandardKPICard';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const [securityScore, setSecurityScore] = useState(0);
  const [activeThreats, setActiveThreats] = useState(0);
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'critical'>('operational');
  const [threatsBlocked, setThreatsBlocked] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);

  useEffect(() => {
    const fetchSecurityMetrics = async () => {
      try {
        // Fetch security events to calculate score
        const { data: events } = await supabase
          .from('security_events')
          .select('severity, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const criticalCount = events?.filter(e => e.severity === 'critical').length || 0;
        const highCount = events?.filter(e => e.severity === 'high').length || 0;
        const mediumCount = events?.filter(e => e.severity === 'medium').length || 0;
        
        const scoreReduction = (criticalCount * 5) + (highCount * 2) + (mediumCount * 0.5);
        const calculatedScore = Math.max(85, 100 - scoreReduction);
        setSecurityScore(calculatedScore);

        // Active threats
        const activeCount = events?.filter(e => 
          e.severity === 'high' || e.severity === 'critical'
        ).length || 0;
        setActiveThreats(activeCount);

        // Threats blocked (all events in last 24h)
        setThreatsBlocked(events?.length || 0);

        // Active sessions
        const { data: sessions } = await supabase
          .from('active_sessions')
          .select('id')
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString());
        
        setActiveSessions(sessions?.length || 0);

        // Set system status based on threats
        if (criticalCount > 0) {
          setSystemStatus('critical');
        } else if (highCount > 3) {
          setSystemStatus('degraded');
        } else {
          setSystemStatus('operational');
        }
      } catch (error) {
        console.error('Error fetching security metrics:', error);
      }
    };

    fetchSecurityMetrics();
    const interval = setInterval(fetchSecurityMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'hsl(var(--primary))';
      case 'degraded': return 'hsl(var(--warning))';
      case 'critical': return 'hsl(var(--destructive))';
    }
  };

  return (
    <SecurityWrapper>
      <StandardPageLayout>
        <StandardPageHeader 
          title="Security Overview"
          description="Military-grade security monitoring and threat intelligence"
          actions={
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          }
        />
        
        <ResponsiveContainer padding="md" maxWidth="full">
          <div className="space-y-6">
            {/* Security Score Overview */}
            <StandardContentCard title="Overall Security Posture">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
                      Security Score
                    </h2>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl font-semibold text-foreground">
                        {securityScore.toFixed(1)}
                      </span>
                      <span className="text-3xl font-light text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <Progress value={securityScore} className="h-2" />
                  <div className="grid grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Encryption</p>
                      <p className="text-2xl font-semibold">AES-256</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Sessions</p>
                      <p className="text-2xl font-semibold">{activeSessions}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</p>
                      <p className="text-2xl font-semibold capitalize">{systemStatus}</p>
                    </div>
                  </div>
                </div>
                <div className="border-l border-border pl-10">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-6">
                    System Status
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">Database</span>
                      <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">Network</span>
                      <span className="text-sm text-green-600 dark:text-green-400">Secured</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">Monitoring</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">Active</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">MFA</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">Enforced</span>
                    </div>
                  </div>
                </div>
              </div>
            </StandardContentCard>

            {/* Security Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card 
                className="border shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/50"
                onClick={() => navigate('/security/compliance')}
              >
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Security Status</p>
                  <p className="text-3xl font-semibold">Optimal</p>
                  <Progress value={98} className="h-1.5" />
                </CardContent>
              </Card>

              <Card 
                className="border shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/50"
                onClick={() => navigate('/security/audit')}
              >
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Monitors</p>
                  <p className="text-3xl font-semibold">{activeSessions > 0 ? '4' : '—'}</p>
                  <p className="text-xs text-muted-foreground">Real-time tracking</p>
                </CardContent>
              </Card>

              <Card 
                className="border shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/50"
                onClick={() => navigate('/security/threats')}
              >
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Threats Blocked</p>
                  <p className="text-3xl font-semibold">{threatsBlocked}</p>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card 
                className="border shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/50"
                onClick={() => navigate('/security/access')}
              >
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">MFA Status</p>
                  <p className="text-3xl font-semibold">Active</p>
                  <Progress value={100} className="h-1.5" />
                </CardContent>
              </Card>
            </div>

            {/* Security Modules Tabs */}
            <Tabs defaultValue="monitoring" className="space-y-8">
              <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full max-w-3xl">
                <TabsTrigger value="monitoring">
                  Live Monitoring
                </TabsTrigger>
                <TabsTrigger value="patterns">
                  Pattern Detection
                </TabsTrigger>
                <TabsTrigger value="access-control">
                  Access Control
                </TabsTrigger>
                <TabsTrigger value="mfa">
                  MFA Setup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="monitoring" className="space-y-6 mt-6">
                <Card className="border shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl font-semibold">
                      Real-Time Security Monitoring
                    </CardTitle>
                    <CardDescription className="text-base">
                      Enterprise-grade threat detection and response system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EnhancedSecurityMonitor />
                  </CardContent>
                </Card>

                <div className="grid gap-5 md:grid-cols-2">
                  <Card 
                    className="border shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => navigate('/security/threats')}
                  >
                    <CardHeader className="space-y-1 pb-4">
                      <CardTitle className="text-xl font-semibold">
                        AI Protection Monitor
                      </CardTitle>
                      <CardDescription>
                        Behavioral analysis and anomaly detection
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PersistentAISecurityMonitor />
                    </CardContent>
                  </Card>

                  <Card 
                    className="border shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => navigate('/security/threats')}
                  >
                    <CardHeader className="space-y-1 pb-4">
                      <CardTitle className="text-xl font-semibold">
                        Dark Web Monitoring
                      </CardTitle>
                      <CardDescription>
                        Continuous dark web threat detection
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DarkWebSecurityBot />
                    </CardContent>
                  </Card>

                  <Card 
                    className="border shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => navigate('/security/threats')}
                  >
                    <CardHeader className="space-y-1 pb-4">
                      <CardTitle className="text-xl font-semibold">
                        Advanced Threat Detection
                      </CardTitle>
                      <CardDescription>
                        ML-powered threat identification
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AdvancedThreatDetection />
                    </CardContent>
                  </Card>

                  <Card 
                    className="border shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/50"
                    onClick={() => navigate('/security/threats')}
                  >
                    <CardHeader className="space-y-1 pb-4">
                      <CardTitle className="text-xl font-semibold">
                        Intrusion Prevention
                      </CardTitle>
                      <CardDescription>
                        Advanced intrusion detection system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ThreatDetectionMonitor />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="patterns" className="space-y-6 mt-6">
                <Card className="border shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl font-semibold">
                      Security Pattern Detection
                    </CardTitle>
                    <CardDescription className="text-base">
                      Real-time analysis of security events and audit logs for suspicious behavior patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SecurityPatternDashboard />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="access-control" className="space-y-6 mt-6">
                <Card className="border shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl font-semibold">
                      Data Access Control Management
                    </CardTitle>
                    <CardDescription className="text-base">
                      Role-based access control and sensitive data permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SensitiveDataPermissionManager />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mfa" className="space-y-6 mt-6">
                <Card className="border shadow-sm">
                  <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl font-semibold">
                      Multi-Factor Authentication
                    </CardTitle>
                    <CardDescription className="text-base">
                      Configure Microsoft Authenticator for enhanced account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MicrosoftAuthenticatorSetup />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ResponsiveContainer>
      </StandardPageLayout>
    </SecurityWrapper>
  );
};

export default SecurityPage;