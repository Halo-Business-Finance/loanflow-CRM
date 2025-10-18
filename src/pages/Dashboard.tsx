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
  UserPlus,
  ClipboardList,
  Briefcase,
  FolderOpen,
  CalendarCheck
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
  Legend,
  Label
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
    recentActivities: 0,
    totalRevenue: 2500000,
    pipelineValue: 4800000,
    conversionRate: 15.3,
    avgDealSize: 185000,
    // Trend data (percentage change vs last period)
    revenueTrend: 12.5,
    pipelineTrend: 8.3,
    leadsTrend: -3.2,
    conversionTrend: 5.1
  });
  const [recentActivityList, setRecentActivityList] = useState<Array<{type: string; message: string; time: string}>>([]);

  const [pipelineStages, setPipelineStages] = useState<{ name: string; value: number; color: string }[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<{ stage: string; count: number; conversion: number }[]>([]);
  const [activityTrend, setActivityTrend] = useState<{ date: string; leads: number }[]>([]);
  const [revenuePerformance, setRevenuePerformance] = useState<{ month: string; revenue: number; pipeline: number }[]>([]);

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

      // Calculate revenue performance (last 6 months)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date;
      });

      const revenueData = last6Months.map(date => {
        const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        
        const monthLeads = leads?.filter(l => {
          const createdAt = new Date(l.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }) || [];

        const closedWonLeads = monthLeads.filter(l => (l.contact_entities as any)?.stage === 'Closed Won');
        const revenue = closedWonLeads.reduce((sum, l) => {
          const loanAmount = (l.contact_entities as any)?.loan_amount || 0;
          return sum + loanAmount;
        }, 0);
        const pipeline = monthLeads.reduce((sum, l) => {
          const loanAmount = (l.contact_entities as any)?.loan_amount || 0;
          return sum + loanAmount;
        }, 0);
        
        return { month: monthStr, revenue, pipeline };
      });
      setRevenuePerformance(revenueData);

      // Calculate pending tasks (leads that need follow-up - contacted or qualified stages)
      const pendingTasks = leads?.filter(l => {
        const stage = (l.contact_entities as any)?.stage;
        return stage === 'Contacted' || stage === 'Qualified';
      }).length || 0;

      // Get recent activities from lead updates
      const recentLeads = [...(leads || [])].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ).slice(0, 3);

      const activities = recentLeads.map(lead => {
        const stage = (lead.contact_entities as any)?.stage;
        const updatedAt = new Date(lead.updated_at);
        const now = new Date();
        const diffMs = now.getTime() - updatedAt.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        let timeStr = '';
        if (diffDays > 0) {
          timeStr = diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
        } else if (diffHours > 0) {
          timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
          timeStr = 'Just now';
        }

        return {
          type: stage === 'Closed Won' ? 'converted' : stage === 'New Lead' ? 'created' : 'updated',
          message: stage === 'Closed Won' ? 'Lead converted' : stage === 'New Lead' ? 'New lead created' : `Lead moved to ${stage}`,
          time: timeStr
        };
      });

      setRecentActivityList(activities);

      setStats(prev => ({
        ...prev,
        totalLeads: leads?.length || 0,
        activeDeals: activeDeals,
        pendingTasks: pendingTasks,
        recentActivities: activities.length
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

        {/* Quick Access Tiles - Enterprise Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0 cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate('/leads')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-black/20 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalLeads}</p>
                <p className="text-sm font-medium text-muted-foreground">Leads</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0 cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate('/pipeline')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-black/20 group-hover:scale-110 transition-transform">
                <Briefcase className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeDeals}</p>
                <p className="text-sm font-medium text-muted-foreground">Opportunities</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0 cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate('/documents')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-black/20 group-hover:scale-110 transition-transform">
                <FolderOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">—</p>
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-0 cursor-pointer hover:shadow-lg transition-all group"
            onClick={() => navigate('/activities/tasks')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-lg bg-white/80 dark:bg-black/20 group-hover:scale-110 transition-transform">
                <ClipboardList className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pendingTasks}</p>
                <p className="text-sm font-medium text-muted-foreground">Tasks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Performance Indicators - Enterprise Style with Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="widget-glass widget-glow border-0 cursor-pointer group transition-all hover:shadow-xl"
            onClick={() => navigate('/reports')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stats.revenueTrend >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {stats.revenueTrend >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(stats.revenueTrend)}%
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-foreground">
                ${(stats.totalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>

          <Card 
            className="widget-glass widget-glow border-0 cursor-pointer group transition-all hover:shadow-xl"
            onClick={() => navigate('/pipeline')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stats.pipelineTrend >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {stats.pipelineTrend >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(stats.pipelineTrend)}%
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Pipeline Value</h3>
              <p className="text-3xl font-bold text-foreground">
                ${(stats.pipelineValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>

          <Card 
            className="widget-glass widget-glow border-0 cursor-pointer group transition-all hover:shadow-xl"
            onClick={() => navigate('/leads')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stats.leadsTrend >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {stats.leadsTrend >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(stats.leadsTrend)}%
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Active Leads</h3>
              <p className="text-3xl font-bold text-foreground">{stats.totalLeads}</p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>

          <Card 
            className="widget-glass widget-glow border-0 cursor-pointer group transition-all hover:shadow-xl"
            onClick={() => navigate('/pipeline/analytics')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stats.conversionTrend >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {stats.conversionTrend >= 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(stats.conversionTrend)}%
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</h3>
              <p className="text-3xl font-bold text-foreground">{stats.conversionRate}%</p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Performance */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Revenue Performance</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View reports
                </Button>
              </div>
              <CardDescription className="text-[#525252]">Revenue vs Pipeline (6 months)</CardDescription>
            </CardHeader>
            <CardContent>
              {revenuePerformance.length > 0 && revenuePerformance.some(d => d.revenue > 0 || d.pipeline > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenuePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#525252" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#525252" style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="pipeline" stackId="1" stroke="#33b1ff" fill="#33b1ff" name="Pipeline Value" />
                    <Area type="monotone" dataKey="revenue" stackId="2" stroke="#0f62fe" fill="#0f62fe" name="Closed Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-[#525252]">
                  <p>No revenue data available</p>
                </div>
              )}
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
                      label={(entry) => entry.value}
                      labelLine={false}
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
              {stats.pendingTasks > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm pb-2 border-b border-[#e0e0e0]">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-[#161616]">Follow up with {stats.pendingTasks} lead{stats.pendingTasks > 1 ? 's' : ''}</span>
                      <p className="text-xs text-[#525252] mt-0.5">Contacted and qualified stages</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#525252]">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>All caught up!</span>
                </div>
              )}
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
              {recentActivityList.length > 0 ? (
                <div className="space-y-3">
                  {recentActivityList.map((activity, index) => (
                    <div key={index} className={`flex items-start gap-3 ${index < recentActivityList.length - 1 ? 'pb-2 border-b border-[#e0e0e0]' : ''}`}>
                      {activity.type === 'converted' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />}
                      {activity.type === 'created' && <UserPlus className="h-4 w-4 text-[#0f62fe] mt-0.5 flex-shrink-0" />}
                      {activity.type === 'updated' && <Activity className="h-4 w-4 text-[#8a3ffc] mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm text-[#161616]">{activity.message}</p>
                        <p className="text-xs text-[#525252] mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-[#525252] text-sm">
                  No recent activity
                </div>
              )}
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
