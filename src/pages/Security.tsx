import React, { useState, useEffect } from 'react';
import { EnhancedSecurityDashboard } from '@/components/security/EnhancedSecurityDashboard';
import { PersistentAISecurityMonitor } from '@/components/security/PersistentAISecurityMonitor';
import { DarkWebSecurityBot } from '@/components/security/DarkWebSecurityBot';
import { AdvancedThreatDetection } from '@/components/security/AdvancedThreatDetection';
import { ThreatDetectionMonitor } from '@/components/security/ThreatDetectionMonitor';
import { SensitiveDataPermissionManager } from '@/components/security/SensitiveDataPermissionManager';
import { MicrosoftAuthenticatorSetup } from '@/components/auth/MicrosoftAuthenticatorSetup';
import { EnhancedSecurityMonitor } from '@/components/security/EnhancedSecurityMonitor';
import { SecurityWrapper } from '@/components/SecurityWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Bot, 
  Globe, 
  Zap, 
  Target, 
  Smartphone, 
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Activity,
  Radio,
  Server,
  Database,
  Network,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const [securityScore, setSecurityScore] = useState(96);
  const [activeThreats, setActiveThreats] = useState(0);
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'critical'>('operational');

  useEffect(() => {
    // Simulate real-time security monitoring
    const interval = setInterval(() => {
      setSecurityScore(prev => Math.min(100, prev + (Math.random() - 0.3) * 2));
    }, 5000);
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
    <div className="min-h-screen bg-background">
      <SecurityWrapper>
        <div className="mx-auto max-w-[1800px] space-y-10 p-8 animate-fade-in">
          {/* Enterprise Header */}
          <div className="flex items-start justify-between border-b border-border pb-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                Enterprise Security Center
              </h1>
              <p className="text-base text-muted-foreground">
                Military-grade security monitoring and threat intelligence
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="h-9"
              >
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Security Score Header */}
          <Card className="border shadow-sm">
            <CardContent className="p-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-3">
                      Overall Security Posture
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
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Uptime</p>
                      <p className="text-2xl font-semibold">99.99%</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Compliance</p>
                      <p className="text-2xl font-semibold">100%</p>
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
            </CardContent>
          </Card>

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
                <p className="text-3xl font-semibold">6</p>
                <p className="text-xs text-muted-foreground">Real-time tracking</p>
              </CardContent>
            </Card>

            <Card 
              className="border shadow-sm cursor-pointer group transition-all duration-200 hover:shadow-md hover:border-primary/50"
              onClick={() => navigate('/security/threats')}
            >
              <CardContent className="p-6 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Threats Blocked</p>
                <p className="text-3xl font-semibold">127</p>
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
            <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full max-w-2xl">
              <TabsTrigger 
                value="monitoring" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Live Monitoring
              </TabsTrigger>
              <TabsTrigger 
                value="access-control" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Access Control
              </TabsTrigger>
              <TabsTrigger 
                value="mfa" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                MFA Setup
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                Command Center
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

            <TabsContent value="dashboard" className="space-y-6 mt-6">
              <EnhancedSecurityDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </SecurityWrapper>
    </div>
  );
};

export default SecurityPage;