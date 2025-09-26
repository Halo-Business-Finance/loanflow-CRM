import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Calendar,
  Download,
  FileText,
  Filter
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
  { name: 'Prospects', value: 1000, fill: '#1e40af' },
  { name: 'Qualified Leads', value: 750, fill: '#3b82f6' },
  { name: 'Proposals', value: 500, fill: '#60a5fa' },
  { name: 'Negotiations', value: 250, fill: '#93c5fd' },
  { name: 'Closed Deals', value: 100, fill: '#dbeafe' }
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
  { name: 'SBA Loans', value: 45, fill: '#1e40af' },
  { name: 'Commercial', value: 30, fill: '#7c3aed' },
  { name: 'Real Estate', value: 20, fill: '#059669' },
  { name: 'Equipment', value: 5, fill: '#dc2626' }
];

const regionData = [
  { name: 'West Coast', value: 35, fill: '#2563eb' },
  { name: 'East Coast', value: 28, fill: '#7c3aed' },
  { name: 'Midwest', value: 22, fill: '#059669' },
  { name: 'South', value: 15, fill: '#dc2626' }
];

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(3600000);
  const [pipelineValue, setPipelineValue] = useState(2100000);

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
    <div className="h-full bg-background">
      {/* Microsoft-style Header */}
      <div className="bg-card border-b border-border/60">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    Welcome {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
                  </h1>
                  <Badge variant="secondary" className="text-xs font-medium px-2.5 py-1">
                    Overview
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome to your CRM dashboard. Monitor the performance and manage your loan pipeline.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium gap-2">
                <Calendar className="h-3 w-3" />
                Last 30 days
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium gap-2">
                <Download className="h-3 w-3" />
                Export
              </Button>
              <Button 
                onClick={fetchDashboardData} 
                variant="default" 
                size="sm"
                disabled={loading}
                className="h-8 text-xs font-medium gap-2"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card border-2 border-border/60 hover:border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-secondary-foreground border-secondary/30">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +12.5%
                          </Badge>
                          <span className="text-xs text-muted-foreground">vs last month</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-2 border-border/60 hover:border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">1,247</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-secondary-foreground border-secondary/30">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +8.2%
                          </Badge>
                          <span className="text-xs text-muted-foreground">vs last month</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-2 border-border/60 hover:border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">{formatCurrency(pipelineValue)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-destructive border-destructive/30">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            -2.1%
                          </Badge>
                          <span className="text-xs text-muted-foreground">vs last month</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-2 border-border/60 hover:border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">24.8%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-secondary-foreground border-secondary/30">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +5.4%
                          </Badge>
                          <span className="text-xs text-muted-foreground">vs last month</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Performance Metrics Bar Chart */}
                <Card className="bg-card border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Performance Metrics
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Key performance indicators across departments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            type="number" 
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            width={100}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value}%`, 'Performance']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Sales Funnel */}
                <Card className="bg-card border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Target className="h-5 w-5 text-purple-600" />
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
                <Card className="bg-card border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
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

              {/* Bottom Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Loan Type Distribution */}
                <Card className="bg-card border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
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
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
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

                {/* Regional Distribution */}
                <Card className="bg-card border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Users className="h-5 w-5 text-purple-600" />
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
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, value}) => `${name}: ${value}%`}
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
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6 min-h-[400px]">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Performance Metrics
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Key performance indicators and growth metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium text-muted-foreground">Monthly Growth</span>
                        <span className="font-semibold text-green-600">+12.5%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium text-muted-foreground">Lead Conversion</span>
                        <span className="font-semibold text-foreground">24.8%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium text-muted-foreground">Customer Retention</span>
                        <span className="font-semibold text-blue-600">91%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium text-muted-foreground">Average Deal Size</span>
                        <span className="font-semibold text-foreground">{formatCurrency(totalRevenue / 12)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Target className="h-5 w-5 text-purple-600" />
                      Goal Progress
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Progress towards monthly and quarterly goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Monthly Revenue Goal</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>New Leads Target</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pipeline Value</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6 min-h-[400px]">
              <div className="grid gap-6">
                <Card className="bg-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Advanced Analytics
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Deep insights into your business performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                        <div className="text-xs text-green-600 mt-1">↗ +12.5% vs last month</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">1,247</div>
                        <div className="text-sm text-muted-foreground">Active Leads</div>
                        <div className="text-xs text-green-600 mt-1">↗ +8.2% vs last month</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">24.8%</div>
                        <div className="text-sm text-muted-foreground">Conversion Rate</div>
                        <div className="text-xs text-green-600 mt-1">↗ +5.4% vs last month</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="bg-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-foreground">Lead Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Website</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                            <span className="text-sm font-medium">45%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Referrals</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                            <span className="text-sm font-medium">30%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Social Media</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                            <span className="text-sm font-medium">25%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>New lead: John Smith submitted application</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Deal closed: $150k SBA loan approved</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Document uploaded: Financial statements</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Follow-up scheduled: Client meeting tomorrow</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6 min-h-[400px]">
              <div className="grid gap-6">
                <Card className="bg-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Available Reports
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Generate and download business reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <h3 className="font-medium">Monthly Performance</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Revenue, leads, and conversion metrics</p>
                        <Button size="sm" className="mt-3">Generate Report</Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium">Lead Analysis</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Lead sources, conversion rates, and pipeline</p>
                        <Button size="sm" className="mt-3">Generate Report</Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <DollarSign className="h-5 w-5 text-purple-600" />
                          <h3 className="font-medium">Financial Summary</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Revenue breakdown and profit analysis</p>
                        <Button size="sm" className="mt-3">Generate Report</Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <Activity className="h-5 w-5 text-red-600" />
                          <h3 className="font-medium">Activity Report</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Team activities and productivity metrics</p>
                        <Button size="sm" className="mt-3">Generate Report</Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="h-5 w-5 text-yellow-600" />
                          <h3 className="font-medium">Pipeline Report</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Sales pipeline and forecasting data</p>
                        <Button size="sm" className="mt-3">Generate Report</Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-indigo-600" />
                          <h3 className="font-medium">Custom Report</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Build your own custom report</p>
                        <Button size="sm" className="mt-3">Create Report</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-foreground">Recent Reports</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Previously generated reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">Monthly Performance - December 2024</div>
                            <div className="text-xs text-muted-foreground">Generated 2 days ago</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">Lead Analysis - Q4 2024</div>
                            <div className="text-xs text-muted-foreground">Generated 1 week ago</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">Financial Summary - November 2024</div>
                            <div className="text-xs text-muted-foreground">Generated 2 weeks ago</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}