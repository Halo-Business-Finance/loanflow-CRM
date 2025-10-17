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

  const [pipelineStages, setPipelineStages] = useState<{ name: string; value: number; color: string }[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<{ stage: string; count: number; conversion: number }[]>([]);
  const [activityTrend, setActivityTrend] = useState<{ date: string; leads: number }[]>([]);

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

      // Calculate real conversion funnel data
      const stageOrder = ['New Lead', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];
      const totalLeadsCount = leads?.length || 0;
      const funnelData = stageOrder.map(stageName => {
        const count = stageCountMap.get(stageName) || 0;
        const conversion = totalLeadsCount > 0 ? (count / totalLeadsCount) * 100 : 0;
        return { stage: stageName, count, conversion };
      }).filter(item => item.count > 0);
      setConversionFunnel(funnelData);

      // Calculate activity trend (leads created in last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });
      
      const activityData = last7Days.map(date => {
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const leadsCount = leads?.filter(l => {
          const createdAt = new Date(l.created_at);
          return createdAt >= dayStart && createdAt <= dayEnd;
        }).length || 0;
        
        return { date: dateStr, leads: leadsCount };
      });
      setActivityTrend(activityData);

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
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</h3>
              <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Activity Trends - Lead Creation */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Lead Activity</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View leads
                </Button>
              </div>
              <CardDescription className="text-[#525252]">Leads created this week</CardDescription>
            </CardHeader>
            <CardContent>
              {activityTrend.length > 0 && activityTrend.some(d => d.leads > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={activityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" stroke="#525252" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#525252" style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="leads" stroke="#0f62fe" strokeWidth={2} name="New Leads" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-[#525252]">
                  <p>No lead activity in the past 7 days</p>
                </div>
              )}
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
