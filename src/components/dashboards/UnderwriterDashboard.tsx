import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  FileCheck,
  Users,
  PieChart,
  BarChart3,
  Calculator,
  Eye,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { TeamCollaboration } from '@/components/collaboration/TeamCollaboration';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { UnderwriterDocuments } from './UnderwriterDocuments';

interface UnderwriterMetrics {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
  avgReviewTime: number;
  approvalRate: number;
}

export const UnderwriterDashboard = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<UnderwriterMetrics>({
    pendingReviews: 0,
    approvedToday: 0,
    rejectedToday: 0,
    avgReviewTime: 1.8,
    approvalRate: 0
  });
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnderwriterData();
  }, []);

  const fetchUnderwriterData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch applications pending underwriting
      const { data: pendingData } = await supabase
        .from('contact_entities')
        .select('*')
        .in('stage', ['Pre-approval', 'Documentation']);

      // Fetch today's approvals
      const { data: approvedToday } = await supabase
        .from('contact_entities')
        .select('id')
        .eq('stage', 'Closing')
        .gte('updated_at', today);

      // Fetch total processed applications
      const { data: totalProcessed } = await supabase
        .from('contact_entities')
        .select('id, stage')
        .in('stage', ['Closing', 'Loan Funded']);

      setPendingReviews(pendingData || []);
      
      const approvedCount = approvedToday?.length || 0;
      const totalCount = (pendingData?.length || 0) + (totalProcessed?.length || 0);
      const approvalRate = totalCount > 0 ? Math.round(((totalProcessed?.length || 0) / totalCount) * 100) : 0;

      setMetrics({
        pendingReviews: pendingData?.length || 0,
        approvedToday: approvedCount,
        rejectedToday: 0, // Would need a rejected status to track this
        avgReviewTime: 1.8,
        approvalRate
      });

    } catch (error) {
      console.error('Error fetching underwriter data:', error);
      toast({
        title: "Error",
        description: "Failed to load underwriter dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      await supabase
        .from('contact_entities')
        .update({ 
          stage: 'Closing',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      toast({
        title: "Application Approved",
        description: "Application moved to closing stage",
      });
      
      fetchUnderwriterData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await supabase
        .from('contact_entities')
        .update({ 
          stage: 'Rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      toast({
        title: "Application Rejected",
        description: "Application has been rejected",
        variant: "destructive"
      });
      
      fetchUnderwriterData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading underwriter dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-card/60 to-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Underwriter Dashboard</h1>
            <p className="text-sm text-muted-foreground">Review and approve loan applications</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.pendingReviews)}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNumber(metrics.approvedToday)}</div>
            <p className="text-xs text-muted-foreground">Applications approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatNumber(metrics.rejectedToday)}</div>
            <p className="text-xs text-muted-foreground">Applications rejected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Review Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgReviewTime} days</div>
            <p className="text-xs text-muted-foreground">Average review time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">Applications approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
          <TabsTrigger value="documents">Documents & Files</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="analytics">Review Analytics</TabsTrigger>
          <TabsTrigger value="loan-tools">Loan Analysis Tools</TabsTrigger>
          <TabsTrigger value="charts">Charts & Visualizations</TabsTrigger>
          <TabsTrigger value="advanced-analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="collaboration">Team Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications Awaiting Underwriting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReviews.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{app.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(app.loan_amount || 0)} • {app.loan_type || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={app.stage === 'Pre-approval' ? 'secondary' : 'outline'}>
                          {app.stage}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Credit Score: {app.credit_score || 'N/A'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Income: {formatCurrency(app.income || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReject(app.id)}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(app.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingReviews.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications pending review
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <UnderwriterDocuments />
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Low Risk</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {pendingReviews.filter(app => (app.credit_score || 0) >= 700).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Applications</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium">Medium Risk</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {pendingReviews.filter(app => (app.credit_score || 0) >= 600 && (app.credit_score || 0) < 700).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Applications</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium">High Risk</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {pendingReviews.filter(app => (app.credit_score || 0) < 600).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Applications</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Underwriting Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Approval Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.approvalRate} className="w-24" />
                    <span className="text-sm">{metrics.approvalRate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Review Time</span>
                  <span className="text-sm font-medium">{metrics.avgReviewTime} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Applications Processed Today</span>
                  <span className="text-sm font-medium">{metrics.approvedToday + metrics.rejectedToday}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loan-tools" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debt-to-Income Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Debt-to-Income Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Monthly Income</label>
                      <div className="text-lg font-semibold text-green-600">$8,500</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Monthly Debt</label>
                      <div className="text-lg font-semibold text-red-600">$3,200</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">DTI Ratio</div>
                    <div className="text-2xl font-bold text-orange-600">37.6%</div>
                    <Progress value={37.6} className="mt-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recommended max DTI: 43% for conventional loans
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan-to-Value Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Loan-to-Value Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Loan Amount</label>
                      <div className="text-lg font-semibold text-blue-600">$320,000</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Property Value</label>
                      <div className="text-lg font-semibold text-green-600">$400,000</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">LTV Ratio</div>
                    <div className="text-2xl font-bold text-blue-600">80%</div>
                    <Progress value={80} className="mt-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Standard conventional loan max: 80% LTV
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Credit Score Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Credit Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>FICO Score</span>
                    <span className="text-2xl font-bold text-green-600">742</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payment History (35%)</span>
                      <span className="text-green-600">Excellent</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Credit Utilization (30%)</span>
                      <span className="text-yellow-600">Good (22%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Length of History (15%)</span>
                      <span className="text-green-600">Excellent</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Credit Mix (10%)</span>
                      <span className="text-green-600">Good</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>New Credit (10%)</span>
                      <span className="text-green-600">Good</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment Matrix */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Risk Assessment Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-red-100 text-red-800 rounded text-center font-medium">
                      High Risk
                    </div>
                    <div className="p-2 bg-yellow-100 text-yellow-800 rounded text-center font-medium">
                      Medium Risk
                    </div>
                    <div className="p-2 bg-green-100 text-green-800 rounded text-center font-medium">
                      Low Risk
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Risk Score</span>
                      <Badge variant="secondary" className="text-green-800">
                        Low Risk
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Based on credit score (742), DTI (37.6%), LTV (80%), and employment history
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1">
                      Recommend Approval
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Request More Info
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Applications by Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Low Risk', value: pendingReviews.filter(app => (app.credit_score || 0) >= 700).length, fill: '#22c55e' },
                        { name: 'Medium Risk', value: pendingReviews.filter(app => (app.credit_score || 0) >= 600 && (app.credit_score || 0) < 700).length, fill: '#eab308' },
                        { name: 'High Risk', value: pendingReviews.filter(app => (app.credit_score || 0) < 600).length, fill: '#ef4444' }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({name, value}) => `${name}: ${value}`}
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#eab308" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Loan Amounts Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Loan Amount Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { range: '$0-100K', count: pendingReviews.filter(app => (app.loan_amount || 0) <= 100000).length },
                    { range: '$100K-250K', count: pendingReviews.filter(app => (app.loan_amount || 0) > 100000 && (app.loan_amount || 0) <= 250000).length },
                    { range: '$250K-500K', count: pendingReviews.filter(app => (app.loan_amount || 0) > 250000 && (app.loan_amount || 0) <= 500000).length },
                    { range: '$500K+', count: pendingReviews.filter(app => (app.loan_amount || 0) > 500000).length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Approval Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Approval Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', approved: 45, rejected: 12 },
                    { month: 'Feb', approved: 52, rejected: 8 },
                    { month: 'Mar', approved: 48, rejected: 15 },
                    { month: 'Apr', approved: 61, rejected: 9 },
                    { month: 'May', approved: 55, rejected: 11 },
                    { month: 'Jun', approved: 67, rejected: 7 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="approved" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Credit Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AreaChart className="h-5 w-5" />
                  Credit Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { score: '300-579', count: pendingReviews.filter(app => (app.credit_score || 0) >= 300 && (app.credit_score || 0) < 580).length },
                    { score: '580-669', count: pendingReviews.filter(app => (app.credit_score || 0) >= 580 && (app.credit_score || 0) < 670).length },
                    { score: '670-739', count: pendingReviews.filter(app => (app.credit_score || 0) >= 670 && (app.credit_score || 0) < 740).length },
                    { score: '740-799', count: pendingReviews.filter(app => (app.credit_score || 0) >= 740 && (app.credit_score || 0) < 800).length },
                    { score: '800+', count: pendingReviews.filter(app => (app.credit_score || 0) >= 800).length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="score" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced-analytics" className="space-y-4">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <TeamCollaboration />
        </TabsContent>
      </Tabs>
    </div>
  );
};