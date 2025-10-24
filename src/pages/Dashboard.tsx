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
  Calendar as CalendarIcon,
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
  CalendarCheck,
  MessageSquare
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
import { useCalendarData } from '@/hooks/useCalendarData';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { CompactMessagesWidget } from '@/components/CompactMessagesWidget';

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
    totalRevenue: 0,
    pipelineValue: 0,
    conversionRate: 0,
    avgDealSize: 0,
    // Trend data (percentage change vs last period)
    revenueTrend: 0,
    pipelineTrend: 0,
    leadsTrend: 0,
    conversionTrend: 0
  });
  const [recentActivityList, setRecentActivityList] = useState<Array<{type: string; message: string; time: string}>>([]);

  const [pipelineStages, setPipelineStages] = useState<{ name: string; value: number; color: string }[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<{ stage: string; count: number; conversion: number }[]>([]);
  const [activityTrend, setActivityTrend] = useState<{ date: string; leads: number }[]>([]);
  const [revenuePerformance, setRevenuePerformance] = useState<{ month: string; revenue: number; pipeline: number }[]>([]);
  
  // Calendar data
  const { getEventsForDate, getDatesWithEvents } = useCalendarData(new Date());
  const todayEvents = getEventsForDate(new Date());
  const datesWithEvents = getDatesWithEvents();

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
      
      // Fetch leads with contact entity data including loan amounts
      const { data: leads } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entities(stage, loan_amount)
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
      const stageOrder = ['New Lead', 'Initial Contact', 'Loan Application Signed', 'Waiting for Documentation', 'Pre-Approved', 'Term Sheet Signed', 'Loan Approved', 'Closing', 'Loan Funded'];
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

      // Calculate pending tasks (leads that need follow-up - initial contact or waiting for documentation)
      const pendingTasks = leads?.filter(l => {
        const stage = (l.contact_entities as any)?.stage;
        return stage === 'Initial Contact' || stage === 'Waiting for Documentation';
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

      // Calculate real metrics from contact_entities data
      const currentMonth = new Date();
      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0, 23, 59, 59, 999);

      // Current month leads
      const currentMonthLeads = leads?.filter(l => {
        const createdAt = new Date(l.created_at);
        return createdAt >= currentMonthStart;
      }) || [];

      // Last month leads
      const lastMonthLeads = leads?.filter(l => {
        const createdAt = new Date(l.created_at);
        return createdAt >= lastMonth && createdAt <= lastMonthEnd;
      }) || [];

      // Calculate Total Revenue (sum of loan_amount for 'Loan Funded' or 'Closed Won' stages)
      const closedWonStages = ['Loan Funded', 'Closed Won'];
      const totalRevenue = (leads || []).reduce((sum, lead) => {
        const contactEntity = lead.contact_entities as any;
        const stage = contactEntity?.stage;
        const loanAmount = contactEntity?.loan_amount || 0;
        return closedWonStages.includes(stage) ? sum + loanAmount : sum;
      }, 0);

      // Calculate Pipeline Value (sum of loan_amount for active/open stages)
      const excludedStages = ['Loan Funded', 'Closed Won', 'Closed Lost', 'Archive', 'Lost'];
      const pipelineValue = (leads || []).reduce((sum, lead) => {
        const contactEntity = lead.contact_entities as any;
        const stage = contactEntity?.stage;
        const loanAmount = contactEntity?.loan_amount || 0;
        return stage && !excludedStages.includes(stage) ? sum + loanAmount : sum;
      }, 0);

      // Calculate Conversion Rate (closed won / total leads * 100)
      const closedWonCount = (leads || []).filter(l => {
        const stage = (l.contact_entities as any)?.stage;
        return closedWonStages.includes(stage);
      }).length;
      const conversionRate = leads && leads.length > 0 ? (closedWonCount / leads.length) * 100 : 0;

      // Calculate trends (current month vs last month)
      const lastMonthRevenue = lastMonthLeads.reduce((sum, lead) => {
        const contactEntity = lead.contact_entities as any;
        const stage = contactEntity?.stage;
        const loanAmount = contactEntity?.loan_amount || 0;
        return closedWonStages.includes(stage) ? sum + loanAmount : sum;
      }, 0);

      const lastMonthPipeline = lastMonthLeads.reduce((sum, lead) => {
        const contactEntity = lead.contact_entities as any;
        const stage = contactEntity?.stage;
        const loanAmount = contactEntity?.loan_amount || 0;
        return stage && !excludedStages.includes(stage) ? sum + loanAmount : sum;
      }, 0);

      const lastMonthClosedWon = lastMonthLeads.filter(l => {
        const stage = (l.contact_entities as any)?.stage;
        return closedWonStages.includes(stage);
      }).length;

      const lastMonthConversionRate = lastMonthLeads.length > 0 
        ? (lastMonthClosedWon / lastMonthLeads.length) * 100 
        : 0;

      const revenueTrend = lastMonthRevenue > 0 
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;
      
      const pipelineTrend = lastMonthPipeline > 0 
        ? ((pipelineValue - lastMonthPipeline) / lastMonthPipeline) * 100 
        : 0;
      
      const leadsTrend = lastMonthLeads.length > 0 
        ? (((leads?.length || 0) - lastMonthLeads.length) / lastMonthLeads.length) * 100 
        : 0;
      
      const conversionTrend = lastMonthConversionRate > 0 
        ? ((conversionRate - lastMonthConversionRate) / lastMonthConversionRate) * 100 
        : 0;

      setStats({
        totalLeads: leads?.length || 0,
        activeDeals: activeDeals,
        pendingTasks: pendingTasks,
        recentActivities: activities.length,
        totalRevenue,
        pipelineValue,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        avgDealSize: closedWonCount > 0 ? totalRevenue / closedWonCount : 0,
        revenueTrend: parseFloat(revenueTrend.toFixed(1)),
        pipelineTrend: parseFloat(pipelineTrend.toFixed(1)),
        leadsTrend: parseFloat(leadsTrend.toFixed(1)),
        conversionTrend: parseFloat(conversionTrend.toFixed(1))
      });

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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
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

        {/* Messages, Calendar and Today's Schedule Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages Widget */}
          <CompactMessagesWidget />

          {/* Full Calendar Widget */}
          <Card className="bg-card border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Calendar</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/activities/calendar')}
                  className="h-7 text-xs"
                >
                  View Full
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center pb-4">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md scale-90 -my-3"
                modifiers={{
                  hasEvents: datesWithEvents
                }}
                modifiersClassNames={{
                  hasEvents: "bg-primary/10 font-semibold relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary"
                }}
                onDayClick={(date) => navigate('/activities/calendar')}
              />
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="bg-card border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Today's Schedule</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/activities/calendar')}
                  className="h-7 text-xs"
                >
                  View All
                </Button>
              </div>
              <CardDescription className="text-xs">{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {todayEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No events scheduled for today</p>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => navigate('/activities/calendar')}
                    className="mt-1 h-7 text-xs"
                  >
                    Schedule an event
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {todayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-2 p-2 border rounded-lg bg-background/50 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (event.relatedId && event.relatedType === 'lead') {
                          navigate(`/leads/${event.relatedId}`);
                        } else if (event.relatedId && event.relatedType === 'client') {
                          navigate(`/clients/${event.relatedId}`);
                        }
                      }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {event.type === 'meeting' && <Users className="h-3.5 w-3.5 text-primary" />}
                        {event.type === 'call' && <Clock className="h-3.5 w-3.5 text-primary" />}
                        {event.type === 'task' && <CheckCircle className="h-3.5 w-3.5 text-primary" />}
                        {event.type === 'deadline' && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                        {event.type === 'followup' && <Activity className="h-3.5 w-3.5 text-primary" />}
                        {event.type === 'reminder' && <Clock className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs leading-tight">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(event.startTime, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Key Performance Indicators - Clean Style with Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="bg-card border cursor-pointer group transition-all hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px]"
            onClick={() => navigate('/reports')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                <span className={`text-xs font-medium ${
                  stats.revenueTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stats.revenueTrend >= 0 ? '+' : ''}{stats.revenueTrend}%
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                ${(stats.totalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border cursor-pointer group transition-all hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px]"
            onClick={() => navigate('/pipeline')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Pipeline Value</h3>
                <span className={`text-xs font-medium ${
                  stats.pipelineTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stats.pipelineTrend >= 0 ? '+' : ''}{stats.pipelineTrend}%
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                ${(stats.pipelineValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border cursor-pointer group transition-all hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px]"
            onClick={() => navigate('/leads')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Active Leads</h3>
                <span className={`text-xs font-medium ${
                  stats.leadsTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stats.leadsTrend >= 0 ? '+' : ''}{stats.leadsTrend}%
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.totalLeads}</p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-card border cursor-pointer group transition-all hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px]"
            onClick={() => navigate('/pipeline/analytics')}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
                <span className={`text-xs font-medium ${
                  stats.conversionTrend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stats.conversionTrend >= 0 ? '+' : ''}{stats.conversionTrend}%
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.conversionRate}%</p>
              <p className="text-xs text-muted-foreground mt-2">vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Performance */}
          <Card className="bg-white border border-[#e0e0e0] cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all" onClick={() => navigate('/reports')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Revenue Performance</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0" onClick={(e) => { e.stopPropagation(); navigate('/reports'); }}>
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
          <Card className="bg-white border border-[#e0e0e0] cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all" onClick={() => navigate('/pipeline')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Pipeline Distribution</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0" onClick={(e) => { e.stopPropagation(); navigate('/pipeline'); }}>
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
          <Card className="bg-white border border-[#e0e0e0] cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all" onClick={() => navigate('/pipeline/analytics')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Conversion Funnel</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0" onClick={(e) => { e.stopPropagation(); navigate('/pipeline/analytics'); }}>
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
                  <YAxis dataKey="stage" type="category" stroke="#525252" style={{ fontSize: '12px' }} width={100} label={{ value: 'Loan Stage', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0f62fe" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Trends - Lead Creation */}
          <Card className="bg-white border border-[#e0e0e0] cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all" onClick={() => navigate('/leads')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Lead Activity</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0" onClick={(e) => { e.stopPropagation(); navigate('/leads'); }}>
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
          <Card className="bg-white border border-[#e0e0e0] cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all" onClick={() => navigate('/activities/tasks')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Active tasks</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0" onClick={(e) => { e.stopPropagation(); navigate('/activities/tasks'); }}>
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
                      <p className="text-xs text-[#525252] mt-0.5">Initial contact and waiting for documentation stages</p>
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
          <Card className="bg-white border border-[#e0e0e0] cursor-pointer hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all" onClick={() => navigate('/activities')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Recent activity</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0" onClick={(e) => { e.stopPropagation(); navigate('/activities'); }}>
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
                  className="w-full justify-start h-auto py-3"
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
                  className="w-full justify-start h-auto py-3"
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
                  className="w-full justify-start h-auto py-3"
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
