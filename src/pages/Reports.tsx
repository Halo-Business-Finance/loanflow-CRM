import React, { useState } from 'react';

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
    <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Business Intelligence Center</h1>
          <p className="text-muted-foreground ml-4">
            Advanced analytics, reporting, and performance insights
          </p>
        </div>

        {/* Reports Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="w-5 h-5" />
                    <p className="text-lg font-bold">{overview.totalReports}</p>
                  </div>
                </div>
                <Badge variant="default">
                  AVAILABLE
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Accuracy</p>
                  <p className="text-2xl font-bold text-primary">{overview.dataAccuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing Time</p>
                  <p className="text-2xl font-bold text-primary">{overview.processingTime}s</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                  <p className="text-2xl font-bold text-primary">{overview.complianceScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Alerts */}
        {overview.alertsActive > 0 && (
          <Alert className="border-secondary">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {overview.alertsActive} active alerts require attention in your reports.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Report Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
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
  );
}