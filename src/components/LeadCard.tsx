import React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PhoneDialer } from "@/components/PhoneDialer"
import { EmailComposer } from "@/components/EmailComposer"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Building, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatPhoneNumber } from "@/lib/utils"
import { Lead } from "@/types/lead"

interface LeadCardProps {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (leadId: string, leadName: string) => void
  onConvert: (lead: Lead) => void
  hasAdminRole: boolean
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

const getPriorityIcon = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high': return <AlertCircle className="w-3 h-3" />
    case 'medium': return <TrendingUp className="w-3 h-3" />
    case 'low': return <Star className="w-3 h-3" />
    default: return <Star className="w-3 h-3" />
  }
}

export function LeadCard({ lead, onEdit, onDelete, onConvert, hasAdminRole, currentUserId }: LeadCardProps) {
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
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card/95 to-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
      {/* Status Indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${lead.is_converted_to_client ? 'bg-green-500' : 'bg-primary'}`} />
      
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer group-hover:scale-[1.01] transition-transform duration-200" 
            onClick={() => navigate(`/leads/${lead.id}`)}
          >
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-primary/20 ring-2 ring-background shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                  {getInitials(lead.name)}
                </AvatarFallback>
              </Avatar>
              {lead.priority === 'high' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
                  <AlertCircle className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground truncate hover:text-primary transition-colors">
                  {lead.name}
                </h3>
                {lead.is_converted_to_client && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Client
                  </Badge>
                )}
              </div>
              
              {lead.business_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="w-4 h-4 text-primary" />
                  <span className="truncate font-medium">{lead.business_name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>
                  Last contact: {daysSinceContact === 0 ? 'Today' : 
                   daysSinceContact === 1 ? '1 day ago' : 
                   `${daysSinceContact} days ago`}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-primary/10"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border border-border shadow-xl">
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-3 text-primary" />
                Edit Lead Details
              </DropdownMenuItem>
              {!lead.is_converted_to_client && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onConvert(lead); }}
                  className="cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4 mr-3 text-green-600" />
                  Convert to Client
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(lead.id, lead.name); }}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete Lead
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Financial Information */}
        {(lead.loan_amount || lead.loan_type) && (
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Financial Details</span>
            </div>
            
            {lead.loan_type && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loan Type</span>
                <Badge variant="outline" className="text-xs font-medium">
                  {lead.loan_type}
                </Badge>
              </div>
            )}
            
            {lead.loan_amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Requested Amount</span>
                <span className="text-sm font-bold text-primary">
                  ${lead.loan_amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status and Priority */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant={getStageColor(lead.stage)} 
              className="text-xs font-medium px-3 py-1"
            >
              {lead.stage}
            </Badge>
          </div>
          
          <Badge 
            variant={getPriorityColor(lead.priority)} 
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1"
          >
            {getPriorityIcon(lead.priority)}
            <span className="capitalize">{lead.priority}</span>
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <PhoneDialer 
            phoneNumber={lead.phone}
            trigger={
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                <Phone className="w-3 h-3 mr-2" />
                Call
              </Button>
            }
          />
          
          <EmailComposer 
            recipientEmail={lead.email}
            recipientName={lead.name}
            trigger={
              <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                <Mail className="w-3 h-3 mr-2" />
                Email
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}