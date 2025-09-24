import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Activity, 
  Key, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  Users,
  Brain,
  FileText,
  Zap,
  Lock,
  Radar,
  Crosshair,
  Target,
  Command,
  Globe,
  Satellite,
  Fingerprint,
  Cpu,
  Radio
} from "lucide-react";

interface MilitarySecurityMetrics {
  threatLevel: 'DEFCON-1' | 'DEFCON-2' | 'DEFCON-3' | 'DEFCON-4' | 'DEFCON-5';
  quantumResistance: number;
  zeroTrustScore: number;
  behavioralAnalytics: {
    anomalies: number;
    riskScore: number;
    modelAccuracy: number;
  };
  cryptographicStatus: {
    algorithm: string;
    keyStrength: number;
    rotationStatus: string;
  };
  complianceFrameworks: {
    fisma: number;
    fedramp: number;
    cmmc: number;
    itar: number;
  };
  emergencyProtocols: {
    active: boolean;
    responseTime: string;
    automaticCountermeasures: boolean;
  };
}

export function EnterpriseSecurityDashboard() {
  const [metrics, setMetrics] = useState<MilitarySecurityMetrics>({
    threatLevel: 'DEFCON-3',
    quantumResistance: 98.7,
    zeroTrustScore: 96.2,
    behavioralAnalytics: {
      anomalies: 3,
      riskScore: 15,
      modelAccuracy: 99.1
    },
    cryptographicStatus: {
      algorithm: 'AES-256-GCM + CRYSTALS-Kyber',
      keyStrength: 4096,
      rotationStatus: 'ACTIVE'
    },
    complianceFrameworks: {
      fisma: 100,
      fedramp: 98,
      cmmc: 97,
      itar: 95
    },
    emergencyProtocols: {
      active: true,
      responseTime: '< 100ms',
      automaticCountermeasures: true
    }
  });

  const [realTimeAlerts, setRealTimeAlerts] = useState([
    {
      id: 1,
      type: 'QUANTUM_THREAT',
      severity: 'HIGH',
      message: 'Quantum decryption attempt detected and neutralized',
      timestamp: new Date(Date.now() - 300000),
      status: 'MITIGATED'
    },
    {
      id: 2,
      type: 'ZERO_TRUST_VIOLATION',
      severity: 'MEDIUM',
      message: 'Device fingerprint anomaly in session validation',
      timestamp: new Date(Date.now() - 600000),
      status: 'INVESTIGATING'
    },
    {
      id: 3,
      type: 'BEHAVIORAL_ANOMALY',
      severity: 'LOW',
      message: 'Unusual access pattern detected for user agent activities',
      timestamp: new Date(Date.now() - 900000),
      status: 'MONITORING'
    }
  ]);

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
    switch (severity) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'default';
      default: return 'outline';
    }
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        zeroTrustScore: prev.zeroTrustScore + (Math.random() - 0.5) * 0.5,
        behavioralAnalytics: {
          ...prev.behavioralAnalytics,
          riskScore: Math.max(0, prev.behavioralAnalytics.riskScore + (Math.random() - 0.5) * 2)
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white">
      <div className="flex items-center gap-3 mb-6">
        <Command className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          ENTERPRISE SECURITY COMMAND CENTER
        </h1>
        <Badge variant="destructive" className="ml-auto text-lg px-4 py-2">
          {metrics.threatLevel}
        </Badge>
      </div>

      {/* Critical Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-slate-800/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Threat Level</p>
                <div className="flex items-center gap-2 mt-1">
                  <Radar className="w-6 h-6 text-primary animate-pulse" />
                  <p className="text-2xl font-bold text-primary">{metrics.threatLevel}</p>
                </div>
              </div>
              <Badge variant={getThreatLevelColor(metrics.threatLevel)} className="text-lg px-3 py-1">
                ACTIVE
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-slate-800/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Zero Trust Score</p>
                <p className="text-2xl font-bold text-green-400">{metrics.zeroTrustScore.toFixed(1)}%</p>
                <Progress value={metrics.zeroTrustScore} className="w-full mt-2" />
              </div>
              <Crosshair className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-slate-800/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Quantum Resistance</p>
                <p className="text-2xl font-bold text-blue-400">{metrics.quantumResistance}%</p>
                <Progress value={metrics.quantumResistance} className="w-full mt-2" />
              </div>
              <Cpu className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">AI Risk Score</p>
                <p className="text-2xl font-bold text-purple-400">{metrics.behavioralAnalytics.riskScore.toFixed(0)}</p>
                <p className="text-xs text-purple-300">{metrics.behavioralAnalytics.modelAccuracy}% accuracy</p>
              </div>
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Framework Status */}
      <Card className="border-primary/20 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Globe className="h-5 w-5" />
            Government Compliance Frameworks
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-slate-300">FISMA</p>
            <p className="text-2xl font-bold text-green-400">{metrics.complianceFrameworks.fisma}%</p>
            <Progress value={metrics.complianceFrameworks.fisma} className="mt-1" />
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-300">FedRAMP</p>
            <p className="text-2xl font-bold text-green-400">{metrics.complianceFrameworks.fedramp}%</p>
            <Progress value={metrics.complianceFrameworks.fedramp} className="mt-1" />
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-300">CMMC Level 5</p>
            <p className="text-2xl font-bold text-yellow-400">{metrics.complianceFrameworks.cmmc}%</p>
            <Progress value={metrics.complianceFrameworks.cmmc} className="mt-1" />
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-300">ITAR</p>
            <p className="text-2xl font-bold text-yellow-400">{metrics.complianceFrameworks.itar}%</p>
            <Progress value={metrics.complianceFrameworks.itar} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      {/* Real-time Security Alerts */}
      <Card className="border-red-500/20 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Satellite className="h-5 w-5 text-red-400" />
            CLASSIFIED THREAT INTELLIGENCE FEED
          </CardTitle>
          <CardDescription className="text-slate-300">
            Real-time security events and automated responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {realTimeAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{alert.message}</p>
                  <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  {alert.timestamp.toLocaleString()} • Type: {alert.type}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {alert.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Response Protocols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-red-500/20 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-red-400" />
              Emergency Response Protocols
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Automatic Countermeasures</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">ENABLED</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Response Time</span>
              <span className="text-sm font-medium text-blue-400">{metrics.emergencyProtocols.responseTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Kill Switch Status</span>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">ARMED</span>
              </div>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" variant="destructive">
              <AlertTriangle className="w-4 h-4 mr-2" />
              INITIATE EMERGENCY LOCKDOWN
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="h-5 w-5 text-blue-400" />
              Cryptographic Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Encryption Algorithm</span>
              <span className="text-sm font-medium text-blue-400">{metrics.cryptographicStatus.algorithm}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Key Strength</span>
              <span className="text-sm font-medium text-blue-400">{metrics.cryptographicStatus.keyStrength}-bit</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Rotation Status</span>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-400 animate-pulse" />
                <span className="text-sm font-medium text-green-400">{metrics.cryptographicStatus.rotationStatus}</span>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Key className="w-4 h-4 mr-2" />
              QUANTUM-SAFE KEY ROTATION
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Security Tabs */}
      <Tabs defaultValue="behavioral" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="behavioral" className="text-white">Behavioral AI</TabsTrigger>
          <TabsTrigger value="quantum" className="text-white">Quantum Defense</TabsTrigger>
          <TabsTrigger value="zerotrust" className="text-white">Zero Trust</TabsTrigger>
          <TabsTrigger value="intelligence" className="text-white">Threat Intel</TabsTrigger>
        </TabsList>

        <TabsContent value="behavioral" className="mt-6">
          <Card className="border-purple-500/20 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">AI-Powered Behavioral Analytics</CardTitle>
              <CardDescription className="text-slate-300">
                Machine learning models monitoring user behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-400">{metrics.behavioralAnalytics.anomalies}</p>
                  <p className="text-sm text-slate-300">Active Anomalies</p>
                </div>
                <div className="text-center">
                  <Eye className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-400">{metrics.behavioralAnalytics.modelAccuracy}%</p>
                  <p className="text-sm text-slate-300">Model Accuracy</p>
                </div>
                <div className="text-center">
                  <Fingerprint className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-400">24/7</p>
                  <p className="text-sm text-slate-300">Continuous Monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quantum" className="mt-6">
          <Card className="border-blue-500/20 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Quantum-Resistant Cryptography</CardTitle>
              <CardDescription className="text-slate-300">
                Post-quantum cryptographic algorithms protecting against future threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-blue-500/20 bg-blue-500/10">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    CRYSTALS-Kyber and CRYSTALS-Dilithium algorithms active for quantum-resistant encryption
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Key Encapsulation</h4>
                    <p className="text-sm text-slate-300">CRYSTALS-Kyber 1024-bit</p>
                    <Progress value={98.7} className="mt-2" />
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Digital Signatures</h4>
                    <p className="text-sm text-slate-300">CRYSTALS-Dilithium</p>
                    <Progress value={99.1} className="mt-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zerotrust" className="mt-6">
          <Card className="border-green-500/20 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Zero Trust Architecture</CardTitle>
              <CardDescription className="text-slate-300">
                Never trust, always verify - continuous validation of every access request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-green-400">100%</p>
                    <p className="text-sm text-slate-300">Micro-segmentation</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-blue-400">MFA+</p>
                    <p className="text-sm text-slate-300">Multi-Factor Auth</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-lg font-bold text-purple-400">Real-time</p>
                    <p className="text-sm text-slate-300">Risk Assessment</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence" className="mt-6">
          <Card className="border-red-500/20 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Threat Intelligence Integration</CardTitle>
              <CardDescription className="text-slate-300">
                Real-time feeds from government and military threat intelligence sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-red-500/20 bg-red-500/10">
                  <Satellite className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    Connected to classified threat intelligence feeds • Last update: 3 minutes ago
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Active Threats</h4>
                    <p className="text-2xl font-bold text-red-400">147</p>
                    <p className="text-sm text-slate-300">Blocked in last 24h</p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Intelligence Sources</h4>
                    <p className="text-2xl font-bold text-green-400">8</p>
                    <p className="text-sm text-slate-300">Active feeds</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}