import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { IBMContentCard } from '@/components/ui/IBMContentCard';
import { IBMCardCarousel } from '@/components/ui/IBMCardCarousel';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Rocket,
  BookOpen,
  Zap,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0f62fe', '#0353e9', '#8a3ffc', '#33b1ff', '#d12771'];

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeDeals: 0,
    pendingTasks: 0,
    recentActivity: 0,
    totalRevenue: 2500000,
    pipelineValue: 4800000,
    conversionRate: 15.3,
    avgDealSize: 185000
  });

  // Sample data for charts
  const [monthlyRevenue] = useState([
    { month: 'Jan', revenue: 185000, deals: 8, target: 200000 },
    { month: 'Feb', revenue: 215000, deals: 10, target: 200000 },
    { month: 'Mar', revenue: 198000, deals: 9, target: 200000 },
    { month: 'Apr', revenue: 245000, deals: 12, target: 250000 },
    { month: 'May', revenue: 278000, deals: 13, target: 250000 },
    { month: 'Jun', revenue: 312000, deals: 15, target: 300000 }
  ]);

  const [pipelineStages, setPipelineStages] = useState<{ name: string; value: number; color: string }[]>([]);

  const [conversionFunnel] = useState([
    { stage: 'Leads', count: 150, conversion: 100 },
    { stage: 'Qualified', count: 95, conversion: 63 },
    { stage: 'Proposal', count: 62, conversion: 41 },
    { stage: 'Negotiation', count: 38, conversion: 25 },
    { stage: 'Closed Won', count: 23, conversion: 15 }
  ]);

  const [activityTrend] = useState([
    { date: 'Mon', calls: 12, emails: 28, meetings: 5 },
    { date: 'Tue', calls: 15, emails: 32, meetings: 7 },
    { date: 'Wed', calls: 18, emails: 25, meetings: 6 },
    { date: 'Thu', calls: 14, emails: 30, meetings: 8 },
    { date: 'Fri', calls: 20, emails: 35, meetings: 4 }
  ]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Determine user's first name with robust fallbacks
      const meta: any = user?.user_metadata || {};
      const firstName =
        meta.first_name ||
        meta.firstName ||
        meta.given_name ||
        (typeof meta.full_name === 'string' ? meta.full_name.split(' ')[0] : '') ||
        (typeof meta.name === 'string' ? meta.name.split(' ')[0] : '') ||
        (user?.email ? user.email.split('@')[0] : '');
      if (import.meta.env.DEV) {
        console.info('[Dashboard] Greeting first name resolved:', firstName, meta);
      }
      setUserName(firstName);
      
      const { data: leads } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entities(stage)
        `)
        .eq('user_id', user.id);

      const activeDeals = leads?.filter(l => {
        const stage = (l.contact_entities as any)?.stage;
        return stage === 'negotiation' || stage === 'proposal';
      }).length || 0;

      // Compute pipeline distribution dynamically from lead stages
      const stageCountMap = new Map<string, number>();
      (leads || []).forEach((l: any) => {
        const stageName = l?.contact_entities?.stage || 'New Lead';
        stageCountMap.set(stageName, (stageCountMap.get(stageName) || 0) + 1);
      });
      const computedStages = Array.from(stageCountMap.entries()).map(([name, value], idx) => ({
        name,
        value,
        color: COLORS[idx % COLORS.length],
      }));
      setPipelineStages(computedStages);

      setStats(prev => ({
        ...prev,
        totalLeads: leads?.length || 0,
        activeDeals: activeDeals,
        pendingTasks: 5,
        recentActivity: 12
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info('[Page] Dashboard mounted');
    }
    fetchDashboardData();
  }, [user]);

  return (
    <div data-testid="page-dashboard" className="min-h-screen bg-background">
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Enterprise Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {userName ? `Welcome, ${userName}` : 'Welcome'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Your SBA & Commercial Loan Command Center
            </p>
          </div>
          <Button 
            onClick={() => navigate('/leads/new')}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Create New Lead
          </Button>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="widget-glass widget-glow border-0 cursor-pointer group transition-all"
            onClick={() => navigate('/reports')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold text-foreground">
                ${(stats.totalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>

          <Card 
            className="widget-glass widget-glow border-0 cursor-pointer group transition-all"
            onClick={() => navigate('/pipeline')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Pipeline Value</h3>
              <p className="text-2xl font-bold text-foreground">
                ${(stats.pipelineValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>

          <Card 
            className="widget-glass widget-glow border-0 cursor-pointer group transition-all"
            onClick={() => navigate('/leads')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Leads</h3>
              <p className="text-2xl font-bold text-foreground">{stats.totalLeads}</p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>

          <Card 
            className="widget-glass widget-glow border-0 cursor-pointer group transition-all"
            onClick={() => navigate('/pipeline/analytics')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</h3>
              <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Performance */}
          <Card className="widget-glass border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Revenue Performance</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  View details
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
              <CardDescription>Monthly revenue vs target</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0f62fe" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#525252" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#525252" style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0f62fe" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#d12771" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pipeline Distribution */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Pipeline Distribution</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View pipeline
                </Button>
              </div>
              <CardDescription className="text-[#525252]">Deals by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <RePieChart>
                    <Pie
                      data={pipelineStages}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pipelineStages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pipelineStages.map((stage, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: stage.color }} />
                        <span className="text-sm text-[#161616]">{stage.name}</span>
                      </div>
                      <span className="text-sm font-medium text-[#161616]">{stage.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Conversion Funnel</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View analytics
                </Button>
              </div>
              <CardDescription className="text-[#525252]">Lead to customer journey</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={conversionFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" stroke="#525252" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="stage" type="category" stroke="#525252" style={{ fontSize: '12px' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0f62fe" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Trends */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Activity Trends</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View activities
                </Button>
              </div>
              <CardDescription className="text-[#525252]">This week's activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={activityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#525252" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#525252" style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calls" stroke="#0f62fe" strokeWidth={2} />
                  <Line type="monotone" dataKey="emails" stroke="#0353e9" strokeWidth={2} />
                  <Line type="monotone" dataKey="meetings" stroke="#8a3ffc" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active tasks */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Active tasks</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-[#161616] mb-4">{stats.pendingTasks}</div>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm pb-2 border-b border-[#e0e0e0]">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-[#161616]">Follow up with 3 leads</span>
                    <p className="text-xs text-[#525252] mt-0.5">Due today</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm pb-2 border-b border-[#e0e0e0]">
                  <Clock className="h-4 w-4 text-[#0f62fe] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-[#161616]">Review loan applications</span>
                    <p className="text-xs text-[#525252] mt-0.5">Due tomorrow</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Recent activity</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-2 border-b border-[#e0e0e0]">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[#161616]">Lead converted</p>
                    <p className="text-xs text-[#525252] mt-0.5">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-2 border-b border-[#e0e0e0]">
                  <FileText className="h-4 w-4 text-[#0f62fe] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[#161616]">Document uploaded</p>
                    <p className="text-xs text-[#525252] mt-0.5">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-[#8a3ffc] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[#161616]">Meeting scheduled</p>
                    <p className="text-xs text-[#525252] mt-0.5">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader>
              <CardTitle className="text-base font-normal text-[#161616]">Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-3 hover:bg-[#f4f4f4]"
                  onClick={() => navigate('/leads/new')}
                >
                  <Users className="h-4 w-4 mr-3 text-[#0f62fe]" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-[#161616]">Add new lead</div>
                    <div className="text-xs text-[#525252]">Create and track opportunity</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-3 hover:bg-[#f4f4f4]"
                  onClick={() => navigate('/pipeline')}
                >
                  <BarChart3 className="h-4 w-4 mr-3 text-[#0f62fe]" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-[#161616]">View pipeline</div>
                    <div className="text-xs text-[#525252]">Manage active deals</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-3 hover:bg-[#f4f4f4]"
                  onClick={() => navigate('/reports')}
                >
                  <FileText className="h-4 w-4 mr-3 text-[#0f62fe]" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-[#161616]">Generate report</div>
                    <div className="text-xs text-[#525252]">Create analytics</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
