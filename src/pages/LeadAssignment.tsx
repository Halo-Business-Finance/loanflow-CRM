import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, RotateCcw } from "lucide-react"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"

export default function LeadAssignment() {
  const unassignedLeads = [
    { id: 1, name: "John Smith", email: "john@example.com", source: "Website", priority: "High" },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", source: "Referral", priority: "Medium" },
    { id: 3, name: "Mike Davis", email: "mike@example.com", source: "Social Media", priority: "Low" },
  ]

  const agents = [
    { id: 1, name: "Alex Rodriguez", avatar: "", leadCount: 12 },
    { id: 2, name: "Emma Thompson", avatar: "", leadCount: 8 },
    { id: 3, name: "James Wilson", avatar: "", leadCount: 15 },
    { id: 4, name: "Lisa Chen", avatar: "", leadCount: 6 },
  ]

  return (
    <div className="flex flex-col h-full bg-background">
      <StandardPageHeader
        title="Lead Assignment"
        description="Assign leads to team members for optimal distribution"
      />
      
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Unassigned Leads */}
            <StandardContentCard
              title="Unassigned Leads"
              className="h-fit"
              headerActions={
                <span className="text-sm text-muted-foreground">
                  Leads waiting to be assigned to team members
                </span>
              }
            >
              <div className="space-y-3">
                {unassignedLeads.map((lead) => (
                  <div key={lead.id} className="flex items-start justify-between gap-4 py-3 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{lead.name}</span>
                        <Badge 
                          variant={lead.priority === 'High' ? 'destructive' : 'outline'}
                          className="text-xs px-1.5 py-0"
                        >
                          {lead.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{lead.email}</div>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id.toString()}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" className="h-8 w-8 p-0">
                        <UserPlus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </StandardContentCard>

            {/* Team Workload */}
            <StandardContentCard
              title="Team Workload"
              className="h-fit"
              headerActions={
                <span className="text-sm text-muted-foreground">
                  Current lead distribution among team members
                </span>
              }
            >
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback className="text-xs">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {agent.leadCount} active leads
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {agent.leadCount}
                      </Badge>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </StandardContentCard>
          </div>

          {/* Assignment Rules */}
          <StandardContentCard title="Assignment Rules">
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