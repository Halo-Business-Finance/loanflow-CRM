import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
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
    <StandardPageLayout>
      <StandardPageHeader
        title="Pipeline Analytics"
        description="Detailed analytics and insights for your sales pipeline"
      />

      <ResponsiveContainer>
        <div className="space-y-6">

          {/* Metrics removed - use real data from leads table if needed */}

          <div className="grid gap-6 md:grid-cols-2">
            <StandardContentCard title="Pipeline by Stage">
              <div className="space-y-4">
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
              </div>
            </StandardContentCard>

            <StandardContentCard title="Win/Loss Analysis">
              <div className="text-sm text-muted-foreground text-center py-8">
                No win/loss data available. Track deal outcomes to see analysis here.
              </div>
            </StandardContentCard>
          </div>

          <StandardContentCard title="Agent Performance">
            <div className="text-sm text-muted-foreground text-center py-8">
              No agent performance data available yet.
            </div>
          </StandardContentCard>
        </div>
      </ResponsiveContainer>
    </StandardPageLayout>
  )
}