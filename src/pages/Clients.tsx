import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import Layout from "@/components/Layout"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Phone, Mail, MapPin, Calendar, DollarSign, Filter, ChevronDown, ChevronUp, Trash2, Bell, MessageSquare, ShoppingCart, FileText, Eye } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ActionReminder } from "@/components/ActionReminder"
import { LoanManager } from "@/components/LoanManager"
import LoanRequestManager from "@/components/LoanRequestManager"
import { PhoneDialer } from "@/components/PhoneDialer"
import { EmailComposer } from "@/components/EmailComposer"
import { formatNumber, formatCurrency } from "@/lib/utils"
import { useNotifications } from "@/hooks/useNotifications"
import { format } from "date-fns"

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  status: string
  stage?: string // Add stage field for synchronization
  naics_code?: string // Add NAICS code field
  ownership_structure?: string // Add ownership structure field
  total_loans: number
  total_loan_value: number
  join_date: string
  last_activity: string
  business_name?: string
  business_address?: string
  owns_property?: boolean
  property_payment_amount?: number
  year_established?: number
  credit_score?: number
  net_operating_income?: number
  bank_lender_name?: string
  annual_revenue?: number
  existing_loan_amount?: number
  notes?: string
  call_notes?: string
  priority?: string
  income?: number
  pos_system?: string
  monthly_processing_volume?: number
  average_transaction_size?: number
  processor_name?: string
  current_processing_rate?: number
  bdo_name?: string
  bdo_telephone?: string
  bdo_email?: string
}

interface Loan {
  id: string
  loan_amount: number
  interest_rate?: number
  loan_term_months?: number
  maturity_date?: string
  loan_type: string
  status: string
  origination_date: string
  monthly_payment?: number
  remaining_balance?: number
  notes?: string
}

