import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription"
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess"

export default function PipelineAnalytics() {
  const [pipelineStages, setPipelineStages] = useState<{ name: string; value: number }[]>([])
  const { user } = useAuth()
  const { hasRole } = useRoleBasedAccess()

  const fetchStages = async () => {
    // Role-aware visibility: managers/admins see all, others see own
    const isManagerOrAdmin = hasRole('manager') || hasRole('admin') || hasRole('super_admin')

    let query = supabase
      .from('leads')
      .select(`
        *,
        contact_entity:contact_entities!leads_contact_entity_id_fkey(stage)
      `)

    if (!isManagerOrAdmin) {
      query = query.eq('user_id', user?.id)
    }

    const { data, error } = await query
    if (error) {
      console.warn('[PipelineAnalytics] fetchStages error:', error)
      setPipelineStages([])
      return
    }

    const map = new Map<string, number>()
    ;(data as any[] | null | undefined)?.forEach((l: any) => {
      const stage = l?.contact_entity?.stage ?? l?.stage ?? 'New Lead'
      map.set(stage, (map.get(stage) || 0) + 1)
    })

    setPipelineStages(Array.from(map.entries()).map(([name, value]) => ({ name, value })))
  }

  useEffect(() => {
    fetchStages()
  }, [user])

  // Live updates
  useRealtimeSubscription({ table: 'leads', event: '*', onChange: fetchStages })
  useRealtimeSubscription({ table: 'contact_entities', event: '*', onChange: fetchStages })

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