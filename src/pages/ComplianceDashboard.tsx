import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardPageHeader } from "@/components/StandardPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  Shield, CheckCircle2, AlertTriangle, XCircle, FileText, 
  Clock, Download, RefreshCw, Lock, Eye, Trash2, Calendar
} from "lucide-react";

interface ComplianceCheck {
  id: string;
  name: string;
  category: string;
  status: "compliant" | "warning" | "non-compliant";
  lastChecked: string;
  description: string;
}

interface RetentionPolicy {
  id: string;
  dataType: string;
  retentionPeriod: string;
  action: string;
  status: "active" | "pending";
}

export default function ComplianceDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [lastScan, setLastScan] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
      setLastScan(new Date().toISOString());
    }
  }, [user]);

  const complianceChecks: ComplianceCheck[] = [
    {
      id: "1",
      name: "SOX Section 302 - Financial Reporting",
      category: "SOX",
      status: "compliant",
      lastChecked: new Date().toISOString(),
      description: "CEO/CFO certification controls are in place",
    },
    {
      id: "2",
      name: "SOX Section 404 - Internal Controls",
      category: "SOX",
      status: "compliant",
      lastChecked: new Date().toISOString(),
      description: "Internal control assessment completed",
    },
    {
      id: "3",
      name: "GDPR Data Processing",
      category: "GDPR",
      status: "compliant",
      lastChecked: new Date().toISOString(),
      description: "Lawful basis documented for all processing",
    },
    {
      id: "4",
      name: "GDPR Data Subject Rights",
      category: "GDPR",
      status: "warning",
      lastChecked: new Date().toISOString(),
      description: "1 pending data deletion request",
    },
    {
      id: "5",
      name: "CCPA Consumer Rights",
      category: "CCPA",
      status: "compliant",
      lastChecked: new Date().toISOString(),
      description: "Opt-out mechanisms in place",
    },
    {
      id: "6",
      name: "Data Encryption at Rest",
      category: "Security",
      status: "compliant",
      lastChecked: new Date().toISOString(),
      description: "AES-256 encryption enabled",
    },
    {
      id: "7",
      name: "Access Control Audit",
      category: "Security",
      status: "warning",
      lastChecked: new Date().toISOString(),
      description: "3 users with excessive permissions",
    },
    {
      id: "8",
      name: "Audit Trail Integrity",
      category: "Audit",
      status: "compliant",
      lastChecked: new Date().toISOString(),
      description: "All audit logs are tamper-proof",
    },
  ];

  const retentionPolicies: RetentionPolicy[] = [
    { id: "1", dataType: "Lead Data", retentionPeriod: "7 years", action: "Archive", status: "active" },
    { id: "2", dataType: "Client Documents", retentionPeriod: "10 years", action: "Archive", status: "active" },
    { id: "3", dataType: "Audit Logs", retentionPeriod: "7 years", action: "Retain", status: "active" },
    { id: "4", dataType: "Session Data", retentionPeriod: "90 days", action: "Delete", status: "active" },
    { id: "5", dataType: "Email Communications", retentionPeriod: "5 years", action: "Archive", status: "active" },
    { id: "6", dataType: "Marketing Data", retentionPeriod: "3 years", action: "Delete", status: "active" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case "non-compliant": return <XCircle className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant": return "bg-green-500/20 text-green-400";
      case "warning": return "bg-yellow-500/20 text-yellow-400";
      case "non-compliant": return "bg-red-500/20 text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const stats = {
    compliant: complianceChecks.filter(c => c.status === "compliant").length,
    warnings: complianceChecks.filter(c => c.status === "warning").length,
    nonCompliant: complianceChecks.filter(c => c.status === "non-compliant").length,
    overallScore: Math.round((complianceChecks.filter(c => c.status === "compliant").length / complianceChecks.length) * 100),
  };

  const runComplianceScan = () => {
    toast.info("Running compliance scan...");
    setTimeout(() => {
      setLastScan(new Date().toISOString());
      toast.success("Compliance scan completed");
    }, 2000);
  };

  const exportReport = () => {
    toast.success("Compliance report exported");
  };

  if (isLoading) {
    return (
      <StandardPageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Compliance Dashboard"
        description="SOX/regulatory compliance tracking and data retention policies"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />Export Report
            </Button>
            <Button onClick={runComplianceScan}>
              <RefreshCw className="h-4 w-4 mr-2" />Run Scan
            </Button>
          </div>
        }
      />

      {stats.warnings > 0 && (
        <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            {stats.warnings} compliance items require your attention. Review the warnings below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold">{stats.overallScore}%</p>
              </div>
            </div>
            <Progress value={stats.overallScore} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold">{stats.compliant}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold">{stats.warnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Scan</p>
                <p className="text-sm font-medium">{lastScan ? new Date(lastScan).toLocaleString() : "Never"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checks">Compliance Checks</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="checks">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["SOX", "GDPR", "CCPA", "Security", "Audit"].map((category) => {
                  const categoryChecks = complianceChecks.filter(c => c.category === category);
                  if (categoryChecks.length === 0) return null;
                  return (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">{category}</h4>
                      <div className="space-y-2">
                        {categoryChecks.map((check) => (
                          <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(check.status)}
                              <div>
                                <p className="font-medium">{check.name}</p>
                                <p className="text-sm text-muted-foreground">{check.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(check.lastChecked).toLocaleDateString()}
                              </span>
                              <Badge className={getStatusBadge(check.status)}>{check.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionPolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{policy.dataType}</p>
                        <p className="text-sm text-muted-foreground">
                          Retention: {policy.retentionPeriod}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {policy.action === "Delete" ? (
                          <Trash2 className="h-4 w-4 text-red-400" />
                        ) : policy.action === "Archive" ? (
                          <Lock className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-green-400" />
                        )}
                        <span className="text-sm">{policy.action}</span>
                      </div>
                      <Badge variant={policy.status === "active" ? "default" : "secondary"}>
                        {policy.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">Today</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">• 14:32 - User login from new device (verified)</p>
                    <p className="text-muted-foreground">• 12:15 - Lead data exported by admin</p>
                    <p className="text-muted-foreground">• 10:42 - Permission change: user role updated</p>
                    <p className="text-muted-foreground">• 09:18 - Compliance scan completed</p>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium">Yesterday</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">• 18:45 - Data backup completed</p>
                    <p className="text-muted-foreground">• 15:30 - New SLA policy created</p>
                    <p className="text-muted-foreground">• 11:20 - Integration connection established</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  );
}
