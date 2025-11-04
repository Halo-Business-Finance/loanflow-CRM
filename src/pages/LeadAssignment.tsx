import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
// Badge component removed - using plain text instead
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Loader2, BarChart3, Users } from "lucide-react"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription"

interface UnassignedLead {
  id: string
  name: string
  email: string
  stage: string
  priority: string
  lead_id: string
}

interface TeamMember {
  id: string
  first_name: string
  last_name: string
  leadCount: number
}

export default function LeadAssignmentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [unassignedLeads, setUnassignedLeads] = useState<UnassignedLead[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()

  // Fetch unassigned leads (leads without user assignment)
  const fetchUnassignedLeads = async () => {
    try {
      // Step 1: get unassigned leads ids only (avoid cross-table RLS join issues)
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select(`id, contact_entity_id, created_at`)
        .is('user_id', null)
        .order('created_at', { ascending: false })
        .limit(50)

      if (leadsError) throw leadsError

      if (!leads || leads.length === 0) {
        setUnassignedLeads([])
        return
      }

      const contactIds = leads.map(l => l.contact_entity_id).filter(Boolean)

      // Step 2: fetch related contact details
      const { data: contacts, error: contactsError } = await supabase
        .from('contact_entities')
        .select('id, name, email, stage, priority')
        .in('id', contactIds as string[])

      if (contactsError) throw contactsError

      const contactsById = new Map((contacts || []).map(c => [c.id, c]))

      const formattedLeads = (leads || []).map(lead => {
        const ce: any = contactsById.get(lead.contact_entity_id)
        return ce ? {
          id: ce.id,
          lead_id: lead.id,
          name: ce.name,
          email: ce.email,
          stage: ce.stage || 'New',
          priority: ce.priority || 'Medium'
        } : null
      }).filter(Boolean) as UnassignedLead[]

      setUnassignedLeads(formattedLeads)
    } catch (error: any) {
      console.error('Error fetching unassigned leads:', error)
      toast({
        title: "Error",
        description: `Failed to load unassigned leads${error?.message ? `: ${error.message}` : ''}`,
        variant: "destructive"
      })
    }
  }

  // Fetch team members with lead counts
  const fetchTeamMembers = async () => {
    try {
      // Get all active team members
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('is_active', true)

      if (profilesError) throw profilesError

      // Get lead counts for each team member
      const membersWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count, error } = await supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profile.id)

          return {
            ...profile,
            leadCount: error ? 0 : (count || 0)
          }
        })
      )

      setTeamMembers(membersWithCounts)
    } catch (error) {
      console.error('Error fetching team members:', error)
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      })
    }
  }

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchUnassignedLeads(), fetchTeamMembers()])
      setLoading(false)
    }
    loadData()
  }, [])

  // Real-time updates for leads
  useRealtimeSubscription({
    table: 'leads',
    onChange: () => {
      fetchUnassignedLeads()
      fetchTeamMembers()
    }
  })

  // Handle assignment
  const handleAssignment = async (leadId: string) => {
    const agentId = selectedAgent[leadId]
    if (!agentId) {
      toast({
        title: "No agent selected",
        description: "Please select an agent before assigning",
        variant: "destructive"
      })
      return
    }

    const lead = unassignedLeads.find(l => l.id === leadId)
    if (!lead) return

    setAssigning(leadId)
    try {
      const { error } = await supabase
        .from('leads')
        .update({ user_id: agentId })
        .eq('id', lead.lead_id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Lead assigned successfully"
      })

      // Refresh data
      await Promise.all([fetchUnassignedLeads(), fetchTeamMembers()])
      
      // Clear selection
      setSelectedAgent(prev => {
        const newState = { ...prev }
        delete newState[leadId]
        return newState
      })
    } catch (error) {
      console.error('Error assigning lead:', error)
      toast({
        title: "Error",
        description: "Failed to assign lead",
        variant: "destructive"
      })
    } finally {
      setAssigning(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground no-underline">Lead Management</h1>
            <p className="text-sm text-muted-foreground">Assign leads to team members and view performance statistics</p>
          </div>
          
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
        
        <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Unassigned Leads */}
          <StandardContentCard
            title="Unassigned Leads"
            className="h-fit border border-blue-600"
              headerActions={
                <span className="text-sm text-muted-foreground">
                  Leads waiting to be assigned to team members
                </span>
              }
            >
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start justify-between gap-4 py-3 border-b">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-[140px]" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))
                ) : unassignedLeads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No unassigned leads</p>
                    <p className="text-xs mt-1">All leads are fully assigned</p>
                  </div>
                ) : (
                  unassignedLeads.map((lead) => (
                    <div key={lead.id} className="flex items-start justify-between gap-4 py-3 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{lead.name}</span>
                          <span className="text-xs px-1.5 py-0 font-medium">
                            {lead.priority}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{lead.email}</div>
                        <div className="mt-1">
                          <span className="text-xs font-medium">{lead.stage}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Select
                          value={selectedAgent[lead.id] || ""}
                          onValueChange={(value) => setSelectedAgent(prev => ({ ...prev, [lead.id]: value }))}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Assign to..." />
                          </SelectTrigger>
                          <SelectContent>
                            {teamMembers.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.first_name} {member.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleAssignment(lead.id)}
                          disabled={assigning === lead.id || !selectedAgent[lead.id]}
                        >
                          {assigning === lead.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
          </StandardContentCard>

          {/* Team Workload */}
          <StandardContentCard
            title="Team Workload"
            className="h-fit border border-blue-600"
              headerActions={
                <span className="text-sm text-muted-foreground">
                  Current lead distribution among team members
                </span>
              }
            >
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No team members found</p>
                  </div>
                ) : (
                  teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{member.first_name} {member.last_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {member.leadCount} active leads
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold">
                        {member.leadCount}
                      </span>
                    </div>
                  ))
                )}
              </div>
          </StandardContentCard>
        </div>

        {/* Assignment Rules */}
        <StandardContentCard title="Assignment Rules" className="border border-blue-600">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure automatic lead assignment rules
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Default Assignment</label>
                  <Select defaultValue="round-robin">
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round-robin">Round Robin</SelectItem>
                      <SelectItem value="least-busy">Least Busy</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">High Priority Leads</label>
                  <Select defaultValue="senior">
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="senior">Senior Agents</SelectItem>
                      <SelectItem value="available">Next Available</SelectItem>
                      <SelectItem value="specific">Specific Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">Max Leads per Agent</label>
                  <Select defaultValue="20">
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-2">
                <Button size="sm" className="h-9">Save Assignment Rules</Button>
            </div>
          </div>
        </StandardContentCard>
        </div>
      </div>
    </div>
  )
}