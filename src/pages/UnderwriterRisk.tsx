import { StandardContentCard } from "@/components/StandardContentCard"
import { Activity, TrendingUp, AlertTriangle, Shield, RefreshCw, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription"
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess"
import { Badge } from "@/components/ui/badge"

interface RiskMetrics {
  highRisk: number
  mediumRisk: number
  lowRisk: number
  avgScore: number
  recentAssessments: Array<{
    id: string
    name: string
    amount: number
    riskScore: number
    riskLevel: 'high' | 'medium' | 'low'
  }>
}

export default function UnderwriterRisk() {
  const { user } = useAuth()
  const { hasRole } = useRoleBasedAccess()
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics, setMetrics] = useState<RiskMetrics>({
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgScore: 0,
    recentAssessments: []
  })
  const [loading, setLoading] = useState(true)

  const calculateRiskScore = (lead: any): number => {
    let score = 50 // Base score
    
    // Credit score impact (0-30 points)
    if (lead.credit_score) {
      if (lead.credit_score >= 750) score += 30
      else if (lead.credit_score >= 700) score += 25
      else if (lead.credit_score >= 650) score += 20
      else if (lead.credit_score >= 600) score += 10
      else score += 5
    }
    
    // Debt to income ratio impact (0-20 points)
    if (lead.debt_to_income_ratio) {
      if (lead.debt_to_income_ratio <= 0.30) score += 20
      else if (lead.debt_to_income_ratio <= 0.40) score += 15
      else if (lead.debt_to_income_ratio <= 0.50) score += 10
      else score += 5
    }
    
    // Revenue/Income impact (0-20 points)
    const revenue = lead.annual_revenue || lead.income || 0
    if (revenue >= 1000000) score += 20
    else if (revenue >= 500000) score += 15
    else if (revenue >= 250000) score += 10
    else if (revenue >= 100000) score += 5
    
    // Business age impact (0-10 points)
    if (lead.year_established) {
      const age = new Date().getFullYear() - lead.year_established
      if (age >= 5) score += 10
      else if (age >= 2) score += 5
    }
    
    return Math.min(Math.max(score, 0), 100)
  }

  const getRiskLevel = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 75) return 'low'
    if (score >= 50) return 'medium'
    return 'high'
  }

  const fetchRiskData = async () => {
    try {
      setLoading(true)
      
      const isManagerOrAdmin = hasRole('manager') || hasRole('admin') || hasRole('super_admin')
      
      let query = supabase
        .from('leads')
        .select(`
          *,
          contact_entity:contact_entities!leads_contact_entity_id_fkey(*)
        `)
      
      if (!isManagerOrAdmin) {
        query = query.eq('user_id', user?.id)
      }
      
      const respAny = await (query as any)
      let data = (respAny?.data as any[]) || null
      let error = respAny?.error as any
      
      // Fallback if join fails
      if (error) {
        console.warn('[UnderwriterRisk] Join failed, using fallback:', error)
        let baseQuery = supabase.from('leads').select('*')
        if (!isManagerOrAdmin) {
          baseQuery = baseQuery.eq('user_id', user?.id)
        }
        const { data: leads, error: baseError } = await baseQuery
        if (baseError) throw baseError
        data = leads || []
      }
      
      if (!data || data.length === 0) {
        setMetrics({
          highRisk: 0,
          mediumRisk: 0,
          lowRisk: 0,
          avgScore: 0,
          recentAssessments: []
        })
        return
      }
      
      // Calculate risk for each lead
      const assessments = data.map((lead: any) => {
        const contact = lead.contact_entity || lead
        const riskScore = calculateRiskScore(contact)
        return {
          id: lead.id,
          name: contact.name || 'Unknown',
          amount: contact.loan_amount || 0,
          riskScore,
          riskLevel: getRiskLevel(riskScore),
          created_at: lead.created_at
        }
      })
      
      // Count by risk level
      const highRisk = assessments.filter((a: any) => a.riskLevel === 'high').length
      const mediumRisk = assessments.filter((a: any) => a.riskLevel === 'medium').length
      const lowRisk = assessments.filter((a: any) => a.riskLevel === 'low').length
      
      // Calculate average score
      const avgScore = assessments.length > 0
        ? assessments.reduce((sum: number, a: any) => sum + a.riskScore, 0) / assessments.length
        : 0
      
      // Get 5 most recent
      const recentAssessments = assessments
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
      
      setMetrics({
        highRisk,
        mediumRisk,
        lowRisk,
        avgScore: Math.round(avgScore * 10) / 10,
        recentAssessments
      })
    } catch (error) {
      console.error('[UnderwriterRisk] Error fetching risk data:', error)
      setMetrics({
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        avgScore: 0,
        recentAssessments: []
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRiskData()
  }, [user])

  // Realtime subscriptions
  useRealtimeSubscription({ table: 'leads', event: '*', onChange: fetchRiskData })
  useRealtimeSubscription({ table: 'contact_entities', event: '*', onChange: fetchRiskData })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRiskBadge = (level: 'high' | 'medium' | 'low', score: number) => {
    const config = {
      high: { variant: 'destructive' as const, label: `High Risk (${score})` },
      medium: { variant: 'secondary' as const, label: `Medium Risk (${score})` },
      low: { variant: 'default' as const, label: `Low Risk (${score})` }
    }
    const { variant, label } = config[level]
    return <Badge variant={variant}>{label}</Badge>
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Loan Risk Assessment
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive risk analysis and assessment tools for loan underwriting
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={fetchRiskData}
              disabled={loading}
              className="h-8 text-xs font-medium bg-[#0f62fe] hover:bg-[#0353e9] text-white border-2 border-[#001f3f]"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Risk Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">High Risk</span>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold">{loading ? '...' : metrics.highRisk}</div>
              <p className="text-xs text-muted-foreground">Applications flagged</p>
            </StandardContentCard>

            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Medium Risk</span>
                <Activity className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold">{loading ? '...' : metrics.mediumRisk}</div>
              <p className="text-xs text-muted-foreground">Requires closer review</p>
            </StandardContentCard>

            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Low Risk</span>
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{loading ? '...' : metrics.lowRisk}</div>
              <p className="text-xs text-muted-foreground">Safe to proceed</p>
            </StandardContentCard>

            <StandardContentCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Risk Score Avg</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{loading ? '...' : metrics.avgScore}</div>
              <p className="text-xs text-muted-foreground">Portfolio average</p>
            </StandardContentCard>
          </div>

          {/* Tabs for different risk views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-[#0A1628] p-1 gap-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="factors" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Risk Factors</span>
              </TabsTrigger>
              <TabsTrigger 
                value="assessments" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Assessments</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <StandardContentCard title="Risk Distribution">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        <span className="text-sm">High Risk</span>
                      </div>
                      <span className="text-sm font-medium">{metrics.highRisk}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                        <span className="text-sm">Medium Risk</span>
                      </div>
                      <span className="text-sm font-medium">{metrics.mediumRisk}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm">Low Risk</span>
                      </div>
                      <span className="text-sm font-medium">{metrics.lowRisk}</span>
                    </div>
                  </div>
                </StandardContentCard>

                <StandardContentCard title="Portfolio Health">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Risk Score</span>
                      <span className="text-sm font-medium">{metrics.avgScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Applications</span>
                      <span className="text-sm font-medium">{metrics.highRisk + metrics.mediumRisk + metrics.lowRisk}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High Risk Percentage</span>
                      <span className="text-sm font-medium">
                        {((metrics.highRisk / (metrics.highRisk + metrics.mediumRisk + metrics.lowRisk || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </StandardContentCard>
              </div>
            </TabsContent>

            <TabsContent value="factors" className="space-y-6">
              <StandardContentCard title="Risk Factors Analysis">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Credit Score Range</span>
                    <span className="text-sm font-medium">650-850</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Debt-to-Income Ratio</span>
                    <span className="text-sm font-medium">&lt; 43%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Employment History</span>
                    <span className="text-sm font-medium">2+ years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Down Payment</span>
                    <span className="text-sm font-medium">≥ 20%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Business Age (SBA)</span>
                    <span className="text-sm font-medium">2+ years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Annual Revenue</span>
                    <span className="text-sm font-medium">≥ $100,000</span>
                  </div>
                </div>
              </StandardContentCard>
            </TabsContent>

            <TabsContent value="assessments" className="space-y-6">
              <StandardContentCard title="Recent Risk Assessments">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-sm text-muted-foreground">Loading assessments...</div>
                  ) : metrics.recentAssessments.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No risk assessments available yet. Add leads to see risk analysis.</p>
                    </div>
                  ) : (
                    metrics.recentAssessments.map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{assessment.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(assessment.amount)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getRiskBadge(assessment.riskLevel, assessment.riskScore)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </StandardContentCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}