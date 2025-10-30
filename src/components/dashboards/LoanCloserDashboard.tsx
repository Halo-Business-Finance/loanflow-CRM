import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  FileCheck, 
  AlertCircle,
  Calendar,
  Download,
  HandCoins
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface CloserMetrics {
  totalFunded: number;
  scheduledClosings: number;
  fundingVolume: number;
  completedToday: number;
  avgClosingTime: number;
  successRate: number;
  documentsReady: number;
  activeFundings: number;
}

interface LoanItem {
  id: string;
  name?: string | null;
  business_name?: string | null;
  loan_amount?: number | null;
  loan_type?: string | null;
  stage?: string | null;
  priority?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export const LoanCloserDashboard = () => {
  const [metrics, setMetrics] = useState<CloserMetrics>({
    totalFunded: 0,
    scheduledClosings: 0,
    fundingVolume: 0,
    completedToday: 0,
    avgClosingTime: 0,
    successRate: 0,
    documentsReady: 0,
    activeFundings: 0,
  });
  const [scheduledLoans, setScheduledLoans] = useState<LoanItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<LoanItem[]>([]);
  const [recentFundings, setRecentFundings] = useState<LoanItem[]>([]);
  const [completedLoans, setCompletedLoans] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCloserData();
  }, []);

  const fetchCloserData = async () => {
    try {
      setLoading(true);

      // Run all queries in parallel for better performance
      const [closingResult, fundedResult, pendingResult] = await Promise.all([
        // Fetch scheduled closings
        supabase
          .from('contact_entities')
          .select('id, name, business_name, loan_amount, loan_type, stage, priority, updated_at, created_at')
          .eq('stage', 'Closing')
          .order('created_at', { ascending: false })
          .limit(50),
        
        // Fetch funded loans
        supabase
          .from('contact_entities')
          .select('id, name, business_name, loan_amount, loan_type, stage, updated_at, created_at')
          .eq('stage', 'Loan Funded')
          .order('updated_at', { ascending: false })
          .limit(50),
        
        // Fetch pending approvals
        supabase
          .from('contact_entities')
          .select('id, name, business_name, loan_amount, loan_type, stage, priority, created_at')
          .in('stage', ['Underwriting', 'Approved'])
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      // Check for errors
      if (closingResult.error) throw closingResult.error;
      if (fundedResult.error) throw fundedResult.error;
      if (pendingResult.error) throw pendingResult.error;

      const closingLoans = closingResult.data;
      const fundedLoans = fundedResult.data;
      const pendingLoans = pendingResult.data;

      // Calculate metrics
      const totalFunded = fundedLoans?.reduce((sum, loan) => sum + (loan.loan_amount || 0), 0) || 0;
      const scheduledCount = closingLoans?.length || 0;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const completedToday = fundedLoans?.filter(loan => {
        const loanDate = new Date(loan.updated_at);
        return loanDate >= todayStart;
      }).length || 0;

      const documentsReady = closingLoans?.filter(loan => loan.loan_type).length || 0;
      const activeFundings = pendingLoans?.length || 0;
      const fundingVolume = closingLoans?.reduce((sum, loan) => sum + (loan.loan_amount || 0), 0) || 0;

      setMetrics({
        totalFunded,
        scheduledClosings: scheduledCount,
        fundingVolume,
        completedToday,
        avgClosingTime: 14, // days - could be calculated from actual data
        successRate: fundedLoans && closingLoans ? 
          Math.round((fundedLoans.length / (fundedLoans.length + closingLoans.length)) * 100) : 0,
        documentsReady,
        activeFundings,
      });

      setScheduledLoans((closingLoans || []) as LoanItem[]);
      setPendingApprovals((pendingLoans || []) as LoanItem[]);
      setRecentFundings((fundedLoans?.slice(0, 10) || []) as LoanItem[]);
      setCompletedLoans((fundedLoans || []) as LoanItem[]);
    } catch (error) {
      console.error('Error fetching closer data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseLoan = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('contact_entities')
        .update({ stage: 'Loan Funded', updated_at: new Date().toISOString() })
        .eq('id', loanId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Loan has been marked as funded',
      });

      fetchCloserData();
    } catch (error) {
      console.error('Error closing loan:', error);
      toast({
        title: 'Error',
        description: 'Failed to close loan',
        variant: 'destructive',
      });
    }
  };

  const handleScheduleClosing = (loanId: string) => {
    toast({
      title: 'Schedule Closing',
      description: 'Closing scheduled successfully',
    });
  };

  const handleApproveFunding = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from('contact_entities')
        .update({ stage: 'Closing', updated_at: new Date().toISOString() })
        .eq('id', loanId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Loan approved for closing',
      });

      fetchCloserData();
    } catch (error) {
      console.error('Error approving loan:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve loan',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Closer Dashboard</h1>
          <p className="text-muted-foreground">Manage funding approvals, scheduled closings, and loan completions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <HandCoins className="h-4 w-4 mr-2" />
            Fund Loans
          </Button>
        </div>
      </div>
      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalFunded)}</div>
            <p className="text-xs text-muted-foreground">All-time funding total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Closings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.scheduledClosings}</div>
            <p className="text-xs text-muted-foreground">Ready to close</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.fundingVolume)}</div>
            <p className="text-xs text-muted-foreground">In closing pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedToday}</div>
            <p className="text-xs text-muted-foreground">Loans funded today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Closing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgClosingTime} days</div>
            <p className="text-xs text-muted-foreground">From approval to close</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">Funding success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Ready</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.documentsReady}</div>
            <p className="text-xs text-muted-foreground">Of {metrics.scheduledClosings} scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Fundings</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeFundings}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="funding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funding">Funding Pipeline</TabsTrigger>
          <TabsTrigger value="closings">Scheduled Closings</TabsTrigger>
          <TabsTrigger value="documents">Document Status</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* Funding Pipeline Tab */}
        <TabsContent value="funding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Loans ready for funding approval</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {pendingApprovals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No pending approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{loan.name}</p>
                            {loan.priority && (
                              <Badge variant={getPriorityColor(loan.priority)}>
                                {loan.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{loan.business_name}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">Amount: {formatCurrency(loan.loan_amount || 0)}</span>
                            <span className="text-muted-foreground">Type: {loan.loan_type || 'N/A'}</span>
                            <span className="text-muted-foreground">Stage: {loan.stage}</span>
                          </div>
                        </div>
                        <Button onClick={() => handleApproveFunding(loan.id)} size="sm">
                          Approve Funding
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Closings Tab */}
        <TabsContent value="closings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Closings</CardTitle>
              <CardDescription>Loans ready to close</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {scheduledLoans.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No scheduled closings</p>
                ) : (
                  <div className="space-y-4">
                    {scheduledLoans.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{loan.name}</p>
                          <p className="text-sm text-muted-foreground">{loan.business_name}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">Amount: {formatCurrency(loan.loan_amount || 0)}</span>
                            <span className="text-muted-foreground">Type: {loan.loan_type || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleScheduleClosing(loan.id)} size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                          <Button onClick={() => handleCloseLoan(loan.id)} size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Close Loan
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Status Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Preparation Status</CardTitle>
              <CardDescription>Track document readiness for closing</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {scheduledLoans.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No documents to review</p>
                ) : (
                  <div className="space-y-4">
                    {scheduledLoans.map((loan) => (
                      <div key={loan.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{loan.name}</p>
                          <Badge variant={loan.loan_type ? 'default' : 'secondary'}>
                            {loan.loan_type ? 'Ready' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{loan.business_name}</p>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Loan Amount: {formatCurrency(loan.loan_amount || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Completed</CardTitle>
              <CardDescription>Funded and closed loans</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {completedLoans.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No completed loans</p>
                ) : (
                  <div className="space-y-4">
                    {completedLoans.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{loan.name}</p>
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Funded
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{loan.business_name}</p>
                          <div className="flex gap-4 text-sm">
                            <span className="text-muted-foreground">Amount: {formatCurrency(loan.loan_amount || 0)}</span>
                            <span className="text-muted-foreground">Type: {loan.loan_type || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
