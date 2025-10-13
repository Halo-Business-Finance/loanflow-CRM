import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { IBMContentCard } from '@/components/ui/IBMContentCard';
import { IBMCardCarousel } from '@/components/ui/IBMCardCarousel';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Target,
  RefreshCw,
  Download,
  Filter,
  Plus,
  Rocket,
  BookOpen,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jan', revenue: 0, deals: 0 }
  ]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const { data: leads } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entities(*)
        `)
        .eq('user_id', user.id);

      setTotalLeads(leads?.length || 0);
      
      // For now, use placeholder conversion rate
      setConversionRate(15);
      
      // Use placeholder revenue and pipeline values
      setTotalRevenue(2500000);
      setPipelineValue(4800000);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  return (
    <div className="bg-white min-h-full">
      <IBMPageHeader
        title="Dashboard"
        subtitle="Overview of your loan pipeline and key metrics"
        hasDropdown
        actions={
          <>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => navigate('/leads/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Button>
          </>
        }
      />

      <div className="px-6 py-6 space-y-6">
        {/* Featured Cards Carousel */}
        <IBMCardCarousel>
          <IBMContentCard
            featured
            icon={<Rocket className="h-8 w-8" />}
            title="Get started with Halo CRM"
            description="Learn how to manage your loan pipeline, track leads, and close more deals with our powerful CRM platform."
            footer={
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                  Getting started
                </Badge>
                <span className="text-white/80 text-xs">5 min</span>
              </div>
            }
            className="min-w-[400px] flex-shrink-0"
          />
          
          <IBMContentCard
            icon={<Users className="h-6 w-6" />}
            title="Lead Management Best Practices"
            description="Discover strategies to improve lead conversion and streamline your sales process."
            footer={
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
                <span className="text-[#525252] text-xs">8 min</span>
              </div>
            }
            className="min-w-[300px] flex-shrink-0"
          />

          <IBMContentCard
            icon={<BookOpen className="h-6 w-6" />}
            title="Pipeline Analytics Guide"
            description="Learn how to use analytics to identify bottlenecks and optimize your pipeline."
            footer={
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">Popular</Badge>
                <span className="text-[#525252] text-xs">10 min</span>
              </div>
            }
            className="min-w-[300px] flex-shrink-0"
          />

          <IBMContentCard
            icon={<Zap className="h-6 w-6" />}
            title="Automation Features"
            description="Automate repetitive tasks and focus on what matters most - closing deals."
            footer={
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">New</Badge>
                <span className="text-[#525252] text-xs">6 min</span>
              </div>
            }
            className="min-w-[300px] flex-shrink-0"
          />
        </IBMCardCarousel>

        {/* Key Metrics */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#161616]">Key metrics</h2>
            <Button variant="ghost" size="sm" onClick={fetchDashboardData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-[#e0e0e0]">
              <CardHeader className="pb-2">
                <CardDescription className="text-[#525252]">Total Revenue</CardDescription>
                <CardTitle className="text-2xl text-[#161616]">
                  ${totalRevenue.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">12%</span>
                  <span className="text-[#525252] ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e0e0e0]">
              <CardHeader className="pb-2">
                <CardDescription className="text-[#525252]">Pipeline Value</CardDescription>
                <CardTitle className="text-2xl text-[#161616]">
                  ${pipelineValue.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">8%</span>
                  <span className="text-[#525252] ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e0e0e0]">
              <CardHeader className="pb-2">
                <CardDescription className="text-[#525252]">Total Leads</CardDescription>
                <CardTitle className="text-2xl text-[#161616]">{totalLeads}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">15%</span>
                  <span className="text-[#525252] ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e0e0e0]">
              <CardHeader className="pb-2">
                <CardDescription className="text-[#525252]">Conversion Rate</CardDescription>
                <CardTitle className="text-2xl text-[#161616]">
                  {conversionRate.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">3%</span>
                  <span className="text-[#525252] ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#161616]">Revenue performance</h2>
            <Button variant="ghost" size="sm" className="text-[#0f62fe]">
              View all
            </Button>
          </div>
          
          <Card className="border-[#e0e0e0]">
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#525252" />
                  <YAxis stroke="#525252" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#0f62fe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deals" fill="#0353e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#161616]">Quick actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="border-[#e0e0e0] cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/leads/new')}
            >
              <CardHeader>
                <Users className="h-6 w-6 text-[#0f62fe] mb-2" />
                <CardTitle className="text-lg">Add New Lead</CardTitle>
                <CardDescription className="text-[#525252]">
                  Create a new lead and start tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="border-[#e0e0e0] cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/pipeline')}
            >
              <CardHeader>
                <BarChart3 className="h-6 w-6 text-[#0f62fe] mb-2" />
                <CardTitle className="text-lg">View Pipeline</CardTitle>
                <CardDescription className="text-[#525252]">
                  Manage and track your deal pipeline
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="border-[#e0e0e0] cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate('/reports')}
            >
              <CardHeader>
                <Target className="h-6 w-6 text-[#0f62fe] mb-2" />
                <CardTitle className="text-lg">Generate Report</CardTitle>
                <CardDescription className="text-[#525252]">
                  Create detailed performance reports
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
