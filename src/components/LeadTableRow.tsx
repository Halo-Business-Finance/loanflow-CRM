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
  DollarSign
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
      className={`group border-b border-border hover:bg-muted/50 transition-all ${
        lead.is_converted_to_client ? 'opacity-60' : ''
      }`}
    >
      {/* Column 1: Lead Info with Checkbox */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              onSelectChange?.(checked as boolean)
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${lead.name}`}
          />
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => navigate(`/leads/${lead.id}`)}
          >
            <Avatar className="h-12 w-12 border-2 border-border">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {getInitials(lead.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-base text-foreground truncate">
                  {lead.name}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                Lead ID: {lead.id.slice(0, 8)}
              </div>
              <div className="flex items-center gap-2">
                {lead.is_converted_to_client ? (
                  <Badge variant="default" className="text-xs gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Converted
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Column 2: Contact Information */}
      <td className="px-6 py-4">
        <div className="space-y-2">
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <ClickablePhone phoneNumber={lead.phone} className="text-foreground hover:text-primary" />
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={`mailto:${lead.email}`}
                className="text-foreground hover:text-primary truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.email}
              </a>
            </div>
          )}
          {lead.business_name && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">{lead.business_name}</span>
            </div>
          )}
          {!lead.phone && !lead.email && (
            <span className="text-sm text-muted-foreground">No contact info</span>
          )}
        </div>
      </td>

      {/* Column 3: Lead Details */}
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {lead.loan_type && (
              <Badge variant="outline" className="text-xs">
                {lead.loan_type}
              </Badge>
            )}
          </div>
          {lead.loan_amount && (
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>{formatCurrency(lead.loan_amount)}</span>
            </div>
          )}
          {lead.stage && (
            <Badge variant="secondary" className="text-xs">
              {lead.stage}
            </Badge>
          )}
          {lead.priority && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(lead.priority)}`} />
              <span className="text-xs text-muted-foreground capitalize">{lead.priority} Priority</span>
            </div>
          )}
        </div>
      </td>

      {/* Column 4: Actions */}
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(lead)}
            className="h-9 w-9 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                View Details
              </DropdownMenuItem>
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
        </div>
      </td>
    </tr>
  )
}