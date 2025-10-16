import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
// Badge component removed - using plain text instead
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ActionReminder } from "@/components/ActionReminder"
import { PhoneDialer } from "@/components/PhoneDialer"
import { EmailComposer } from "@/components/EmailComposer"
import { ClickablePhone } from "@/components/ui/clickable-phone"
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess"

import { formatNumber, formatCurrency, formatPhoneNumber } from "@/lib/utils"
import { useNotifications } from "@/hooks/useNotifications"
import { format } from "date-fns"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Building, 
  CreditCard, 
  Save,
  Edit,
  Phone as PhoneIcon,
  Calendar,
  Send,
  UserCheck,
  Home,
  CheckCircle,
  XCircle,
  Target,
  FileText,
  Bell,
  Trash2,
  ChevronDown,
  ShoppingCart,
  Percent,
  UserPlus
} from "lucide-react"

import { Lead, Client as ClientType, LOAN_TYPES } from "@/types/lead"
import { mapLeadFields, mapClientFields, extractContactEntityData, LEAD_WITH_CONTACT_QUERY, CLIENT_WITH_CONTACT_QUERY } from "@/lib/field-mapping"

export default function LeadDetail() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { createNotification } = useNotifications()
  const { canDeleteLeads } = useRoleBasedAccess()
  
  // Debug logging
  console.log('LeadDetail component - params:', params, 'id:', id, 'window.location:', window.location.pathname)

  const [lead, setLead] = useState<Lead | null>(null)
  const [client, setClient] = useState<ClientType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [callNotes, setCallNotes] = useState("")
  const [generalNotes, setGeneralNotes] = useState("")
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [editableFields, setEditableFields] = useState({
    name: "",
    email: "",
    phone: "",
    phone_ext: "",
    ownership_percentage: "",
    home_address: "",
    home_city: "",
    home_state: "",
    home_zip_code: "",
    business_name: "",
    business_address: "",
    business_city: "",
    business_state: "",
    business_zip_code: "",
    naics_code: "",
    ownership_structure: "",
    owns_property: false,
    property_payment_amount: "",
    year_established: "",
    loan_amount: "",
    loan_type: "",
    stage: "",
    priority: "",
    credit_score: "",
    net_operating_income: "",
    bank_lender_name: "",
    annual_revenue: "",
    interest_rate: "",
    maturity_date: "",
    existing_loan_amount: "",
    bdo_name: "",
    bdo_telephone: "",
    bdo_email: "",
    first_name: "",
    last_name: "",
    personal_email: "",
    mobile_phone: "",
    processor_name: "",
    pos_system: "",
    monthly_processing_volume: "",
    average_transaction_size: "",
    current_processing_rate: ""
  })

  const isValidUuid = (value?: string) =>
    !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)


  useEffect(() => {
    console.log('LeadDetail useEffect - id:', id, 'user:', user?.id)
    
    if (!user) return

    if (!isValidUuid(id) || id === ':id') {
      navigate('/leads', { replace: true })
      return
    }
    
    fetchLead()
  }, [id, user])

  const fetchLead = async () => {
    try {
      console.log('Fetching lead with ID:', id)
      
      if (!isValidUuid(id)) {
        // Guard against invalid URLs
        navigate('/leads', { replace: true })
        return
      }
      
      const { data, error } = await supabase
        .from('leads')
        .select(LEAD_WITH_CONTACT_QUERY)
        .eq('id', id)
        .maybeSingle()

      console.log('Lead fetch result:', { data, error })

      if (error) throw error
      
      if (!data) {
        toast({
          title: "Error",
          description: "Lead not found or you don't have permission to view it",
          variant: "destructive",
        })
        navigate('/leads')
        return
      }
      
      const mergedLead = {
        ...data,
        ...data.contact_entity,
        id: data.id, // Preserve the actual lead ID
        contact_entity_id: data.contact_entity?.id // Store contact entity ID separately
      }
      setLead(mergedLead)
      setCallNotes(mergedLead.call_notes || "")
      setGeneralNotes(mergedLead.notes || "")
      
      setEditableFields({
        name: mergedLead.name || "",
        email: mergedLead.email || "",
        phone: mergedLead.phone || "",
        phone_ext: (mergedLead as any).phone_ext || "",
        ownership_percentage: mergedLead.ownership_percentage?.toString() || "",
        home_address: (mergedLead as any).home_address || "",
        home_city: (mergedLead as any).home_city || "",
        home_state: (mergedLead as any).home_state || "",
        home_zip_code: (mergedLead as any).home_zip_code || "",
        business_name: mergedLead.business_name || "",
        business_address: mergedLead.business_address || "",
        business_city: mergedLead.business_city || "",
        business_state: mergedLead.business_state || "",
        business_zip_code: mergedLead.business_zip_code || "",
        naics_code: mergedLead.naics_code || "",
        ownership_structure: mergedLead.ownership_structure || "",
        owns_property: mergedLead.owns_property || false,
        property_payment_amount: mergedLead.property_payment_amount?.toString() || "",
        year_established: mergedLead.year_established?.toString() || "",
        loan_amount: mergedLead.loan_amount?.toString() || "",
        loan_type: mergedLead.loan_type || "",
        stage: mergedLead.stage || "",
        priority: mergedLead.priority || "",
        credit_score: mergedLead.credit_score?.toString() || "",
        net_operating_income: mergedLead.net_operating_income?.toString() || "",
        bank_lender_name: mergedLead.bank_lender_name || "",
        annual_revenue: mergedLead.annual_revenue?.toString() || "",
        interest_rate: mergedLead.interest_rate?.toString() || "",
        maturity_date: mergedLead.maturity_date || "",
        existing_loan_amount: mergedLead.existing_loan_amount?.toString() || "",
        bdo_name: mergedLead.bdo_name || "",
        bdo_telephone: mergedLead.bdo_telephone || "",
        bdo_email: mergedLead.bdo_email || "",
        first_name: mergedLead.first_name || "",
        last_name: mergedLead.last_name || "",
        personal_email: mergedLead.personal_email || "",
        mobile_phone: mergedLead.mobile_phone || "",
        processor_name: mergedLead.processor_name || "",
        pos_system: mergedLead.pos_system || "",
        monthly_processing_volume: mergedLead.monthly_processing_volume?.toString() || "",
        average_transaction_size: mergedLead.average_transaction_size?.toString() || "",
        current_processing_rate: mergedLead.current_processing_rate?.toString() || ""
      })
      
      if (data.is_converted_to_client) {
        await fetchClientData(data.id)
      }
    } catch (error) {
      console.error('Error fetching lead:', error)
      toast({
        title: "Error",
        description: "Failed to fetch lead details",
        variant: "destructive",
      })
      navigate('/leads')
    } finally {
      setLoading(false)
    }
  }

  const fetchClientData = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(CLIENT_WITH_CONTACT_QUERY)
        .eq('lead_id', leadId)
        .single()

      if (error) return
      
      const mergedClient = mapClientFields(data)
      setClient(mergedClient)
    } catch (error) {
      console.error('Error fetching client:', error)
    }
  }

  const saveLeadChanges = async () => {
    if (!lead || !user) return

    try {
      const contactUpdateData: any = {
        name: editableFields.name,
        email: editableFields.email,
        phone: editableFields.phone,
        ownership_percentage: editableFields.ownership_percentage ? parseFloat(editableFields.ownership_percentage) : null,
        business_name: editableFields.business_name,
        business_address: editableFields.business_address,
        business_city: editableFields.business_city,
        business_state: editableFields.business_state,
        business_zip_code: editableFields.business_zip_code,
        naics_code: editableFields.naics_code,
        ownership_structure: editableFields.ownership_structure,
        owns_property: editableFields.owns_property,
        property_payment_amount: editableFields.property_payment_amount ? parseFloat(editableFields.property_payment_amount) : null,
        year_established: editableFields.year_established ? parseInt(editableFields.year_established) : null,
        loan_amount: editableFields.loan_amount ? parseFloat(editableFields.loan_amount) : null,
        loan_type: editableFields.loan_type,
        stage: editableFields.stage,
        priority: editableFields.priority,
        credit_score: editableFields.credit_score ? parseInt(editableFields.credit_score) : null,
        net_operating_income: editableFields.net_operating_income ? parseFloat(editableFields.net_operating_income) : null,
        bank_lender_name: editableFields.bank_lender_name,
        annual_revenue: editableFields.annual_revenue ? parseFloat(editableFields.annual_revenue) : null,
        interest_rate: editableFields.interest_rate ? parseFloat(editableFields.interest_rate) : null,
        maturity_date: editableFields.maturity_date || null,
        existing_loan_amount: editableFields.existing_loan_amount ? parseFloat(editableFields.existing_loan_amount) : null,
        bdo_name: editableFields.bdo_name,
        bdo_telephone: editableFields.bdo_telephone,
        bdo_email: editableFields.bdo_email,
        first_name: editableFields.first_name,
        last_name: editableFields.last_name,
        personal_email: editableFields.personal_email,
        mobile_phone: editableFields.mobile_phone,
        processor_name: editableFields.processor_name,
        pos_system: editableFields.pos_system,
        monthly_processing_volume: editableFields.monthly_processing_volume ? parseFloat(editableFields.monthly_processing_volume) : null,
        average_transaction_size: editableFields.average_transaction_size ? parseFloat(editableFields.average_transaction_size) : null,
        current_processing_rate: editableFields.current_processing_rate ? parseFloat(editableFields.current_processing_rate) : null,
        call_notes: callNotes,
        notes: generalNotes
      }

      const { error: contactError } = await supabase
        .from('contact_entities')
        .update(contactUpdateData)
        .eq('id', lead.contact_entity_id)

      if (contactError) throw contactError

      const leadUpdateData: any = {
        last_contact: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: leadError } = await supabase
        .from('leads')
        .update(leadUpdateData)
        .eq('id', lead.id)

      if (leadError) throw leadError

      // Create audit log entry for the activity
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action: 'lead_updated',
          table_name: 'contact_entities',
          record_id: lead.contact_entity_id,
          new_values: {
            call_notes: callNotes,
            notes: generalNotes,
            ...contactUpdateData
          }
        })

      if (auditError) {
        console.error('Error creating audit log:', auditError)
      }

      toast({
        title: "Success",
        description: "Lead information updated successfully",
      })
      
      setIsEditing(false)
      fetchLead()
    } catch (error) {
      console.error('Error updating lead:', error)
      toast({
        title: "Error",
        description: `Failed to update lead information: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const deleteLead = async () => {
    if (!lead) return

    try {
      console.log('Attempting to delete lead:', lead.id, 'User ID:', user?.id)
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id)

      if (error) {
        console.error('Delete error details:', error)
        throw error
      }

      // Create audit log entry for the deletion
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action: 'lead_deleted',
          table_name: 'leads',
          record_id: lead.id,
          old_values: {
            name: lead.name,
            business_name: lead.business_name
          }
        })
      
      console.log('Lead deleted successfully')
      toast({
        title: "Success!",
        description: `${lead.name || 'Lead'} has been deleted successfully.`,
      })

      navigate('/leads')
    } catch (error: any) {
      console.error('Error deleting lead:', error)
      
      // More detailed error handling
      let errorMessage = "Failed to delete lead"
      if (error.message?.includes('row-level security')) {
        errorMessage = "You don't have permission to delete this lead. Only admins or the lead owner can delete leads."
      } else if (error.message) {
        errorMessage = `Failed to delete lead: ${error.message}`
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'secondary'
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStageColor = (stage?: string) => {
    if (!stage) return 'secondary'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading lead details...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Lead not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
        {/* Modern Header */}
        <div className="bg-white border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/leads')}
                  className="h-8 w-8 p-0 hover:bg-muted rounded-md"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-foreground">
                      {lead.name || lead.business_name || 'Lead Details'}
                    </h1>
                    <div className="flex items-center gap-2">
                      {lead.is_converted_to_client && (
                        <span className="text-xs font-medium px-2 py-1 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1 inline" />
                          Converted
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lead ID: {lead.lead_number ? String(lead.lead_number).padStart(3, '0') : 'N/A'} • Created {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <PhoneDialer 
                  phoneNumber={lead.phone}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium"
                    >
                      <PhoneIcon className="h-3 w-3 mr-2" />
                      Call
                    </Button>
                  }
                />
                <EmailComposer 
                  recipientEmail={lead.email}
                  recipientName={lead.name}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium"
                    >
                      <Mail className="h-3 w-3 mr-2" />
                      Email
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReminderDialog(true)}
                  className="h-8 text-xs font-medium"
                >
                  <Bell className="h-3 w-3 mr-2" />
                  Set Reminder
                </Button>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={isEditing ? saveLeadChanges : () => setIsEditing(true)}
                  className={isEditing ? 
                    "h-8 text-xs font-medium bg-primary hover:bg-primary/90" : 
                    "h-8 text-xs font-medium"
                  }
                >
                  <Edit className="h-3 w-3 mr-2" />
                  {isEditing ? 'Save Changes' : 'Edit'}
                </Button>
                
                {(canDeleteLeads || (lead.user_id === user?.id)) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive"
                        size="sm"
                        className="h-8 text-xs font-medium"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete <strong>{lead?.name || 'this lead'}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteLead}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Lead
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="h-8 text-xs font-medium"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Status Card */}
            <Card className="border border-border shadow-sm bg-white lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Lead Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Stage</Label>
                    {isEditing ? (
                      <Select
                        value={editableFields.stage}
                        onValueChange={(value) => setEditableFields({...editableFields, stage: value})}
                      >
                        <SelectTrigger className="mt-1 h-9 text-sm">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New Lead">New Lead</SelectItem>
                          <SelectItem value="Initial Contact">Initial Contact</SelectItem>
                          <SelectItem value="Qualified">Qualified</SelectItem>
                          <SelectItem value="Application">Application</SelectItem>
                          <SelectItem value="Loan Approved">Loan Approved</SelectItem>
                          <SelectItem value="Documentation">Documentation</SelectItem>
                          <SelectItem value="Closing">Closing</SelectItem>
                          <SelectItem value="Funded">Funded</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.stage || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
                    {isEditing ? (
                      <Select
                        value={editableFields.priority}
                        onValueChange={(value) => setEditableFields({...editableFields, priority: value})}
                      >
                        <SelectTrigger className="mt-1 h-9 text-sm">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.priority || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="border border-border shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">First Name</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.first_name}
                        onChange={(e) => setEditableFields({...editableFields, first_name: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.first_name || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.last_name}
                        onChange={(e) => setEditableFields({...editableFields, last_name: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.last_name || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Home Address</Label>
                  {isEditing ? (
                    <Input
                      value={editableFields.home_address}
                      onChange={(e) => setEditableFields({...editableFields, home_address: e.target.value})}
                      className="mt-1 h-8 text-sm"
                    />
                  ) : (
                    <div className="field-display mt-1">
                      {editableFields.home_address || 'N/A'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">City</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.home_city}
                        onChange={(e) => setEditableFields({...editableFields, home_city: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.home_city || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">State</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.home_state}
                        onChange={(e) => setEditableFields({...editableFields, home_state: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.home_state || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">ZIP Code</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.home_zip_code}
                        onChange={(e) => setEditableFields({...editableFields, home_zip_code: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.home_zip_code || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editableFields.email}
                      onChange={(e) => setEditableFields({...editableFields, email: e.target.value})}
                      className="mt-1 h-8 text-sm"
                    />
                  ) : (
                    <div className="field-display mt-1">
                      {editableFields.email || 'N/A'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label className="text-xs font-medium text-muted-foreground">Company Phone</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.phone ? formatPhoneNumber(editableFields.phone) : ''}
                        onChange={(e) => setEditableFields({...editableFields, phone: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.phone ? formatPhoneNumber(editableFields.phone) : 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Ext</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.phone_ext || ''}
                        onChange={(e) => setEditableFields({...editableFields, phone_ext: e.target.value})}
                        className="mt-1 h-8 text-sm"
                        placeholder="123"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.phone_ext || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Mobile Phone</Label>
                  {isEditing ? (
                    <Input
                      value={editableFields.mobile_phone ? formatPhoneNumber(editableFields.mobile_phone) : ''}
                      onChange={(e) => setEditableFields({...editableFields, mobile_phone: e.target.value})}
                      className="mt-1 h-8 text-sm"
                    />
                  ) : (
                    <div className="field-display mt-1">
                      {editableFields.mobile_phone ? formatPhoneNumber(editableFields.mobile_phone) : 'N/A'}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Ownership Percentage</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={editableFields.ownership_percentage}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (value >= 0 && value <= 100) {
                          setEditableFields({...editableFields, ownership_percentage: e.target.value});
                        }
                      }}
                      className="mt-1 h-8 text-sm"
                      placeholder="0-100"
                    />
                  ) : (
                    <div className="field-display mt-1">
                      {editableFields.ownership_percentage ? `${editableFields.ownership_percentage}%` : 'N/A'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Information Card */}
            <Card className="border border-border shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Business Name</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.business_name}
                        onChange={(e) => setEditableFields({...editableFields, business_name: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.business_name || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Year Established</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.year_established}
                        onChange={(e) => setEditableFields({...editableFields, year_established: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.year_established || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Business Address</Label>
                  {isEditing ? (
                    <Input
                      value={editableFields.business_address}
                      onChange={(e) => setEditableFields({...editableFields, business_address: e.target.value})}
                      className="mt-1 h-8 text-sm"
                    />
                  ) : (
                    <div className="field-display mt-1">
                      {editableFields.business_address || 'N/A'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">City</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.business_city}
                        onChange={(e) => setEditableFields({...editableFields, business_city: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.business_city || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">State</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.business_state}
                        onChange={(e) => setEditableFields({...editableFields, business_state: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.business_state || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">ZIP Code</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.business_zip_code}
                        onChange={(e) => setEditableFields({...editableFields, business_zip_code: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.business_zip_code || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Annual Revenue</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.annual_revenue}
                        onChange={(e) => setEditableFields({...editableFields, annual_revenue: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.annual_revenue ? formatCurrency(parseFloat(editableFields.annual_revenue)) : 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">NAICS Code</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.naics_code}
                        onChange={(e) => setEditableFields({...editableFields, naics_code: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.naics_code || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Ownership Structure</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.ownership_structure}
                        onChange={(e) => setEditableFields({...editableFields, ownership_structure: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.ownership_structure || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Processor Name</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.processor_name}
                        onChange={(e) => setEditableFields({...editableFields, processor_name: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.processor_name || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">POS System</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.pos_system}
                        onChange={(e) => setEditableFields({...editableFields, pos_system: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.pos_system || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Monthly Processing Volume</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editableFields.monthly_processing_volume}
                        onChange={(e) => setEditableFields({...editableFields, monthly_processing_volume: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.monthly_processing_volume ? formatCurrency(parseFloat(editableFields.monthly_processing_volume)) : 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Average Transaction Size</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editableFields.average_transaction_size}
                        onChange={(e) => setEditableFields({...editableFields, average_transaction_size: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.average_transaction_size ? formatCurrency(parseFloat(editableFields.average_transaction_size)) : 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Current Processing Rate</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editableFields.current_processing_rate}
                        onChange={(e) => setEditableFields({...editableFields, current_processing_rate: e.target.value})}
                        className="mt-1 h-8 text-sm"
                        placeholder="2.5"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.current_processing_rate ? `${editableFields.current_processing_rate}%` : 'N/A'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* BDO Information Card */}
            <Card className="border-0 shadow-sm bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  BDO Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">BDO Name</Label>
                  {isEditing ? (
                    <Input
                      value={editableFields.bdo_name}
                      onChange={(e) => setEditableFields({...editableFields, bdo_name: e.target.value})}
                      className="mt-1 h-8 text-sm"
                    />
                  ) : (
                    <div className="field-display mt-1">
                      {editableFields.bdo_name || 'N/A'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">BDO Phone</Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={editableFields.bdo_telephone ? formatPhoneNumber(editableFields.bdo_telephone) : ''}
                        onChange={(e) => setEditableFields({...editableFields, bdo_telephone: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.bdo_telephone ? formatPhoneNumber(editableFields.bdo_telephone) : 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">BDO Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editableFields.bdo_email}
                        onChange={(e) => setEditableFields({...editableFields, bdo_email: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="mt-1">
                        {editableFields.bdo_email ? (
                          <a
                            href={`mailto:${editableFields.bdo_email}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {editableFields.bdo_email}
                          </a>
                        ) : (
                          <p className="text-sm font-medium">N/A</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Business Details Card */}
            <Card className="border-0 shadow-sm bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Additional Business Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Year Established</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableFields.year_established}
                        onChange={(e) => setEditableFields({...editableFields, year_established: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.year_established || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Ownership Structure</Label>
                    {isEditing ? (
                      <Select
                        value={editableFields.ownership_structure}
                        onValueChange={(value) => setEditableFields({...editableFields, ownership_structure: value})}
                      >
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue placeholder="Select structure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Corporation">Corporation</SelectItem>
                          <SelectItem value="LLC">LLC</SelectItem>
                          <SelectItem value="Partnership">Partnership</SelectItem>
                          <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="S-Corp">S-Corp</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.ownership_structure || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Owns Property</Label>
                  {isEditing ? (
                    <Select
                      value={editableFields.owns_property.toString()}
                      onValueChange={(value) => setEditableFields({...editableFields, owns_property: value === 'true'})}
                    >
                      <SelectTrigger className="mt-1 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="field-display mt-1">
                      {editableFields.owns_property ? 'Yes' : 'No'}
                    </div>
                  )}
                </div>

                {editableFields.owns_property && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Property Payment Amount</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editableFields.property_payment_amount}
                        onChange={(e) => setEditableFields({...editableFields, property_payment_amount: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.property_payment_amount ? formatCurrency(parseFloat(editableFields.property_payment_amount)) : 'N/A'}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Information Card */}
            <Card className="border-0 shadow-sm bg-card lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Loan & Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Loan Type</Label>
                    {isEditing ? (
                      <Select
                        value={editableFields.loan_type}
                        onValueChange={(value) => setEditableFields({...editableFields, loan_type: value})}
                      >
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOAN_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.loan_type || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Loan Amount</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editableFields.loan_amount}
                        onChange={(e) => setEditableFields({...editableFields, loan_amount: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.loan_amount ? formatCurrency(parseFloat(editableFields.loan_amount)) : 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Interest Rate</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editableFields.interest_rate}
                        onChange={(e) => setEditableFields({...editableFields, interest_rate: e.target.value})}
                        className="mt-1 h-8 text-sm"
                        placeholder="5.25"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.interest_rate ? `${editableFields.interest_rate}%` : 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Credit Score</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editableFields.credit_score}
                        onChange={(e) => setEditableFields({...editableFields, credit_score: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.credit_score || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Net Operating Income</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editableFields.net_operating_income}
                        onChange={(e) => setEditableFields({...editableFields, net_operating_income: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.net_operating_income ? formatCurrency(parseFloat(editableFields.net_operating_income)) : 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Existing Loan Amount</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editableFields.existing_loan_amount}
                        onChange={(e) => setEditableFields({...editableFields, existing_loan_amount: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.existing_loan_amount ? formatCurrency(parseFloat(editableFields.existing_loan_amount)) : 'N/A'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Bank/Lender Name</Label>
                    {isEditing ? (
                      <Input
                        value={editableFields.bank_lender_name}
                        onChange={(e) => setEditableFields({...editableFields, bank_lender_name: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.bank_lender_name || 'N/A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Maturity Date</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editableFields.maturity_date}
                        onChange={(e) => setEditableFields({...editableFields, maturity_date: e.target.value})}
                        className="mt-1 h-8 text-sm"
                      />
                    ) : (
                      <div className="field-display mt-1">
                        {editableFields.maturity_date ? format(new Date(editableFields.maturity_date), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes and Communication Card */}
            <Card className="border-0 shadow-sm bg-card lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Notes & Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Call Notes</Label>
                    {isEditing ? (
                      <Textarea
                        value={callNotes}
                        onChange={(e) => setCallNotes(e.target.value)}
                        placeholder="Add call notes..."
                        className="mt-1 min-h-[100px] text-sm"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-muted/30 rounded-md border min-h-[100px]">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {callNotes || 'No call notes yet...'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">General Notes</Label>
                    {isEditing ? (
                      <Textarea
                        value={generalNotes}
                        onChange={(e) => setGeneralNotes(e.target.value)}
                        placeholder="Add general notes..."
                        className="mt-1 min-h-[100px] text-sm"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-muted/30 rounded-md border min-h-[100px]">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {generalNotes || 'No general notes yet...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Action Reminder Dialog */}
        {lead && (
          <ActionReminder
            entityId={lead.id}
            entityName={lead.name || lead.business_name || 'Lead'}
            entityType="lead"
            isOpen={showReminderDialog}
            onClose={() => setShowReminderDialog(false)}
          />
        )}
      </div>
    )
  }