export default function Clients() {
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const { toast } = useToast()
  const { createNotification } = useNotifications()
  const [clients, setClients] = useState<Client[]>([])
  const [clientLoans, setClientLoans] = useState<{ [key: string]: Loan[] }>({})
  const [loans, setLoans] = useState<Loan[]>([])
  const [loanRequests, setLoanRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [showNotificationForm, setShowNotificationForm] = useState<string | null>(null)
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>()
  const [selectedClientForReminder, setSelectedClientForReminder] = useState<Client | null>(null)

  useEffect(() => {
    if (user) {
      fetchClients()
    }
  }, [user])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          contact_entity:contact_entities!contact_entity_id (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform clients data to merge contact entity fields
      const transformedClients = data?.map(client => ({
        ...client,
        ...client.contact_entity
      })) || []
      
      setClients(transformedClients)
      
      // Fetch loans for all clients
      if (data && data.length > 0) {
        await fetchAllClientLoans(data.map(c => c.id))
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllClientLoans = async (clientIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .in('client_id', clientIds)

      if (error) throw error

      // Group loans by client_id
      const loansByClient: { [key: string]: Loan[] } = {}
      data?.forEach(loan => {
        if (!loansByClient[loan.client_id]) {
          loansByClient[loan.client_id] = []
        }
        loansByClient[loan.client_id].push(loan)
      })

      setClientLoans(loansByClient)
    } catch (error) {
      console.error('Error fetching client loans:', error)
    }
  }

  const handleLoansUpdate = () => {
    fetchClients() // This will refetch both clients and loans
  }

  const deleteClient = async (clientId: string, clientName: string) => {
    try {
      // First delete associated loans
      const { error: loansError } = await supabase
        .from('loans')
        .delete()
        .eq('client_id', clientId)

      if (loansError) throw loansError

      // Delete pipeline entries
      const { error: pipelineError } = await supabase
        .from('pipeline_entries')
        .delete()
        .eq('client_id', clientId)

      if (pipelineError) throw pipelineError

      // Finally delete the client
      const { error: clientError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (clientError) throw clientError

      toast({
        title: "Success!",
        description: `${clientName} and all associated data have been deleted successfully.`,
      })

      fetchClients() // Refresh the clients list
    } catch (error) {
      console.error('Error deleting client:', error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      })
    }
  }

  const createCallReminder = async (clientId: string, clientName: string) => {
    if (!followUpDate) {
      toast({
        title: "Error",
        description: "Please select a follow-up date",
        variant: "destructive",
      })
      return
    }

    try {
      await createNotification({
        title: "Call Reminder",
        message: `Schedule a call with ${clientName} on ${format(followUpDate, 'PPP')}`,
        type: 'call_reminder',
        clientId: clientId,
      })

      setFollowUpDate(undefined)
      setShowNotificationForm(null)
      toast({
        title: "Success",
        description: "Call reminder created successfully",
      })
    } catch (error) {
      console.error('Error creating call reminder:', error)
      toast({
        title: "Error",
        description: "Failed to create call reminder",
        variant: "destructive",
      })
    }
  }

  const createEmailReminder = async (clientId: string, clientName: string) => {
    if (!followUpDate) {
      toast({
        title: "Error",
        description: "Please select a follow-up date",
        variant: "destructive",
      })
      return
    }

    try {
      await createNotification({
        title: "Email Reminder",
        message: `Send follow-up email to ${clientName} on ${format(followUpDate, 'PPP')}`,
        type: 'email_reminder',
        clientId: clientId,
      })

      setFollowUpDate(undefined)
      setShowNotificationForm(null)
      toast({
        title: "Success",
        description: "Email reminder created successfully",
      })
    } catch (error) {
      console.error('Error creating email reminder:', error)
      toast({
        title: "Error",
        description: "Failed to create email reminder",
        variant: "destructive",
      })
    }
  }

  const createFollowUpReminder = async (clientId: string, clientName: string) => {
    if (!followUpDate) {
      toast({
        title: "Error",
        description: "Please select a follow-up date",
        variant: "destructive",
      })
      return
    }

    try {
      await createNotification({
        title: "Follow-up Reminder",
        message: `Follow up with ${clientName} on ${format(followUpDate, 'PPP')}`,
        type: 'follow_up_reminder',
        clientId: clientId,
      })

      setFollowUpDate(undefined)
      setShowNotificationForm(null)
      toast({
        title: "Success",
        description: "Follow-up reminder created successfully",
      })
    } catch (error) {
      console.error('Error creating follow-up reminder:', error)
      toast({
        title: "Error",
        description: "Failed to create follow-up reminder",
        variant: "destructive",
      })
    }
  }

  const saveNotification = async (clientId: string, clientName: string) => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and message for the notification",
        variant: "destructive",
      })
      return
    }

    try {
      await createNotification({
        title: notificationTitle,
        message: notificationMessage,
        type: 'client_note',
        clientId: clientId,
      })

      setNotificationTitle("")
      setNotificationMessage("")
      setShowNotificationForm(null)
      toast({
        title: "Success",
        description: "Notification created successfully",
      })
    } catch (error) {
      console.error('Error creating notification:', error)
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      })
    }
  }

  const filteredClients = clients.filter(client =>
    (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default'
      case 'pending': return 'secondary'
      case 'inactive': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStageColor = (stage?: string) => {
    if (!stage) return 'secondary'
    switch (stage) {
      case 'Initial Contact': return 'secondary'
      case 'Qualified': return 'default'
      case 'Application': return 'default'
      case 'Pre-approval': return 'default'
      case 'Documentation': return 'default'
      case 'Closing': return 'default'
      case 'Funded': return 'default'
      default: return 'secondary'
    }
  }

  const totalLoanValue = clients.reduce((sum, client) => sum + (client.total_loan_value || 0), 0)
  const activeClients = clients.filter(c => c.status === 'Active').length
  const avgLoanSize = clients.length > 0 ? totalLoanValue / clients.length : 0

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">Clients</h1>
            <p className="text-muted-foreground dark:text-white">Manage your client relationships</p>
          </div>
          <Button className="bg-gradient-primary">
            Add Client
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-white" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/clients/all')}
                  className="gap-2 border-primary/20 hover:border-primary/50"
                >
                  <Eye className="w-4 h-4" />
                  View All Details
                </Button>
                <div className="text-sm text-muted-foreground dark:text-white self-center">
                  Showing {filteredClients.length} of {clients.length} clients
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{formatNumber(clients.length)}</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{formatNumber(activeClients)}</div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Total Loan Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {totalLoanValue >= 1000000 
                  ? `${formatCurrency((totalLoanValue / 1000000).toFixed(1))}M` 
                  : formatCurrency(totalLoanValue)
                }
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Avg. Loan Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">
                {avgLoanSize >= 1000 
                  ? `${formatCurrency((avgLoanSize / 1000).toFixed(0))}K` 
                  : formatCurrency(avgLoanSize)
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <div className="grid gap-6">
          {filteredClients.map((client) => {
            const loans = clientLoans[client.id] || []
            const isExpanded = expandedClient === client.id
            
            return (
              <Card key={client.id} className="shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/6/initials/svg?seed=${client.name}`} />
                        <AvatarFallback>{(client.name || 'Unknown').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <div>
                          <button 
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="hover:underline cursor-pointer"
                          >
                            <h3 className="font-semibold text-foreground dark:text-white hover:text-primary transition-colors">{client.name}</h3>
                          </button>
                          <p className="text-sm text-muted-foreground dark:text-white">
                            Client since {new Date(client.join_date).toLocaleDateString()}
                          </p>
                        </div>
                        
                         <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-white">
                          <EmailComposer 
                            trigger={
                              <button className="flex items-center gap-1 text-sm text-muted-foreground dark:text-white hover:text-primary transition-colors">
                                <Mail className="h-4 w-4" />
                                {client.email}
                              </button>
                            }
                          />
                          {client.phone && (
                            <PhoneDialer 
                              trigger={
                                <button className="flex items-center gap-1 text-sm text-muted-foreground dark:text-white hover:text-primary transition-colors">
                                  <Phone className="h-4 w-4" />
                                  {client.phone}
                                </button>
                              }
                            />
                          )}
                          {client.location && (
                            <div className="flex items-center gap-1 dark:text-white">
                              <MapPin className="h-4 w-4" />
                              {client.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex gap-2">
                        <Badge variant={getStatusColor(client.status)}>
                          {client.status}
                        </Badge>
                        {client.stage && (
                          <Badge variant={getStageColor(client.stage)}>
                            {client.stage}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-white">
                        Last activity: {new Date(client.last_activity).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground dark:text-white">Total Loans</div>
                        <div className="font-semibold dark:text-white">{formatNumber(client.total_loans)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground dark:text-white">Total Value</div>
                        <div className="font-semibold text-accent">
                          {formatCurrency(client.total_loan_value)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Loans
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            View Loans
                          </>
                        )}
                      </Button>
                       {/* Quick Action Buttons */}
                      <PhoneDialer 
                        trigger={
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 border-blue-500/20"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        }
                      />
                      <EmailComposer 
                        trigger={
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs bg-gradient-to-r from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 border-green-500/20"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs bg-gradient-to-r from-orange-500/10 to-orange-500/5 hover:from-orange-500/20 hover:to-orange-500/10 border-orange-500/20"
                        onClick={() => navigate('/documents')}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Documents
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedClientForReminder(client)}
                        className="h-8 px-3 text-xs bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20"
                      >
                        <Bell className="w-3 h-3 mr-1" />
                        Reminder
                      </Button>
                      {hasRole('admin') && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="dark:text-white">Delete Client</AlertDialogTitle>
                              <AlertDialogDescription className="dark:text-white">
                                Are you sure you want to delete <strong>{client.name}</strong>? This will also delete all associated loans and pipeline entries. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteClient(client.id, client.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  {/* Expanded Loan Section */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t">
                      <LoanRequestManager
                        clientId={client.id}
                        loanRequests={loanRequests.filter(req => req.client_id === client.id)}
                        onLoanRequestsUpdate={setLoanRequests}
                      />
                      
                      <div className="mt-6">
                        <LoanManager
                          clientId={client.id}
                          clientName={client.name}
                          loans={loans}
                          onLoansUpdate={handleLoansUpdate}
                        />
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            )
          })}
          
          {filteredClients.length === 0 && (
            <Card className="shadow-soft">
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground dark:text-white">
                  {searchTerm ? 'No clients found matching your search.' : 'No clients yet. Convert some leads to get started!'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Reminder Dialog */}
      {selectedClientForReminder && (
        <ActionReminder
          entityId={selectedClientForReminder.id}
          entityName={selectedClientForReminder.name}
          entityType="client"
          isOpen={!!selectedClientForReminder}
          onClose={() => setSelectedClientForReminder(null)}
        />
      )}
    </Layout>
  )
}