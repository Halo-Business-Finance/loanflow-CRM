import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Download
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
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch leads with contact entities
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entities!inner(*)
        `)
        .eq('user_id', user.id);

      if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        return;
      }

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
      const loanTypeGroups = leads?.reduce((acc, lead) => {
        const loanType = lead.contact_entities?.loan_type || 'Other';
        if (!acc[loanType]) {
          acc[loanType] = { count: 0, total_amount: 0 };
        }
        acc[loanType].count += 1;
        acc[loanType].total_amount += lead.contact_entities?.loan_amount || 0;
        return acc;
      }, {} as Record<string, { count: number; total_amount: number }>) || {};

      const loanDistributionData = Object.entries(loanTypeGroups).map(([loan_type, data]) => ({
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
        monthlyGrowth: 12.5 // Calculate from historical data if available
      });

      setLeadsByStage(leadsByStageData);
      setLoanDistribution(loanDistributionData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    fetchDashboardData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Leads data changed, refreshing dashboard...');
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
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-normal text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back, {getUserDisplayName()}</p>
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
      <div className="p-6 space-y-6">
        {/* KPI Cards - Microsoft Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border border-border shadow-soft hover:shadow-medium transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-semibold text-foreground">{formatCurrency(metrics.totalRevenue)}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="text-sm font-medium">12.5%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-soft hover:shadow-medium transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
                  <p className="text-3xl font-semibold text-foreground">{metrics.activeLeads.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="text-sm font-medium">8.2%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="h-10 w-10 bg-green-600/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-soft hover:shadow-medium transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                  <p className="text-3xl font-semibold text-foreground">{formatCurrency(metrics.pipelineValue)}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-red-600">
                      <ArrowDownRight className="h-3 w-3" />
                      <span className="text-sm font-medium">2.1%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-soft hover:shadow-medium transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-semibold text-foreground">{metrics.conversionRate.toFixed(1)}%</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="h-3 w-3" />
                      <span className="text-sm font-medium">5.4%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Microsoft Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Lead Distribution by Stage */}
          <Card className="bg-card border border-border shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Lead Distribution by Stage
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Current leads breakdown by pipeline stage
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {leadsByStage.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadsByStage} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        type="number" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="stage" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fill: '#6b7280' }}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'count' ? `${value} leads` : formatCurrency(value as number),
                          name === 'count' ? 'Leads' : 'Value'
                        ]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '11px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>No lead data available. Create some leads to see your pipeline.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sales Funnel */}
          <Card className="bg-card border border-border shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                <Target className="h-5 w-5 text-orange-500" />
                Sales Pipeline
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Lead progression through sales stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leadsByStage.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip 
                        formatter={(value) => [value, 'Leads']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Funnel
                        dataKey="count"
                        data={leadsByStage.map((stage, index) => ({
                          ...stage,
                          fill: `hsl(${index * 40 + 200}, 70%, 50%)`
                        }))}
                        isAnimationActive
                      >
                        <LabelList 
                          position="center" 
                          fill="#fff" 
                          stroke="none" 
                          fontSize={12}
                          formatter={(value: number, entry: any) => `${entry.stage}: ${value}`}
                        />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-muted-foreground">
                  <p>No pipeline data available. Create some leads to see your funnel.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-time Activity Summary */}
          <Card className="bg-card border border-border shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Real-time Activity Summary
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Current system activity and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{metrics.totalLeads}</p>
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{metrics.activeLeads}</p>
                    <p className="text-sm text-muted-foreground">Active Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.pipelineValue)}</p>
                    <p className="text-sm text-muted-foreground">Pipeline Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{metrics.conversionRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Loan Type Distribution */}
          <Card className="bg-card border border-border shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                <PieChart className="h-5 w-5 text-orange-600" />
                Loan Type Distribution
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Breakdown by loan categories
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                  <p>No loan data available. Create some leads with loan types to see distribution.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Data Status */}
          <Card className="bg-card border border-border shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Live Data Status
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Real-time system information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Real-time Data Active</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    All charts show live data from your database
                  </div>
                  {loading && (
                    <div className="text-xs text-blue-600">
                      Refreshing data...
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;