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

// Sample data for the dashboard widgets
const performanceData = [
  { name: 'Lead Generation', value: 85 },
  { name: 'Conversion Rate', value: 72 },
  { name: 'Customer Retention', value: 91 },
  { name: 'Revenue Growth', value: 68 },
  { name: 'Market Share', value: 76 }
];

const funnelData = [
  { name: 'Prospects', value: 1000, fill: 'hsl(var(--primary))' },
  { name: 'Qualified Leads', value: 750, fill: 'hsl(var(--primary-glow))' },
  { name: 'Proposals', value: 500, fill: 'hsl(207 90% 60%)' },
  { name: 'Negotiations', value: 250, fill: 'hsl(var(--primary-glow))' },
  { name: 'Closed Deals', value: 100, fill: 'hsl(var(--primary))' }
];

const monthlyData = [
  { month: 'Jan', revenue: 45000, deals: 12, target: 50000 },
  { month: 'Feb', revenue: 52000, deals: 15, target: 55000 },
  { month: 'Mar', revenue: 48000, deals: 13, target: 52000 },
  { month: 'Apr', revenue: 67000, deals: 18, target: 60000 },
  { month: 'May', revenue: 71000, deals: 20, target: 70000 },
  { month: 'Jun', revenue: 89000, deals: 24, target: 75000 }
];

const distributionData = [
  { name: 'SBA Loans', value: 45, fill: 'hsl(var(--primary))' },
  { name: 'Commercial', value: 30, fill: '#7c3aed' },
  { name: 'Real Estate', value: 20, fill: '#059669' },
  { name: 'Equipment', value: 5, fill: '#dc2626' }
];

const regionData = [
  { name: 'West Coast', value: 35, fill: 'hsl(var(--primary))' },
  { name: 'East Coast', value: 28, fill: '#7c3aed' },
  { name: 'Midwest', value: 22, fill: '#059669' },
  { name: 'South', value: 15, fill: '#dc2626' }
];

function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(3600000);
  const [pipelineValue, setPipelineValue] = useState(2100000);

  const getUserDisplayName = () => {
    const firstName = user?.user_metadata?.first_name;
    const emailName = user?.email?.split('@')[0];
    const name = firstName || emailName || 'User';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch leads data for real metrics
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entities(loan_amount, stage)
        `)
        .eq('user_id', user?.id);

      if (!leadsError && leads) {
        const totalLoanAmount = leads.reduce((sum, lead) => 
          sum + (lead.contact_entities?.loan_amount || 0), 0
        );
        
        if (totalLoanAmount > 0) {
          setTotalRevenue(totalLoanAmount);
          setPipelineValue(totalLoanAmount * 0.6);
        }
      }

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

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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
                  <p className="text-3xl font-semibold text-foreground">{formatCurrency(totalRevenue)}</p>
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
                  <p className="text-3xl font-semibold text-foreground">1,247</p>
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
                  <p className="text-3xl font-semibold text-foreground">{formatCurrency(pipelineValue)}</p>
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
                  <p className="text-3xl font-semibold text-foreground">24.8%</p>
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
          
          {/* Performance Metrics */}
          <Card className="bg-card border border-border shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Key performance indicators across departments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#6b7280' }}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Performance']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '11px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sales Funnel */}
          <Card className="bg-card border border-border shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                <Target className="h-5 w-5 text-orange-500" />
                Sales Funnel
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Lead progression through sales stages
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      dataKey="value"
                      data={funnelData}
                      isAnimationActive
                    >
                      <LabelList position="center" fill="#fff" stroke="none" fontSize={12} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance */}
          <Card className="bg-card border border-border shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Monthly Performance
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Revenue vs targets over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => `$${(value / 1000)}k`}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : 
                        name === 'target' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : 
                        name === 'target' ? 'Target' : 'Deals'
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="#d1fae5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Share']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Regional Performance */}
          <Card className="bg-card border border-border shadow-soft">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-normal text-foreground">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Regional Performance
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Revenue distribution by region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Share']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;