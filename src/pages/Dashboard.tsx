import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { IBMContentCard } from '@/components/ui/IBMContentCard';
import { IBMCardCarousel } from '@/components/ui/IBMCardCarousel';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
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
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeDeals: 0,
    pendingTasks: 0,
    recentActivity: 0
  });

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const { data: leads } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entities(stage)
        `)
        .eq('user_id', user.id);

      // Count active deals based on contact entity stage
      const activeDeals = leads?.filter(l => {
        const stage = (l.contact_entities as any)?.stage;
        return stage === 'negotiation' || stage === 'proposal';
      }).length || 0;

      setStats({
        totalLeads: leads?.length || 0,
        activeDeals: activeDeals,
        pendingTasks: 5, // Placeholder
        recentActivity: 12 // Placeholder
      });

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
    <div className="bg-[#f4f4f4] min-h-full">
      <IBMPageHeader
        title="Dashboard"
        hasDropdown
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Edit dashboard
            </Button>
            <Button variant="default" size="sm">
              Create resource
            </Button>
          </div>
        }
      />

      <div className="px-6 py-8 space-y-6">
        {/* For you section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-normal text-[#161616]">For you</h2>
            <select className="text-sm border border-[#e0e0e0] rounded px-3 py-1 bg-white text-[#161616]">
              <option>Select an option</option>
              <option>Getting started</option>
              <option>Recommended</option>
              <option>Popular</option>
            </select>
          </div>

          <IBMCardCarousel>
            <IBMContentCard
              featured
              icon={<Rocket className="h-8 w-8" />}
              title="Build"
              description="Explore Loanflow CRM with this selection of easy starter tutorials and services."
              footer={
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/20 text-xs">
                    Getting started
                  </Badge>
                  <span className="text-white/80 text-xs">5 min</span>
                </div>
              }
              className="min-w-[260px] max-w-[260px] flex-shrink-0"
            />
            
            <IBMContentCard
              icon={<Target className="h-6 w-6" />}
              title="Track performance"
              description="View estimated metrics for your loan pipeline and export data for reporting."
              footer={
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  <span className="text-[#525252] text-xs">1 min</span>
                </div>
              }
              className="min-w-[260px] max-w-[260px] flex-shrink-0"
            />

            <IBMContentCard
              icon={<Zap className="h-6 w-6" />}
              title="Build with AI"
              description="Automate workflows, insights, and more. Explore the AI platform for business."
              footer={
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                  <span className="text-[#525252] text-xs">3 min</span>
                </div>
              }
              className="min-w-[260px] max-w-[260px] flex-shrink-0"
            />

            <IBMContentCard
              icon={<Activity className="h-6 w-6" />}
              title="Monitor your pipeline"
              description="Get visibility into the performance and health of your loan pipeline."
              footer={
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary" className="text-xs">Getting started</Badge>
                  <span className="text-[#525252] text-xs">5 min</span>
                </div>
              }
              className="min-w-[260px] max-w-[260px] flex-shrink-0"
            />

            <IBMContentCard
              icon={<Users className="h-6 w-6" />}
              title="Lead Management"
              description="Deploy your lead tracking with advanced CRM capabilities and analytics."
              footer={
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  <span className="text-[#525252] text-xs">3 min</span>
                </div>
              }
              className="min-w-[260px] max-w-[260px] flex-shrink-0"
            />

            <IBMContentCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Explore tutorials"
              description="Try out a variety of tutorials to get you started with features and scenarios."
              footer={
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary" className="text-xs">Getting started</Badge>
                  <span className="text-[#525252] text-xs">10 min</span>
                </div>
              }
              className="min-w-[260px] max-w-[260px] flex-shrink-0"
            />
          </IBMCardCarousel>
        </div>

        {/* Dashboard widgets grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="text-3xl font-light text-[#161616] mb-2">{stats.pendingTasks}</div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-[#161616]">Follow up with 3 leads due today</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent leads */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Recent leads</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-[#161616] mb-2">{stats.totalLeads}</div>
              <div className="flex items-center gap-1 text-sm text-[#525252]">
                <span>Total in pipeline</span>
              </div>
            </CardContent>
          </Card>

          {/* Planned activities */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Planned activities</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light text-[#161616] mb-2">{stats.activeDeals}</div>
              <div className="space-y-1">
                <p className="text-sm text-[#525252]">Upcoming events</p>
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#0f62fe] mt-0.5 flex-shrink-0" />
                  <span className="text-[#161616]">Weekly pipeline review tomorrow</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance metrics */}
          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Performance</CardTitle>
                <Button variant="link" size="sm" className="text-[#0f62fe] h-auto p-0">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-light text-[#161616]">15</span>
                <span className="text-sm text-[#525252]">%</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-[#525252]">Conversion rate (last 30 days)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom section with recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <div className="flex items-start gap-3 pb-3 border-b border-[#e0e0e0]">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[#161616] font-medium">Lead converted to client</p>
                    <p className="text-xs text-[#525252] mt-1">Acme Corp - $250,000 loan approved</p>
                    <p className="text-xs text-[#525252] mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-[#e0e0e0]">
                  <FileText className="h-5 w-5 text-[#0f62fe] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[#161616] font-medium">Document uploaded</p>
                    <p className="text-xs text-[#525252] mt-1">Financial statements for Tech Startup LLC</p>
                    <p className="text-xs text-[#525252] mt-1">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-[#161616] font-medium">Follow-up scheduled</p>
                    <p className="text-xs text-[#525252] mt-1">Call with Restaurant Group Inc</p>
                    <p className="text-xs text-[#525252] mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#e0e0e0]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-normal text-[#161616]">Quick actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-3"
                  onClick={() => navigate('/leads/new')}
                >
                  <Users className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Add new lead</div>
                    <div className="text-xs text-[#525252]">Create and track a new opportunity</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-3"
                  onClick={() => navigate('/pipeline')}
                >
                  <BarChart3 className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="text-sm font-medium">View pipeline</div>
                    <div className="text-xs text-[#525252]">Manage your active deals</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-3"
                  onClick={() => navigate('/reports')}
                >
                  <FileText className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Generate report</div>
                    <div className="text-xs text-[#525252]">Create performance analytics</div>
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
