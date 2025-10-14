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
      className={`group border-b border-border/40 hover:bg-accent/5 transition-all duration-200 ${
        lead.is_converted_to_client ? 'opacity-60' : ''
      }`}
    >
      {/* Column 1: Lead Info with Checkbox */}
      <td className="px-6 py-6">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              onSelectChange?.(checked as boolean)
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${lead.name}`}
            className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer group/lead"
            onClick={() => navigate(`/leads/${lead.id}`)}
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-base text-foreground truncate group-hover/lead:text-primary transition-colors">
                  {lead.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground tracking-wide">
                  LEAD ID: {String(lead.lead_number).padStart(3, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {lead.is_converted_to_client ? (
                  <Badge 
                    variant="default" 
                    className="text-xs font-medium px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Converted
                  </Badge>
                ) : (
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium px-2.5 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/15"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Column 2: Contact Information */}
      <td className="px-6 py-6">
        <div className="space-y-3">
          {lead.phone && (
            <div className="flex items-center gap-3 group/contact">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 group-hover/contact:bg-primary/10 transition-colors">
                <Phone className="w-4 h-4 text-muted-foreground group-hover/contact:text-primary transition-colors" />
              </div>
              <ClickablePhone 
                phoneNumber={lead.phone} 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors" 
              />
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-3 group/contact">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 group-hover/contact:bg-primary/10 transition-colors">
                <Mail className="w-4 h-4 text-muted-foreground group-hover/contact:text-primary transition-colors" />
              </div>
              <a 
                href={`mailto:${lead.email}`}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {lead.email}
              </a>
            </div>
          )}
          {lead.business_name && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground truncate">{lead.business_name}</span>
            </div>
          )}
          {!lead.phone && !lead.email && (
            <span className="text-sm text-muted-foreground italic">No contact information</span>
          )}
        </div>
      </td>

      {/* Column 3: Lead Details */}
      <td className="px-6 py-6">
        <div className="space-y-3">
          {lead.loan_type && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="text-xs font-semibold px-3 py-1 bg-background border-border/60"
              >
                {lead.loan_type}
              </Badge>
            </div>
          )}
          {lead.loan_amount && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border/40">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground tracking-tight">
                {lead.loan_amount.toLocaleString()}
              </span>
            </div>
          )}
          {lead.stage && (
            <Badge 
              variant="secondary" 
              className="text-xs font-medium px-3 py-1 bg-secondary/50 hover:bg-secondary/70 transition-colors"
            >
              {lead.stage}
            </Badge>
          )}
          {lead.priority && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-background rounded-lg border border-border/40">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(lead.priority)} shadow-sm`} />
              <span className="text-xs font-medium text-foreground capitalize">
                {lead.priority} Priority
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Column 4: Actions */}
      <td className="px-6 py-6 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(lead)}
            className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-52 bg-card border-border shadow-lg z-50"
            >
              <DropdownMenuItem 
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="cursor-pointer focus:bg-accent"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onEdit(lead)}
                className="cursor-pointer focus:bg-accent"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Lead
              </DropdownMenuItem>
              {!lead.is_converted_to_client && (
                <DropdownMenuItem 
                  onClick={() => onConvert(lead)}
                  className="cursor-pointer focus:bg-accent"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert to Client
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-border/60" />
              {canDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(lead.id, lead.name)}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
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