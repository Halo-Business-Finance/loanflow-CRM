import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ProcessorMetrics {
  pendingApplications: number;
  processedToday: number;
  averageProcessingTime: number;
  applicationsPastDue: number;
  totalThisWeek: number;
}

interface LeadWithContact {
  id: string;
  stage: string;
  created_at: string;
  updated_at: string;
  contact_entity_id: string;
  name?: string;
  email?: string;
  phone?: string;
  business_name?: string;
  loan_amount?: number;
  loan_type?: string;
}

export const LoanProcessorDashboard = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<ProcessorMetrics>({
    pendingApplications: 0,
    processedToday: 0,
    averageProcessingTime: 0,
    applicationsPastDue: 0,
    totalThisWeek: 0
  });
  const [pendingApps, setPendingApps] = useState<LeadWithContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcessorData();
  }, []);

  const fetchProcessorData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch pending applications - using contact_entities for stage filtering
      const { data: contactsData, error: contactsError } = await supabase
        .from('contact_entities')
        .select(`
          id,
          name,
          email,
          phone,
          business_name,
          loan_amount,
          loan_type,
          stage,
          created_at,
          updated_at
        `)
        .in('stage', ['Application', 'Pre-approval']);

      if (contactsError) {
        throw contactsError;
      }

      // Get corresponding leads for these contact entities
      const contactIds = contactsData?.map(contact => contact.id) || [];
      
      let leadsData: any[] = [];
      if (contactIds.length > 0) {
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id, contact_entity_id, is_converted_to_client')
          .in('contact_entity_id', contactIds)
          .eq('is_converted_to_client', false);
        
        if (leadsError) {
          throw leadsError;
        }
        
        leadsData = leads || [];
      }

      // Merge contact and lead data
      const transformedPending: LeadWithContact[] = (contactsData || [])
        .filter(contact => leadsData.some(lead => lead.contact_entity_id === contact.id))
        .map(contact => ({
          id: contact.id,
          stage: contact.stage || '',
          created_at: contact.created_at || '',
          updated_at: contact.updated_at || '',
          contact_entity_id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          business_name: contact.business_name,
          loan_amount: contact.loan_amount,
          loan_type: contact.loan_type
        }));

      // Fetch processed applications today - using contact_entities
      const { data: processedContactsToday } = await supabase
        .from('contact_entities')
        .select('id')
        .gte('updated_at', today)
        .in('stage', ['Pre-approval', 'Documentation']);

      // Fetch this week's processing stats
      const { data: weeklyContactsData } = await supabase
        .from('contact_entities')
        .select('id, created_at, updated_at')
        .gte('updated_at', weekAgo);

      setPendingApps(transformedPending);
      
      setMetrics({
        pendingApplications: transformedPending.length,
        processedToday: processedContactsToday?.length || 0,
        averageProcessingTime: 2.5, // Calculate based on actual data
        applicationsPastDue: transformedPending.filter(app => 
          new Date(app.created_at) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        ).length,
        totalThisWeek: weeklyContactsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching processor data:', error);
      toast({
        title: "Error",
        description: "Failed to load processor dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessApplication = async (applicationId: string) => {
    try {
      // Update stage in contact_entities table (not leads table)
      await supabase
        .from('contact_entities')
        .update({ 
          stage: 'Pre-approval',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      toast({
        title: "Application Processed",
        description: "Application moved to pre-approval stage",
      });
      
      fetchProcessorData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process application",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading processor dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-card/60 to-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Loan Processor Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage and process loan applications</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.pendingApplications)}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.processedToday)}</div>
            <p className="text-xs text-muted-foreground">Applications completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageProcessingTime} days</div>
            <p className="text-xs text-muted-foreground">Average completion time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatNumber(metrics.applicationsPastDue)}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalThisWeek)}</div>
            <p className="text-xs text-muted-foreground">Total applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Applications</TabsTrigger>
          <TabsTrigger value="pipeline">Processing Pipeline</TabsTrigger>
          <TabsTrigger value="completed">Completed Today</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Applications Requiring Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{app.name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(app.loan_amount || 0)} • {app.loan_type || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={app.stage === 'Application' ? 'secondary' : 'outline'}>
                          {app.stage}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleProcessApplication(app.id)}
                      >
                        Process
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingApps.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending applications
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Application Review</span>
                  <div className="flex items-center gap-2">
                    <Progress value={75} className="w-24" />
                    <span className="text-sm">75%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Document Verification</span>
                  <div className="flex items-center gap-2">
                    <Progress value={60} className="w-24" />
                    <span className="text-sm">60%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Credit Analysis</span>
                  <div className="flex items-center gap-2">
                    <Progress value={45} className="w-24" />
                    <span className="text-sm">45%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Applications Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {metrics.processedToday} applications processed today
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};