import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Badge component removed - using plain text instead
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, TrendingDown, Users, Target, Clock } from "lucide-react"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"

interface LeadStats {
  totalLeads: number
  conversionRate: number
  qualifiedLeads: number
  avgResponseTime: number
  convertedLeads: number
  newLeads: number
}

export default function LeadStats() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [stats, setStats] = useState<LeadStats>({
    totalLeads: 0,
    conversionRate: 0,
    qualifiedLeads: 0,
    avgResponseTime: 0,
    convertedLeads: 0,
    newLeads: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchLeadStats()
    }
  }, [user])

  const fetchLeadStats = async () => {
    try {
      setLoading(true)
      const { data: leads, error } = await supabase
        .from('leads')
        .select(`
          id,
          created_at,
          is_converted_to_client,
          contact_entities!inner (
            stage,
            priority
          )
        `)
        .eq('user_id', user?.id)

      if (error) throw error

      const totalLeads = leads?.length || 0
      const convertedLeads = leads?.filter(l => l.is_converted_to_client).length || 0
      const qualifiedLeads = leads?.filter(l => 
        l.contact_entities?.stage === 'Pre-Approved' || 
        l.contact_entities?.stage === 'Term Sheet Signed'
      ).length || 0
      const newLeads = leads?.filter(l => 
        l.contact_entities?.stage === 'Initial Contact'
      ).length || 0
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

      setStats({
        totalLeads,
        conversionRate,
        qualifiedLeads,
        avgResponseTime: 2.4, // Placeholder
        convertedLeads,
        newLeads
      })
    } catch (error) {
      console.error('Error fetching lead stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <StandardPageHeader
        title="Lead Management"
        description="Assign leads to team members and view performance statistics"
      />
      
      <div className="px-6 pt-4">
        <Tabs value={location.pathname} onValueChange={(value) => navigate(value)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="/leads/assignment" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Lead Assignment
            </TabsTrigger>
            <TabsTrigger value="/leads/stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Lead Stats
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6 space-y-6">

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="widget-glass widget-glow border-0 animate-fade-in">
              <CardContent className="p-6 widget-content">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total Leads</span>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{loading ? "..." : stats.totalLeads}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-primary" />
                  <span className="text-primary">Active in pipeline</span>
                </div>
              </CardContent>
            </Card>

            <Card className="widget-glass widget-glow border-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6 widget-content">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Conversion Rate</span>
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? "..." : `${stats.conversionRate.toFixed(1)}%`}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span className="text-muted-foreground">{stats.convertedLeads} converted</span>
                </div>
              </CardContent>
            </Card>

            <Card className="widget-glass widget-glow border-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6 widget-content">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Qualified Leads</span>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{loading ? "..." : stats.qualifiedLeads}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span className="text-muted-foreground">Ready for proposal</span>
                </div>
              </CardContent>
            </Card>

            <Card className="widget-glass widget-glow border-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6 widget-content">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Avg. Response Time</span>
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stats.avgResponseTime}h</div>
                <div className="flex items-center text-xs text-primary mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  15% faster
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <StandardContentCard
                title="Lead Sources"
                headerActions={
                  <span className="text-xs text-muted-foreground">Distribution breakdown</span>
                }
              >
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Website</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                    <span className="text-xs font-medium">45%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Referrals</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }} />
                    </div>
                    <span className="text-xs font-medium">30%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Social Media</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }} />
                    </div>
                    <span className="text-xs font-medium">15%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Other</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '10%' }} />
                    </div>
                    <span className="text-xs font-medium">10%</span>
                  </div>
                </div>
              </div>
              </StandardContentCard>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <StandardContentCard
                title="Lead Status Distribution"
                headerActions={
                  <span className="text-xs text-muted-foreground">Current pipeline status</span>
                }
              >
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm font-medium">New</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }} />
                    </div>
                    <span className="text-xs font-medium">{loading ? "..." : stats.newLeads}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm font-medium">Contacted</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                    <span className="text-xs font-medium">25%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm font-medium">Qualified</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <span className="text-xs font-medium">{loading ? "..." : stats.qualifiedLeads}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Converted</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <span className="text-xs font-medium">
                      {loading ? "..." : stats.convertedLeads}
                    </span>
                  </div>
                </div>
              </div>
              </StandardContentCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}