import React from 'react';
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
  RefreshCw
} from 'lucide-react';

const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <SecurityWrapper>
        <div className="space-y-6 animate-fade-in">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Enterprise Security Center</h1>
            <p className="text-muted-foreground mt-2">
              World-class enterprise security monitoring, threat detection, and multi-factor authentication for SBA and Commercial loan CRM
            </p>
          </div>

          {/* Security Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-card border-0 shadow-lg hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Security Status</p>
                    <p className="text-2xl font-bold text-green-600">Secure</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-lg hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Monitors</p>
                    <p className="text-2xl font-bold text-foreground">4</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-lg hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Threats Blocked</p>
                    <p className="text-2xl font-bold text-foreground">127</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-lg hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">MFA Status</p>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mb-6">
            <Button className="flex items-center gap-2" variant="outline">
              <RefreshCw className="h-4 w-4" />
              Refresh Security Status
            </Button>
          </div>

          <Tabs defaultValue="monitoring" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-card border-0 shadow-sm">
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Live Security Monitoring
              </TabsTrigger>
              <TabsTrigger value="access-control" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Data Access Control
              </TabsTrigger>
              <TabsTrigger value="mfa" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Microsoft Authenticator MFA
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Security Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitoring" className="space-y-6">
              <EnhancedSecurityMonitor />
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card border-0 shadow-lg hover-scale">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Bot className="h-5 w-5 text-blue-600" />
                      AI Protection Monitor
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Persistent AI security monitoring with behavioral analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PersistentAISecurityMonitor />
                  </CardContent>
                </Card>

                <Card className="bg-card border-0 shadow-lg hover-scale">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Globe className="h-5 w-5 text-red-600" />
                      Dark Web Security Bot
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Continuous dark web monitoring and threat detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DarkWebSecurityBot />
                  </CardContent>
                </Card>

                <Card className="bg-card border-0 shadow-lg hover-scale">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Advanced Threat Detection
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Real-time AI threat monitoring and behavioral analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdvancedThreatDetection />
                  </CardContent>
                </Card>

                <Card className="bg-card border-0 shadow-lg hover-scale">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Target className="h-5 w-5 text-orange-600" />
                      Hacker Detection Bot
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Advanced hacker detection and intrusion prevention
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ThreatDetectionMonitor />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="access-control" className="space-y-6">
              <SensitiveDataPermissionManager />
            </TabsContent>

            <TabsContent value="mfa" className="space-y-6">
              <Card className="bg-card border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Smartphone className="h-5 w-5 text-green-600" />
                    Microsoft Authenticator Integration
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Set up multi-factor authentication using Microsoft Authenticator for enhanced security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MicrosoftAuthenticatorSetup />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="bg-card border-0 shadow-lg rounded-lg">
                <EnhancedSecurityDashboard />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SecurityWrapper>
    </div>
  );
};

export default SecurityPage;