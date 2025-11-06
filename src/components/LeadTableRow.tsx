import React from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  ArrowRight, 
  Trash2,
  Edit,
  MoreHorizontal,
  Building2,
  DollarSign,
  FileText,
  Eye
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Lead } from "@/types/lead"
import { ClickablePhone } from "@/components/ui/clickable-phone"

interface LeadTableRowProps {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (leadId: string, leadName: string) => void
  onConvert: (lead: Lead) => void
  hasAdminRole: boolean
  onRefresh?: () => void
  currentUserId?: string
  isSelected?: boolean
  onSelectChange?: (selected: boolean) => void
}

export function LeadTableRow({ 
  lead, 
  onEdit, 
  onDelete, 
  onConvert, 
  hasAdminRole, 
  onRefresh, 
  currentUserId,
  isSelected = false,
  onSelectChange
}: LeadTableRowProps) {
  const navigate = useNavigate()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const canDelete = hasAdminRole

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <tr 
      className={`group border-b border-border/50 hover:bg-accent/3 transition-colors cursor-pointer ${
        lead.is_converted_to_client ? 'opacity-60' : ''
      }`}
      onClick={() => navigate(`/leads/${lead.id}`)}
    >
      {/* Column 1: Lead Info with Checkbox */}
      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              onSelectChange?.(checked as boolean)
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${lead.name}`}
          />
          <div className="flex flex-col gap-1.5 min-w-0">
            {lead.business_name && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground truncate">{lead.business_name}</span>
              </div>
            )}
            <span className="text-xs text-foreground group-hover:text-primary transition-colors truncate">
              {lead.name}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">
                Loan ID: {String(lead.lead_number).padStart(3, '0')}
              </span>
              {lead.is_converted_to_client && (
                <Badge 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0 h-5 bg-emerald-500/10 text-emerald-600 border-0 dark:text-emerald-400"
                >
                  Converted
                </Badge>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Column 2: Contact Information */}
      <td className="px-2 py-4">
        <div className="space-y-1.5">
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <ClickablePhone 
                phoneNumber={lead.phone} 
                className="text-xs text-foreground hover:text-primary transition-colors" 
              />
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <a 
                href={`mailto:${lead.email}`}
                className="text-xs text-foreground hover:text-primary transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.email}
              </a>
            </div>
          )}
          {!lead.phone && !lead.email && (
            <span className="text-xs text-muted-foreground italic">No contact</span>
          )}
        </div>
      </td>

      {/* Column 3: Lead Details */}
      <td className="px-4 py-4">
        <div className="space-y-1.5">
          {lead.loan_type && (
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-foreground">
                {lead.loan_type}
              </span>
            </div>
          )}
          {lead.loan_amount && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-foreground">
                {formatCurrency(lead.loan_amount)}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Column 4: Status (Loan Stage & Priority) */}
      <td className="px-4 py-4">
        <div className="space-y-1.5">
          {lead.stage && (
            <Badge 
              variant="secondary" 
              className="text-xs px-2 py-0.5 bg-secondary/30 hover:bg-secondary/50 transition-colors border-0"
            >
              {lead.stage}
            </Badge>
          )}
          {lead.priority && (
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(lead.priority)}`} />
              <span className="text-xs text-muted-foreground capitalize">
                {lead.priority}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Column 5: Actions */}
      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="h-8 px-3 hover:bg-accent hover:text-foreground transition-colors"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">View</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(lead)}
            className="h-8 px-3 hover:bg-accent hover:text-foreground transition-colors"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Edit</span>
          </Button>
          
          {!lead.is_converted_to_client && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onConvert(lead)}
              className="h-8 px-3 hover:bg-accent hover:text-foreground transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Convert</span>
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(lead.id, lead.name)}
              className="h-8 px-3 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Delete</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}