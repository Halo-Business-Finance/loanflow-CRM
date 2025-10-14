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
  ArrowDownRight
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

  const [pipelineStages] = useState([
    { name: 'Lead', value: 45, color: COLORS[0] },
    { name: 'Qualified', value: 28, color: COLORS[1] },
    { name: 'Proposal', value: 18, color: COLORS[2] },
    { name: 'Negotiation', value: 12, color: COLORS[3] },
    { name: 'Closed', value: 8, color: COLORS[4] }
  ]);

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
    <div data-testid="page-dashboard" className="bg-[#f4f4f4] min-h-full">
      <IBMPageHeader
        title={userName ? `Welcome, ${userName}` : 'Welcome'}
        actions={
          <Button variant="default" size="sm" onClick={() => navigate('/leads/new')}>
            Create New Lead
          </Button>
        }
      />

      <div className="px-6 py-8 space-y-6">
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border border-[#e0e0e0] hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/reports')}>
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252] text-xs">Total Revenue</CardDescription>
              <CardTitle className="text-2xl font-light text-[#161616]">
                ${(stats.totalRevenue / 1000000).toFixed(1)}M
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">+12.5%</span>
                <span className="text-[#525252]">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#e0e0e0] hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/pipeline')}>
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252] text-xs">Pipeline Value</CardDescription>
              <CardTitle className="text-2xl font-light text-[#161616]">
                ${(stats.pipelineValue / 1000000).toFixed(1)}M
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">+8.3%</span>
                <span className="text-[#525252]">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#e0e0e0] hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/leads')}>
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252] text-xs">Active Leads</CardDescription>
              <CardTitle className="text-2xl font-light text-[#161616]">{stats.totalLeads}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">+15.2%</span>
                <span className="text-[#525252]">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#e0e0e0] hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/pipeline/analytics')}>
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252] text-xs">Conversion Rate</CardDescription>
              <CardTitle className="text-2xl font-light text-[#161616]">{stats.conversionRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">+2.8%</span>
                <span className="text-[#525252]">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue Performance */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Revenue Performance</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View details
                </Button>
              </div>
              <CardDescription className="text-[#525252]">Monthly revenue vs target</CardDescription>
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
