import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail,
  DollarSign,
  Target,
  Activity,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeadsList } from '@/components/leads/LeadsList';
import { LeadFilters } from '@/components/LeadFilters';
import { SecureLeadForm } from '@/components/leads/SecureLeadForm';
import { SecurityWrapper } from '@/components/SecurityWrapper';
import { SecureFormProvider } from '@/components/security/SecureFormValidator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lead, ContactEntity } from '@/types/lead';
import { useRealtimeLeads } from '@/hooks/useRealtimeLeads';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

interface LeadsOverview {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  hotLeads: number;
  totalValue: number;
  conversionRate: number;
  responseTime: number;
  followUpsDue: number;
}

export default function Leads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use real-time leads hook
  const { leads: realtimeLeads, loading: realtimeLoading, refetch: realtimeRefetch } = useRealtimeLeads();
  
  const [overview, setOverview] = useState<LeadsOverview>({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    hotLeads: 0,
    totalValue: 0,
    conversionRate: 0,
    responseTime: 2.4,
    followUpsDue: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const { hasRole } = useRoleBasedAccess();
  const hasAdminRole = hasRole('admin') || hasRole('super_admin');

  // Refresh leads when component mounts or user navigates back
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing leads...');
      realtimeRefetch();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, refreshing leads...');
        realtimeRefetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [realtimeRefetch]);

  // Refresh leads when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log('User changed, refreshing leads...');
      realtimeRefetch();
    }
  }, [user, realtimeRefetch]);

  // Selection handlers
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, selected: boolean) => {
    if (selected) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', selectedLeads);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedLeads.length} leads deleted successfully`,
      });

      setSelectedLeads([]);
      realtimeRefetch();
    } catch (error) {
      console.error('Error deleting leads:', error);
      toast({
        title: "Error",
        description: "Failed to delete selected leads",
        variant: "destructive"
      });
    }
  };

  // Function to update overview based on leads data
  const updateOverview = (leads: Lead[]) => {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => 
      lead.stage === 'Initial Contact'
    ).length;
    const qualifiedLeads = leads.filter(lead => 
      lead.stage === 'Pre-Approved' || lead.stage === 'Term Sheet Signed'
    ).length;
    const hotLeads = leads.filter(lead => 
      lead.priority === 'High'
    ).length;
    const totalValue = leads.reduce((sum, lead) => 
      sum + (lead.loan_amount || 0), 0
    );
    const convertedLeads = leads.filter(lead => 
      lead.stage === 'Loan Funded'
    ).length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    setOverview(prev => ({
      ...prev,
      totalLeads,
      newLeads,
      qualifiedLeads,
      hotLeads,
      totalValue,
      conversionRate,
      followUpsDue: Math.floor(totalLeads * 0.15)
    }));
  };

  // Update overview when real-time leads change
  useEffect(() => {
    updateOverview(realtimeLeads);
  }, [realtimeLeads]);

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDelete = async (leadId: string, leadName: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Lead ${leadName} has been deleted`,
      });

      realtimeRefetch();
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive"
      });
    }
  };

  const handleConvert = async (lead: Lead) => {
    try {
      const { error } = await supabase
        .from('contact_entities')
        .update({ stage: 'Loan Funded' })
        .eq('id', lead.contact_entity_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Lead ${lead.name} has been converted`,
      });

      realtimeRefetch();
    } catch (error) {
      console.error('Error converting lead:', error);
      toast({
        title: "Error",
        description: "Failed to convert lead",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = async (data: ContactEntity) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create leads. Please refresh the page and try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Creating/updating lead with data:', data);
      console.log('Credit score in form data:', data.credit_score);

      if (editingLead) {
        // Update existing lead
        const updateData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          business_name: data.business_name,
          business_address: data.business_address,
          annual_revenue: data.annual_revenue,
          loan_amount: data.loan_amount,
          loan_type: data.loan_type,
          credit_score: data.credit_score,
          net_operating_income: data.net_operating_income,
          priority: data.priority,
          stage: data.stage,
          notes: data.notes,
          naics_code: data.naics_code,
          ownership_structure: data.ownership_structure,
          updated_at: new Date().toISOString()
        };

        console.log('Updating contact entity with data:', updateData);

        const { error } = await supabase
          .from('contact_entities')
          .update(updateData)
          .eq('id', editingLead.contact_entity_id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
      } else {
        // Create new lead - first create contact entity, then lead
        const contactData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          business_name: data.business_name,
          business_address: data.business_address,
          annual_revenue: data.annual_revenue,
          loan_amount: data.loan_amount,
          loan_type: data.loan_type,
          credit_score: data.credit_score,
          net_operating_income: data.net_operating_income,
          priority: data.priority,
          stage: data.stage,
          notes: data.notes,
          naics_code: data.naics_code,
          ownership_structure: data.ownership_structure,
          user_id: user.id
        };

        console.log('Creating contact entity with data:', contactData);

        const { data: contactEntity, error: contactError } = await supabase
          .from('contact_entities')
          .insert(contactData)
          .select()
          .maybeSingle();

        if (contactError) {
          console.error('Contact entity creation error:', contactError);
          throw new Error(`Failed to create contact: ${contactError.message}`);
        }

        if (!contactEntity) {
          throw new Error('Contact entity was not created successfully');
        }

        console.log('Created contact entity:', contactEntity);

        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .insert({
            user_id: user.id,
            contact_entity_id: contactEntity.id
          })
          .select()
          .single();

        if (leadError) {
          console.error('Lead creation error:', leadError);
          throw leadError;
        }

        toast({
          title: "Success",
          description: "Lead created successfully",
        });

        // Navigate to the lead detail page
        navigate(`/leads/${leadData.id}`);
      }

      setIsFormOpen(false);
      setShowNewLeadForm(false);
      setEditingLead(null);
      realtimeRefetch();
    } catch (error: any) {
      console.error('Error saving lead:', error);
      const errorMessage = error?.message || "Failed to save lead";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const filteredLeads = realtimeLeads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.business_name && lead.business_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStage = selectedStage === 'All' || lead.stage === selectedStage;
    const matchesPriority = selectedPriority === 'All' || lead.priority === selectedPriority;
    
    return matchesSearch && matchesStage && matchesPriority;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SecurityWrapper>
      <SecureFormProvider>
        <div className="min-h-screen bg-background">
            {/* Modern Header */}
            <div className="bg-card sticky top-0 z-10">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-foreground">
                          Lead Management
                        </h1>
                        <Badge variant="default" className="text-xs font-medium px-2 py-1">
                          {overview.totalLeads} Leads
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Manage and track your sales leads and prospects
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs font-medium"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-3 w-3 mr-2" />
                      {showFilters ? 'Hide Filters' : 'Filter'}
                    </Button>
                    <Button onClick={() => setShowNewLeadForm(true)} size="sm" className="h-8 text-xs font-medium">
                      <UserPlus className="h-3 w-3 mr-2" />
                      Add Lead
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card 
                  className="bg-card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate('/leads')}
                >
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                      <p className="text-2xl font-bold text-primary">{overview.totalLeads}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  onClick={() => {
                    setSelectedStage('Initial Contact');
                    setShowFilters(true);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">New Leads</p>
                      <p className="text-2xl font-bold text-primary">{overview.newLeads}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  onClick={() => {
                    setSelectedPriority('High');
                    setShowFilters(true);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Hot Prospects</p>
                      <p className="text-2xl font-bold text-primary">{overview.hotLeads}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-card shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  onClick={() => navigate('/pipeline')}
                >
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(overview.totalValue)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Alerts */}
              {overview.followUpsDue > 0 && (
                <Alert className="border-l-4 border-l-destructive bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    You have {overview.followUpsDue} leads requiring follow-up attention.
                  </AlertDescription>
                </Alert>
              )}

              {/* Filters Section */}
              {showFilters && (
                <Card>
                  <CardContent className="p-6">
                    <LeadFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      selectedStage={selectedStage}
                      setSelectedStage={setSelectedStage}
                      selectedPriority={selectedPriority}
                      setSelectedPriority={setSelectedPriority}
                      totalLeads={realtimeLeads.length}
                      filteredCount={filteredLeads.length}
                    />
                  </CardContent>
                </Card>
              )}

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active Leads</TabsTrigger>
            <TabsTrigger value="qualified">Qualified</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
            <TabsTrigger value="management">Lead Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {selectedLeads.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedLeads.length} selected</Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedLeads.length === 1 ? '1 lead' : `${selectedLeads.length} leads`} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLeads([])}
                  >
                    Clear Selection
                  </Button>
                  {hasAdminRole && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search leads by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Filter'}
              </Button>
            </div>
            
            <LeadsList 
              leads={filteredLeads}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onConvert={handleConvert}
              onRefresh={realtimeRefetch}
              hasAdminRole={hasAdminRole}
              currentUserId={user?.id}
              selectedLeads={selectedLeads}
              onSelectAll={handleSelectAll}
              onSelectLead={handleSelectLead}
            />
          </TabsContent>

          <TabsContent value="qualified" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Qualified Prospects
                </CardTitle>
                <CardDescription>
                  Leads that have been qualified and are ready for advanced nurturing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="text-sm font-medium">Ready for Proposal</span>
                    <span className="font-bold text-green-600">{overview.qualifiedLeads}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="text-sm font-medium">High Priority</span>
                    <span className="font-bold text-orange-600">{overview.hotLeads}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="font-bold text-blue-600">{overview.conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Conversion Metrics
                  </CardTitle>
                  <CardDescription>
                    Lead conversion and performance tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="font-semibold">{overview.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Response Time</span>
                      <span className="font-semibold">{overview.responseTime}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Lead Quality Score</span>
                      <span className="font-semibold text-green-600">8.2/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Activity Overview
                  </CardTitle>
                  <CardDescription>
                    Lead engagement and interaction metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Calls Made</span>
                      <span className="font-semibold">127</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Emails Sent</span>
                      <span className="font-semibold">284</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Meetings Scheduled</span>
                      <span className="font-semibold text-blue-600">18</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-500" />
                    Call Center
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Make calls and track communication</p>
                  <Button className="w-full">Launch Dialer</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    Email Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Send targeted email sequences</p>
                  <Button className="w-full" variant="outline">Create Campaign</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    Lead Scoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Automatic lead qualification</p>
                  <Button className="w-full" variant="outline">Configure Rules</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLead ? 'Edit Lead' : 'Create New Lead'}
              </DialogTitle>
            </DialogHeader>
            <SecureLeadForm
              lead={editingLead}
              onSubmit={(data) => {
                console.log('Edit lead form data received:', data);
                console.log('Credit score from edit lead form:', data.credit_score, typeof data.credit_score);
                return handleFormSubmit(data);
              }}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={false}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showNewLeadForm} onOpenChange={setShowNewLeadForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
            </DialogHeader>
            <SecureLeadForm
              onSubmit={(data) => {
                console.log('New lead form data received:', data);
                console.log('Credit score from new lead form:', data.credit_score, typeof data.credit_score);
                return handleFormSubmit(data);
              }}
              onCancel={() => setShowNewLeadForm(false)}
              isSubmitting={false}
            />
          </DialogContent>
        </Dialog>
            </div>
          </div>
      </SecureFormProvider>
    </SecurityWrapper>
  );
}