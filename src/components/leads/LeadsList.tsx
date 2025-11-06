import { Lead } from "@/types/lead"
import { LeadTableRow } from "@/components/LeadTableRow"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
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
  sortColumn?: 'name' | 'created_at' | 'loan_amount' | 'stage' | null
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: 'name' | 'created_at' | 'loan_amount' | 'stage') => void
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
  onSelectLead,
  sortColumn,
  sortDirection,
  onSort
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

  const SortIcon = ({ column }: { column: 'name' | 'created_at' | 'loan_amount' | 'stage' }) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3.5 w-3.5 ml-1" />
      : <ArrowDown className="h-3.5 w-3.5 ml-1" />
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="sticky top-0 z-10 border-b border-border hover:bg-transparent bg-muted/30 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
            <TableHead className="w-[220px] px-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all leads"
                  className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSort?.('name')}
                  className="h-auto p-0 hover:bg-transparent font-medium text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  Lead Name
                  <SortIcon column="name" />
                </Button>
              </div>
            </TableHead>
            <TableHead className="px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Contact Information</TableHead>
            <TableHead className="px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort?.('loan_amount')}
                className="h-auto p-0 hover:bg-transparent font-medium text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Loan Details
                <SortIcon column="loan_amount" />
              </Button>
            </TableHead>
            <TableHead className="px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort?.('stage')}
                className="h-auto p-0 hover:bg-transparent font-medium text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Lead Status
                <SortIcon column="stage" />
              </Button>
            </TableHead>
            <TableHead className="w-[280px] px-4 text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead, index) => (
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
              isEvenRow={index % 2 === 0}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}