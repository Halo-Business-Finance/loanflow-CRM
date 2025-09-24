import React from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  Trash2,
  Edit,
  MoreHorizontal,
  Calendar,
  UserPlus
} from "lucide-react"
import { formatPhoneNumber } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Lead } from "@/types/lead"
import { LeadAssignment } from "@/components/leads/LeadAssignment"

interface LeadTableRowProps {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (leadId: string, leadName: string) => void
  onConvert: (lead: Lead) => void
  hasAdminRole: boolean
  onRefresh?: () => void
  currentUserId?: string
}

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return 'destructive'
    case 'medium': return 'default'
    case 'low': return 'secondary'
    default: return 'secondary'
  }
}

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'New Lead': return 'outline'
    case 'Initial Contact': return 'secondary'
    case 'Qualified': return 'default'
    case 'Application': return 'default'
    case 'Loan Approved': return 'default'
    case 'Documentation': return 'default'
    case 'Closing': return 'default'
    case 'Funded': return 'default'
    default: return 'secondary'
  }
}

export function LeadTableRow({ lead, onEdit, onDelete, onConvert, hasAdminRole, onRefresh, currentUserId }: LeadTableRowProps) {
  const navigate = useNavigate()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const daysSinceContact = lead.last_contact 
    ? Math.floor((Date.now() - new Date(lead.last_contact).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Check if user can delete this lead (only admin and super_admin)
  const canDelete = hasAdminRole

  return (
    <TooltipProvider delayDuration={300}>
    <tr 
      className={`group border-b border-muted/20 hover:bg-muted/30 hover:outline hover:outline-1 hover:outline-white transition-all cursor-pointer ${
        lead.is_converted_to_client ? 'opacity-60' : ''
      }`}
      onClick={() => navigate(`/leads/${lead.id}`)}
    >
      {/* Lead Info */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-muted/30 dark:border-white">
            <AvatarFallback className="bg-primary/10 text-primary dark:text-white font-medium text-sm">
              {getInitials(lead.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-foreground dark:text-white truncate">{lead.name}</span>
              {lead.is_converted_to_client && (
                <span className="text-xs font-medium">Client</span>
              )}
            </div>
            {lead.business_name && (
              <div className="text-sm text-muted-foreground dark:text-white truncate">{lead.business_name}</div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-white mt-1">
              <Calendar className="w-3 h-3 text-muted-foreground dark:text-white" />
              <span>
                {daysSinceContact === 0 ? 'Today' : 
                 daysSinceContact === 1 ? '1 day ago' : 
                 `${daysSinceContact} days ago`}
              </span>
            </div>
          </div>
        </div>
      </td>


      {/* Loan Amount */}
      <td className="p-4 text-right">
        {lead.loan_amount && (
          <div className="font-medium text-foreground dark:text-white text-sm">
            ${lead.loan_amount.toLocaleString()}
          </div>
        )}
      </td>

      {/* Loan Type */}
      <td className="p-4">
        {lead.loan_type && (
          <div className="text-sm text-foreground dark:text-white">
            {lead.loan_type}
          </div>
        )}
      </td>

      {/* Stage */}
      <td className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs">
            {lead.stage}
          </span>
        </div>
      </td>

      {/* Priority */}
      <td className="p-4">
        <span className="text-xs">
          {lead.priority}
        </span>
      </td>

      {/* Actions */}
      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 justify-center">
          <LeadAssignment
            leadId={lead.id}
            leadName={lead.name}
            currentAssignments={{
              loan_originator_id: lead.loan_originator_id,
              loan_processor_id: lead.loan_processor_id,
              closer_id: lead.closer_id,
              funder_id: lead.funder_id
            }}
            onAssignmentUpdate={onRefresh}
            trigger={
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <UserPlus className="h-3 w-3" />
                    Assign
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Assign this lead to team members for processing</p>
                </TooltipContent>
              </Tooltip>
            }
          />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(lead)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Lead
              </DropdownMenuItem>
              {!lead.is_converted_to_client && (
                <DropdownMenuItem onClick={() => onConvert(lead)}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert to Client
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(lead.id, lead.name)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lead
                </DropdownMenuItem>
              )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>
              <p>Additional actions: Edit, Convert to Client, or Delete</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </td>

    </tr>
  </TooltipProvider>
  )
}