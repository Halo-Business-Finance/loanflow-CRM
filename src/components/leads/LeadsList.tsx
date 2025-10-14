import { Lead } from "@/types/lead"
import { LeadTableRow } from "@/components/LeadTableRow"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface LeadsListProps {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (leadId: string, leadName: string) => void
  onConvert: (lead: Lead) => void
  onRefresh?: () => void
  hasAdminRole: boolean
  currentUserId?: string
  selectedLeads: string[]
  onSelectAll: (selected: boolean) => void
  onSelectLead: (leadId: string, selected: boolean) => void
}

export function LeadsList({ 
  leads, 
  onEdit, 
  onDelete, 
  onConvert, 
  onRefresh,
  hasAdminRole,
  currentUserId,
  selectedLeads,
  onSelectAll,
  onSelectLead
}: LeadsListProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No leads found matching your criteria.</p>
      </div>
    )
  }

  const allSelected = leads.length > 0 && selectedLeads.length === leads.length
  const someSelected = selectedLeads.length > 0 && selectedLeads.length < leads.length

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border hover:bg-transparent bg-muted/30">
            <TableHead className="w-[300px] px-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all leads"
                  className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
                <span className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Lead Name</span>
              </div>
            </TableHead>
            <TableHead className="px-2 font-medium text-xs uppercase tracking-wider text-muted-foreground">Contact</TableHead>
            <TableHead className="px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Details</TableHead>
            <TableHead className="px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
            <TableHead className="px-4 text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <LeadTableRow
              key={lead.id}
              lead={lead}
              onEdit={onEdit}
              onDelete={onDelete}
              onConvert={onConvert}
              onRefresh={onRefresh}
              hasAdminRole={hasAdminRole}
              currentUserId={currentUserId}
              isSelected={selectedLeads.includes(lead.id)}
              onSelectChange={(selected) => onSelectLead(lead.id, selected)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}