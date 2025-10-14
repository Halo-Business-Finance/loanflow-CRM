import React, { useState } from 'react';
import { StandardPageLayout } from '@/components/StandardPageLayout';
import { StandardPageHeader } from '@/components/StandardPageHeader';
import { StandardKPICard } from '@/components/StandardKPICard';
import { StandardContentCard } from '@/components/StandardContentCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users,
  FileText,
  Download,
  Calendar,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useReportsData } from '@/hooks/useReportsData';

interface ReportsOverview {
  totalReports: number;
  generatedToday: number;
  scheduledReports: number;
  dataAccuracy: number;
  processingTime: number;
  storageUsed: number;
  complianceScore: number;
  alertsActive: number;
}

export default function Reports() {
  const { reportData, monthlyData, topPerformers, loading, refetch } = useReportsData();
  const [overview] = useState<ReportsOverview>({
    totalReports: 147,
    generatedToday: 12,
    scheduledReports: 8,
    dataAccuracy: 98.7,
    processingTime: 1.4,
    storageUsed: 2.8,
    complianceScore: 95,
    alertsActive: 3
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Enterprise Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Business Intelligence Center
              </h1>
            </div>
            <p className="text-muted-foreground">
              Advanced analytics, reporting, and performance insights
            </p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="widget-glass widget-glow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">TOTAL</Badge>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Reports</h3>
              <p className="text-2xl font-bold text-foreground">{overview.totalReports}</p>
            </CardContent>
          </Card>
          
          <Card className="widget-glass widget-glow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">ACCURACY</Badge>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Data Accuracy</h3>
              <p className="text-2xl font-bold text-foreground">{overview.dataAccuracy}%</p>
            </CardContent>
          </Card>
          
          <Card className="widget-glass widget-glow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">SPEED</Badge>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Processing Time</h3>
              <p className="text-2xl font-bold text-foreground">{overview.processingTime}s</p>
            </CardContent>
          </Card>
          
          <Card className="widget-glass widget-glow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">COMPLIANCE</Badge>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Compliance Score</h3>
              <p className="text-2xl font-bold text-foreground">{overview.complianceScore}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Alerts */}
        {overview.alertsActive > 0 && (
          <Alert className="widget-glass border-warning/50">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertDescription>
              <strong>{overview.alertsActive} active alerts</strong> require attention in your reports.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-muted/50 backdrop-blur-sm rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all py-3 text-sm font-medium">
              Report Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all py-3 text-sm font-medium">
              Performance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all py-3 text-sm font-medium">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all py-3 text-sm font-medium">
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="widget-glass border-0">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-xs">REVENUE</Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold">
                    Revenue Analytics
                  </CardTitle>
                  <CardDescription>
                    Monthly revenue tracking and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Revenue</span>
                      <span className="font-semibold">{reportData?.loanVolume?.thisMonth || '$0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monthly Growth</span>
                      <span className="font-semibold">{reportData?.loanVolume?.growth || '0%'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Deal Size</span>
                      <span className="font-semibold text-green-600">{reportData?.loanVolume?.target || '$0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Lead Performance
                  </CardTitle>
                  <CardDescription>
                    Lead generation and conversion analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Leads</span>
                      <span className="font-semibold">{reportData?.applications?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="font-semibold">{reportData?.applications?.approvalRate || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Quality Score</span>
                      <span className="font-semibold text-blue-600">8.4/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Quick Report Generation
                </CardTitle>
                <CardDescription>
                  Generate standard business reports instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="w-full gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    Revenue Report
                  </Button>
                  <Button className="w-full gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    Lead Analysis
                  </Button>
                  <Button className="w-full gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    Performance Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    Goal Achievement
                  </CardTitle>
                  <CardDescription>
                    Performance against set targets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Revenue Target</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Lead Generation</span>
                      <span className="font-semibold">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                      <span className="font-semibold text-green-600">96%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-teal-500" />
                    Time-Based Metrics
                  </CardTitle>
                  <CardDescription>
                    Efficiency and timing analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Response Time</span>
                      <span className="font-semibold">{overview.processingTime}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Deal Closure Time</span>
                      <span className="font-semibold">28 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Follow-up Rate</span>
                      <span className="font-semibold text-teal-600">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                    Data Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.dataAccuracy}%</div>
                  <p className="text-sm text-muted-foreground">Data accuracy</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-pink-500" />
                    Processing Speed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.processingTime}s</div>
                  <p className="text-sm text-muted-foreground">Avg processing time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Cost Efficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0.12</div>
                  <p className="text-sm text-muted-foreground">Cost per report</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Compliance Dashboard
                </CardTitle>
                <CardDescription>
                  Regulatory compliance and audit readiness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="text-sm font-medium">SOX Compliance</span>
                    <span className="font-bold text-green-600">{overview.complianceScore}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="text-sm font-medium">Data Retention</span>
                    <span className="font-bold text-blue-600">98%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="text-sm font-medium">Security Score</span>
                    <span className="font-bold text-purple-600">97%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="text-sm font-medium">Audit Readiness</span>
                    <span className="font-bold text-orange-600">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}