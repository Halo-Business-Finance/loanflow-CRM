import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Badge component removed - using plain text instead
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export default function PipelineAnalytics() {
  const [pipelineStages, setPipelineStages] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    const fetchStages = async () => {
      const { data: leads } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entities(stage)
        `)

      const map = new Map<string, number>()
      ;(leads || []).forEach((l: any) => {
        const stage = l?.contact_entities?.stage || 'New Lead'
        map.set(stage, (map.get(stage) || 0) + 1)
      })

      setPipelineStages(Array.from(map.entries()).map(([name, value]) => ({ name, value })))
    }

    fetchStages()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline Analytics</h1>
        <p className="text-muted-foreground">
          Detailed analytics and insights for your sales pipeline
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32.1%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +4.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$347K</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Cycle Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28 days</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              3 days faster
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
            <CardDescription>Distribution of deals across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineStages.length === 0 ? (
              <div className="text-sm text-muted-foreground">No pipeline data</div>
            ) : (
              pipelineStages.map((stage) => (
                <div className="flex justify-between items-center" key={stage.name}>
                  <span className="text-sm">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stage.value} deals</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Analysis</CardTitle>
            <CardDescription>Analysis of won and lost deals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-800">Won Deals</div>
                <div className="text-sm text-green-600">This month</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800">12</div>
                <div className="text-sm text-green-600">$1.8M value</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <div className="font-medium text-red-800">Lost Deals</div>
                <div className="text-sm text-red-600">This month</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-800">5</div>
                <div className="text-sm text-red-600">$620K value</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Top Loss Reasons</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Price too high</span>
                  <span className="text-muted-foreground">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Competitor chosen</span>
                  <span className="text-muted-foreground">30%</span>
                </div>
                <div className="flex justify-between">
                  <span>Timeline issues</span>
                  <span className="text-muted-foreground">20%</span>
                </div>
                <div className="flex justify-between">
                  <span>Other</span>
                  <span className="text-muted-foreground">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
          <CardDescription>Performance metrics by loan officer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <div className="font-medium">Alex Rodriguez</div>
                <div className="text-sm text-muted-foreground">Senior Loan Officer</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Deals</div>
                  <div className="font-bold">8</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Value</div>
                  <div className="font-bold">$780K</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                  <div className="font-bold">75%</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <div className="font-medium">Emma Thompson</div>
                <div className="text-sm text-muted-foreground">Loan Officer</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Deals</div>
                  <div className="font-bold">6</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Value</div>
                  <div className="font-bold">$520K</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                  <div className="font-bold">83%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}