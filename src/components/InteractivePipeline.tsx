import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, User, Calendar, ArrowRight, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom"
import { Lead } from "@/types/lead"
import { formatPhoneNumber } from "@/lib/utils"

// Use Lead type from centralized types but alias as LeadData for backwards compatibility
type LeadData = Lead

// Lead Card Component
const LeadCard = ({ lead, onStageChange, onViewDetails }: { 
  lead: LeadData; 
  onStageChange: (leadId: string, newStage: string) => void;
  onViewDetails: (lead: LeadData) => void;
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/leads/${lead.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking action buttons
  };
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground dark:text-white" />
              <span className="font-medium text-sm dark:text-white">{lead.name}</span>
            </div>
            
            {lead.business_name && (
              <div className="text-xs text-muted-foreground dark:text-white">
                {lead.business_name}
              </div>
            )}
            
            {lead.loan_amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground dark:text-white" />
                <span className="text-sm text-muted-foreground dark:text-white">
                  ${lead.loan_amount.toLocaleString()}
                </span>
              </div>
            )}
            
            {lead.last_contact && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground dark:text-white" />
                <span className="text-xs text-muted-foreground dark:text-white">
                  Last contact: {new Date(lead.last_contact).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <span className="text-xs">
              {lead.priority}
            </span>
            
            <div className="flex gap-1" onClick={handleActionClick}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewDetails(lead)}
                className="h-6 w-6 p-0"
              >
                <Eye className="h-3 w-3" />
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Move Lead: {lead.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Move to Stage:</label>
                      <Select onValueChange={(value) => onStageChange(lead.id, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {stageOrder.map(stage => (
                            <SelectItem key={stage} value={stage} disabled={stage === lead.stage}>
                              {stage} {stage === lead.stage && "(current)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const stageOrder = ["New Lead", "Initial Contact", "Qualified", "Application", "Loan Approved", "Closing", "Funded"];

export function InteractivePipeline() {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          contact_entity:contact_entities!contact_entity_id (*)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Transform leads data to merge contact entity fields
      const transformedLeads = data?.map(lead => ({
        ...lead,
        ...lead.contact_entity
      })) || []

      setLeads(transformedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to load pipeline data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStage = async (leadId: string, newStage: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Lead moved to ${newStage}`,
      });

      // Refresh the data
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead stage:', error);
      toast({
        title: "Error",
        description: "Failed to update lead stage",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    fetchLeads();
  };

  const handleViewDetails = (lead: LeadData) => {
    setSelectedLead(lead);
  };

  // Group leads by stage
  const stageGroups = stageOrder.reduce((acc, stage) => {
    acc[stage] = leads.filter(lead => lead.stage === stage);
    return acc;
  }, {} as Record<string, LeadData[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="dark:text-white">Interactive Sales Pipeline</CardTitle>
              <p className="text-sm text-muted-foreground dark:text-white">
                Click on leads to view details or move them between stages
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Pipeline Stages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stageOrder.map((stage, index) => (
          <div key={stage} className="space-y-4">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">{stage}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stageGroups[stage]?.length || 0}</span>
                    {index < stageOrder.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground dark:text-white">
                  Total Value: ${stageGroups[stage]?.reduce((sum, lead) => sum + (lead.loan_amount || 0), 0).toLocaleString() || '0'}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {stageGroups[stage]?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground dark:text-white">
                      No leads in this stage
                    </div>
                  ) : (
                    stageGroups[stage]?.map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onStageChange={updateLeadStage}
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Lead Details Dialog */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Lead Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium dark:text-white">Name:</label>
                <p className="text-sm text-muted-foreground dark:text-white">{selectedLead.name}</p>
              </div>
              
              {selectedLead.business_name && (
                <div>
                  <label className="text-sm font-medium dark:text-white">Business:</label>
                  <p className="text-sm text-muted-foreground dark:text-white">{selectedLead.business_name}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium dark:text-white">Email:</label>
                <p className="text-sm text-muted-foreground dark:text-white">{selectedLead.email}</p>
              </div>
              
              {selectedLead.phone && (
                <div>
                  <label className="text-sm font-medium dark:text-white">Phone:</label>
                  <p className="text-sm text-muted-foreground dark:text-white">{formatPhoneNumber(selectedLead.phone)}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium dark:text-white">Current Stage:</label>
                <span className="ml-2 text-sm">{selectedLead.stage}</span>
              </div>
              
              <div>
                <label className="text-sm font-medium dark:text-white">Priority:</label>
                <span className="ml-2 text-sm">
                  {selectedLead.priority}
                </span>
              </div>
              
              {selectedLead.loan_amount && (
                <div>
                  <label className="text-sm font-medium dark:text-white">Loan Amount:</label>
                  <p className="text-sm text-muted-foreground dark:text-white">${selectedLead.loan_amount.toLocaleString()}</p>
                </div>
              )}
              
              {selectedLead.loan_type && (
                <div>
                  <label className="text-sm font-medium dark:text-white">Loan Type:</label>
                  <p className="text-sm text-muted-foreground dark:text-white">{selectedLead.loan_type}</p>
                </div>
              )}
              
              {selectedLead.last_contact && (
                <div>
                  <label className="text-sm font-medium dark:text-white">Last Contact:</label>
                  <p className="text-sm text-muted-foreground dark:text-white">
                    {new Date(selectedLead.last_contact).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground dark:text-white">
        <div>
          Total Leads: {leads.length}
        </div>
        <div>
          Pipeline Value: ${leads.reduce((sum, lead) => sum + (lead.loan_amount || 0), 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}