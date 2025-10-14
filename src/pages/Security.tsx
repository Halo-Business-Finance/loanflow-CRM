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
        <div className="space-y-8 p-8 animate-fade-in">
          {/* Enterprise Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Enterprise Security Center
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Military-grade security monitoring and threat intelligence
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline" 
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Badge 
                variant={systemStatus === 'operational' ? 'default' : 'destructive'}
                className="px-4 py-2 text-sm font-semibold"
              >
                <Radio className="h-3 w-3 mr-2 animate-pulse" />
                {systemStatus.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Security Score Header */}
          <Card className="widget-glass widget-glow border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Overall Security Posture
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-foreground">
                          {securityScore.toFixed(1)}
                        </span>
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <Shield className="h-16 w-16 text-primary opacity-20" />
                  </div>
                  <Progress value={securityScore} className="h-3" />
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Encryption</p>
                      <p className="text-xl font-bold text-primary">AES-256</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                      <p className="text-xl font-bold text-primary">99.99%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Compliance</p>
                      <p className="text-xl font-bold text-primary">100%</p>
                    </div>
                  </div>
                </div>
                <Separator orientation="vertical" className="hidden lg:block" />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    System Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Database</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-primary" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Network</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-primary" />
                        Secured
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Monitoring</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-primary" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">MFA</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1 text-primary" />
                        Enforced
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              className="widget-glass widget-glow border-0 cursor-pointer group transition-all duration-300"
              onClick={() => navigate('/security/compliance')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    ACTIVE
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Security Status</h3>
                <p className="text-2xl font-bold text-foreground">Optimal</p>
                <Progress value={98} className="h-1 mt-3" />
              </CardContent>
            </Card>

            <Card 
              className="widget-glass widget-glow border-0 cursor-pointer group transition-all duration-300"
              onClick={() => navigate('/security/audit')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    LIVE
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Monitors</h3>
                <p className="text-2xl font-bold text-foreground">6</p>
                <p className="text-xs text-muted-foreground mt-2">Real-time tracking</p>
              </CardContent>
            </Card>

            <Card 
              className="widget-glass widget-glow border-0 cursor-pointer group transition-all duration-300"
              onClick={() => navigate('/security/threats')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-destructive/10 ring-1 ring-destructive/20 group-hover:bg-destructive/20 transition-colors">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    24H
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Threats Blocked</h3>
                <p className="text-2xl font-bold text-foreground">127</p>
                <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card 
              className="widget-glass widget-glow border-0 cursor-pointer group transition-all duration-300"
              onClick={() => navigate('/security/access')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    ENFORCED
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">MFA Status</h3>
                <p className="text-2xl font-bold text-foreground">Active</p>
                <Progress value={100} className="h-1 mt-3" />
              </CardContent>
            </Card>
          </div>

          {/* Security Modules Tabs */}
          <Tabs defaultValue="monitoring" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-muted/50 backdrop-blur-sm rounded-lg">
              <TabsTrigger 
                value="monitoring" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all py-3 text-sm font-medium"
              >
                <Activity className="h-4 w-4 mr-2" />
                Live Monitoring
              </TabsTrigger>
              <TabsTrigger 
                value="access-control" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all py-3 text-sm font-medium"
              >
                <Database className="h-4 w-4 mr-2" />
                Access Control
              </TabsTrigger>
              <TabsTrigger 
                value="mfa" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all py-3 text-sm font-medium"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                MFA Setup
              </TabsTrigger>
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all py-3 text-sm font-medium"
              >
                <Shield className="h-4 w-4 mr-2" />
                Command Center
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring" className="space-y-6">
              <Card className="widget-glass border-0">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Real-Time Security Monitoring
                  </CardTitle>
                  <CardDescription>
                    Enterprise-grade threat detection and response system
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <EnhancedSecurityMonitor />
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card 
                  className="widget-glass border-0 hover-scale cursor-pointer group transition-all"
                  onClick={() => navigate('/security/threats')}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs">AI-POWERED</Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold">
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
                  className="widget-glass border-0 hover-scale cursor-pointer group transition-all"
                  onClick={() => navigate('/security/threats')}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-destructive/10 ring-1 ring-destructive/20 group-hover:bg-destructive/20 transition-colors">
                        <Globe className="h-5 w-5 text-destructive" />
                      </div>
                      <Badge variant="outline" className="text-xs">THREAT INTEL</Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold">
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
                  className="widget-glass border-0 hover-scale cursor-pointer group transition-all"
                  onClick={() => navigate('/security/threats')}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-warning/10 ring-1 ring-warning/20 group-hover:bg-warning/20 transition-colors">
                        <Zap className="h-5 w-5 text-warning" />
                      </div>
                      <Badge variant="outline" className="text-xs">REAL-TIME</Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold">
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
                  className="widget-glass border-0 hover-scale cursor-pointer group transition-all"
                  onClick={() => navigate('/security/threats')}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-destructive/10 ring-1 ring-destructive/20 group-hover:bg-destructive/20 transition-colors">
                        <Target className="h-5 w-5 text-destructive" />
                      </div>
                      <Badge variant="outline" className="text-xs">INTRUSION</Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold">
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

            <TabsContent value="access-control" className="space-y-6">
              <Card className="widget-glass border-0">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">RBAC</Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Data Access Control Management
                  </CardTitle>
                  <CardDescription>
                    Role-based access control and sensitive data permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SensitiveDataPermissionManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mfa" className="space-y-6">
              <Card className="widget-glass border-0">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">REQUIRED</Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold">
                    Multi-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Configure Microsoft Authenticator for enhanced account security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MicrosoftAuthenticatorSetup />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <EnhancedSecurityDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </SecurityWrapper>
    </div>
  );
};

export default SecurityPage;