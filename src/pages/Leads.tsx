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
  Trash2,
  Grid,
  List
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeadsList } from '@/components/leads/LeadsList';
import { LeadFilters } from '@/components/LeadFilters';
import { SecureLeadForm } from '@/components/leads/SecureLeadForm';
import { LeadStats } from '@/components/leads/LeadStats';
import { SecurityWrapper } from '@/components/SecurityWrapper';
import { SecureFormProvider } from '@/components/security/SecureFormValidator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lead, ContactEntity } from '@/types/lead';
import { useRealtimeLeads } from '@/hooks/useRealtimeLeads';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

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
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Debug: Log user and roles on mount
  useEffect(() => {
    console.info('[Leads] User:', user?.id, 'Roles:', userRoles);
  }, [user, userRoles]);
  
  // Use real-time leads hook
  const { leads: realtimeLeads, loading: realtimeLoading, error: realtimeError, refetch: realtimeRefetch, refetchSilent: realtimeRefetchSilent, ensureAccessAndRefetch } = useRealtimeLeads();
  
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { hasRole } = useRoleBasedAccess();
  const hasAdminRole = hasRole('admin') || hasRole('super_admin');

  // Refresh leads when component mounts or user navigates back
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing leads...');
      realtimeRefetchSilent();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, refreshing leads...');
        realtimeRefetchSilent();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [realtimeRefetchSilent]);

  // Refresh leads when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log('User changed, refreshing leads...');
      realtimeRefetchSilent();
    }
  }, [user, realtimeRefetchSilent]);

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
      realtimeRefetchSilent();
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
    
    // Debug priority values
    console.log('All lead priorities:', leads.map(l => ({ name: l.name, priority: l.priority, ce_priority: l.contact_entity?.priority })));
    
    const hotLeads = leads.filter(lead => {
      // Check both the lead priority and contact_entity priority
      const priority = lead.priority || lead.contact_entity?.priority;
      console.log(`Lead ${lead.name}: priority=${lead.priority}, ce_priority=${lead.contact_entity?.priority}, final=${priority}`);
      const p = (priority || '').toString().toLowerCase();
      return p === 'high';
    }).length;
    
    console.log('High priority leads count:', hotLeads);
    
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

      realtimeRefetchSilent();
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

  // Show loading state while auth is being determined
  if (realtimeLoading && realtimeLeads.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <SecureFormProvider>
      <div className="min-h-screen bg-background">
          <div className="p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Lead Management
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage and track your sales leads and prospects
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-7 w-7 p-0"
                  >
                    <Grid className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-7 w-7 p-0"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button onClick={() => setShowNewLeadForm(true)} size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white">
                  <UserPlus className="h-3 w-3 mr-2" />
                  Add Lead
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card 
                  className="bg-card border border-blue-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
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
                  className="bg-card border border-blue-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
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
                  className="bg-card border border-blue-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  onClick={() => {
                    setSelectedPriority('High');
                    setShowFilters(true);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">High Priority Leads</p>
                      <p className="text-2xl font-bold text-primary">{overview.hotLeads}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-card border border-blue-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
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

              {!realtimeLoading && !realtimeError && realtimeLeads.length === 0 && (
                <Alert className="border-l-4 border-l-primary bg-primary/10">
                  <AlertDescription>
                    No leads are visible with your current access. Try Ensure Access & Reload.
                    <div className="mt-2">
                      <Button variant="secondary" size="sm" onClick={ensureAccessAndRefetch}>
                        Ensure Access & Reload
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#0A1628] p-1 gap-2">
            <TabsTrigger value="active" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md">Active Leads</TabsTrigger>
            <TabsTrigger value="qualified" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md">Pre-Qualified</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md">Performance</TabsTrigger>
            <TabsTrigger value="management" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md">Lead Tools</TabsTrigger>
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

            <div className="rounded-lg p-4 bg-card mb-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search leads by name, email, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="h-3 w-3 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Filter'}
                </Button>
              </div>
            </div>
            
            {realtimeLoading && (<LoadingSkeleton type="table" count={6} />)}
            {!realtimeLoading && realtimeError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {realtimeError}
                  <div className="mt-3">
                    <Button size="sm" variant="outline" onClick={realtimeRefetch}>Retry</Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {viewMode === 'list' ? (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No leads found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm 
                        ? "Try adjusting your search or filters" 
                        : "Start by creating your first lead"}
                    </p>
                    <Button onClick={() => setShowNewLeadForm(true)} className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Create Lead
                    </Button>
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <Card 
                      key={lead.id}
                      className="hover:shadow-lg transition-all cursor-pointer group relative"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold truncate">
                              {lead.name}
                            </CardTitle>
                            {lead.business_name && (
                              <CardDescription className="text-xs mt-1 truncate">
                                {lead.business_name}
                              </CardDescription>
                            )}
                          </div>
                          <Badge 
                            variant={
                              lead.priority === 'High' ? 'destructive' : 
                              lead.priority === 'Medium' ? 'default' : 
                              'secondary'
                            }
                            className="text-xs shrink-0"
                          >
                            {lead.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          {lead.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{lead.phone}</span>
                            </div>
                          )}
                          {lead.loan_amount && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <DollarSign className="h-3.5 w-3.5 shrink-0" />
                              <span className="font-medium text-foreground">
                                {formatCurrency(lead.loan_amount)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Stage</span>
                            <Badge variant="outline" className="text-xs">
                              {lead.stage || 'New Lead'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(lead);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/leads/${lead.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="qualified" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Pre-Qualified Prospects
                </CardTitle>
                <CardDescription>
                  Leads that have been pre-approved or have signed term sheets
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
            <LeadStats leads={realtimeLeads} />
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
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Launch Dialer</Button>
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
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" variant="default">Create Campaign</Button>
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
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" variant="default">Configure Rules</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>

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
  );
}