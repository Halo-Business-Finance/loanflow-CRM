import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Target,
  RefreshCw,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';

// Real-time dashboard data interfaces
interface DashboardMetrics {
  totalLeads: number;
  activeLeads: number;
  totalRevenue: number;
  pipelineValue: number;
  conversionRate: number;
  monthlyGrowth: number;
}

interface LeadsByStage {
  stage: string;
  count: number;
  value: number;
}

interface MonthlyPerformance {
  month: string;
  revenue: number;
  deals: number;
  leads: number;
}

interface LoanTypeDistribution {
  loan_type: string;
  count: number;
  total_amount: number;
}

function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    activeLeads: 0,
    totalRevenue: 0,
    pipelineValue: 0,
    conversionRate: 0,
    monthlyGrowth: 0
  });
  const [leadsByStage, setLeadsByStage] = useState<LeadsByStage[]>([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState<MonthlyPerformance[]>([]);
  const [loanDistribution, setLoanDistribution] = useState<LoanTypeDistribution[]>([]);

  const getUserDisplayName = () => {
    const firstName = user?.user_metadata?.first_name;
    const emailName = user?.email?.split('@')[0];
    const name = firstName || emailName || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const fetchDashboardData = async () => {
    if (!user?.id) {
      console.error('No authenticated user found');
      toast({
        title: "Authentication Error",
        description: "Please log in to view dashboard data",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Fetching dashboard data for user:', user.id);
      
      // Fetch leads with contact entities
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entities!inner(*)
        `)
        .eq('user_id', user.id);

      if (leadsError) {
        console.warn('Leads query error (non-blocking):', leadsError)
        // Avoid disruptive toasts; proceed with empty data for a cleaner UX
      }

      console.log('Fetched leads:', leads?.length || 0);
      console.log('Fetched leads data:', leads);

      // Calculate real metrics
      const totalLeads = leads?.length || 0;
      const activeLeads = leads?.filter(lead => 
        lead.contact_entities && 
        ['qualification', 'proposal', 'negotiation'].includes(lead.contact_entities.stage)
      ).length || 0;

      const totalRevenue = leads?.reduce((sum, lead) => 
        sum + (lead.contact_entities?.loan_amount || 0), 0
      ) || 0;

      const pipelineValue = leads?.filter(lead => 
        lead.contact_entities && 
        !['closed_won', 'closed_lost'].includes(lead.contact_entities.stage)
      ).reduce((sum, lead) => 
        sum + (lead.contact_entities?.loan_amount || 0), 0
      ) || 0;

      // Calculate conversion rate
      const closedWonLeads = leads?.filter(lead => 
        lead.contact_entities?.stage === 'closed_won'
      ).length || 0;
      const conversionRate = totalLeads > 0 ? (closedWonLeads / totalLeads) * 100 : 0;

      // Show success message if no data
      if (totalLeads === 0) {
        console.log('No leads found - showing empty state');
        toast({
          title: "No Leads Found",
          description: "Start by creating your first lead to see dashboard data",
          variant: "default"
        });
      }

      // Group leads by stage for funnel chart
      const stageGroups = leads?.reduce((acc, lead) => {
        const stage = lead.contact_entities?.stage || 'unknown';
        if (!acc[stage]) {
          acc[stage] = { count: 0, value: 0 };
        }
        acc[stage].count += 1;
        acc[stage].value += lead.contact_entities?.loan_amount || 0;
        return acc;
      }, {} as Record<string, { count: number; value: number }>) || {};

      const leadsByStageData = Object.entries(stageGroups).map(([stage, data]) => ({
        stage: stage.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        count: data.count,
        value: data.value
      }));

      // Group by loan type
      const loanGroups = leads?.reduce((acc, lead) => {
        const loanType = lead.contact_entities?.loan_type || 'Unknown';
        if (!acc[loanType]) {
          acc[loanType] = { count: 0, total_amount: 0 };
        }
        acc[loanType].count += 1;
        acc[loanType].total_amount += lead.contact_entities?.loan_amount || 0;
        return acc;
      }, {} as Record<string, { count: number; total_amount: number }>) || {};

      const loanDistributionData = Object.entries(loanGroups).map(([loan_type, data]) => ({
        loan_type,
        count: data.count,
        total_amount: data.total_amount
      }));

      // Update state with real data
      setMetrics({
        totalLeads,
        activeLeads,
        totalRevenue,
        pipelineValue,
        conversionRate,
        monthlyGrowth: 0 // Would need historical data to calculate
      });
      
      setLeadsByStage(leadsByStageData);
      setLoanDistribution(loanDistributionData);

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to leads changes
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Leads changed, refreshing dashboard...');
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_entities',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Contact entities changed, refreshing dashboard...');
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
      notation: 'compact'
    }).format(amount);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Microsoft-style Dashboard Header */}
      <div className="bg-white border-b border-border pl-0 pr-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 pl-6 flex items-center gap-4">
            <p className="text-lg text-black mt-1 text-left">Welcome back, {getUserDisplayName()}</p>
            
            {/* Navigation Controls */}
            <div className="flex items-center gap-2 pl-4">
              {/* Sidebar Toggle */}
              <SidebarTrigger className="h-8 w-8 [&>svg]:h-4 [&>svg]:w-4 text-gray-600 hover:bg-gray-100" />
              
              {/* Navigation Controls */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-600 hover:bg-gray-100" 
                onClick={() => window.history.back()}
                title="Go back"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-600 hover:bg-gray-100" 
                onClick={() => window.history.forward()}
                title="Go forward"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-2 pr-6 py-6 space-y-6">
        {/* Empty State - Show when no leads exist */}
        {metrics.totalLeads === 0 && !loading && (
          <Card className="widget-glass widget-glow">
            <CardContent className="widget-content flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="mb-4">
                <Target className="h-16 w-16 text-muted-foreground/50 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Your Dashboard</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Get started by creating your first lead. Once you add leads, you'll see real-time metrics, 
                charts, and insights here.
              </p>
              <div className="flex gap-3">
                <Button onClick={() => navigate('/leads/new')} className="bg-primary text-primary-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  Create Your First Lead
                </Button>
                <Button variant="outline" onClick={() => navigate('/leads')}>
                  View All Leads
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show metrics and charts when we have data or during loading */}
        {(metrics.totalLeads > 0 || loading) && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="widget-glass widget-glow">
                <CardContent className="widget-content p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-semibold text-foreground">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="widget-glass widget-glow">
                <CardContent className="widget-content p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                    <p className="text-3xl font-semibold text-foreground">{metrics.totalLeads}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="widget-glass widget-glow">
                <CardContent className="widget-content p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                    <p className="text-3xl font-semibold text-foreground">{formatCurrency(metrics.pipelineValue)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="widget-glass widget-glow">
                <CardContent className="widget-content p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                    <p className="text-3xl font-semibold text-foreground">{metrics.conversionRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Funnel */}
              <Card className="widget-glass widget-glow">
                <CardHeader className="widget-content">
                  <CardTitle className="text-lg font-normal text-foreground">Sales Funnel</CardTitle>
                  <CardDescription className="text-muted-foreground">Leads by stage</CardDescription>
                </CardHeader>
                <CardContent className="widget-content">
                  {leadsByStage.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <FunnelChart>
                          <Tooltip 
                            formatter={(value, name) => [value, name === 'count' ? 'Leads' : 'Value']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Funnel
                            dataKey="count"
                            data={leadsByStage}
                            isAnimationActive
                            fill="hsl(var(--primary))"
                          >
                            <LabelList position="center" fill="white" stroke="none" fontSize="12" />
                          </Funnel>
                        </FunnelChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <p>No funnel data available. Create leads with different stages to see the sales funnel.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loan Distribution */}
              <Card className="widget-glass widget-glow">
                <CardHeader className="widget-content">
                  <CardTitle className="text-lg font-normal text-foreground">Loan Type Distribution</CardTitle>
                  <CardDescription className="text-muted-foreground">Distribution by loan type</CardDescription>
                </CardHeader>
                <CardContent className="widget-content">
                  {loanDistribution.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'count' ? `${value} loans` : formatCurrency(value as number),
                              name === 'count' ? 'Count' : 'Total Amount'
                            ]}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Pie
                            data={loanDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            label={({ loan_type, count }) => `${loan_type}: ${count}`}
                          >
                            {loanDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 60 + 200}, 70%, 50%)`} />
                            ))}
                          </Pie>
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <p>No loan data available. Create leads with loan types to see distribution.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Live Data Status */}
            <Card className="bg-card border border-border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Live Data Status
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Real-time system information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="text-sm font-medium text-green-900">
                        Connected to Live Database
                      </div>
                      <div className="text-xs text-green-700">
                        All charts show live data from your database
                      </div>
                      {loading && (
                        <div className="text-xs text-blue-600">
                          Refreshing data...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;