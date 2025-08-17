import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  GitBranch, 
  TrendingUp, 
  DollarSign, 
  Timer,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Users,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InteractivePipeline } from '@/components/InteractivePipeline';
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';
import { TeamCollaboration } from '@/components/collaboration/TeamCollaboration';
import { WorkflowAutomation } from '@/components/operations/WorkflowAutomation';

interface PipelineOverview {
  totalOpportunities: number;
  activeDeals: number;
  closedDeals: number;
  totalValue: number;
  avgDealSize: number;
  avgCycleTime: number;
  conversionRate: number;
  stagesCount: Record<string, number>;
}

export default function Pipeline() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [overview, setOverview] = useState<PipelineOverview>({
    totalOpportunities: 0,
    activeDeals: 0,
    closedDeals: 0,
    totalValue: 0,
    avgDealSize: 0,
    avgCycleTime: 0,
    conversionRate: 0,
    stagesCount: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineOverview();
  }, [user]);

  const fetchPipelineOverview = async () => {
    try {
      setLoading(true);
      
      const { data: pipelineEntries, error: pipelineError } = await supabase
        .from('pipeline_entries')
        .select(`
          *,
          leads(contact_entities(stage))
        `)
        .eq('user_id', user?.id);

      if (!pipelineError && pipelineEntries) {
        const totalOpportunities = pipelineEntries.length;
        const activeDeals = pipelineEntries.filter(entry => 
          entry.stage !== 'Closed Won' && entry.stage !== 'Closed Lost'
        ).length;
        const closedDeals = pipelineEntries.filter(entry => 
          entry.stage === 'Closed Won'
        ).length;
        const totalValue = pipelineEntries.reduce((sum, entry) => 
          sum + (entry.amount || 0), 0
        );
        const avgDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
        const conversionRate = totalOpportunities > 0 ? (closedDeals / totalOpportunities) * 100 : 0;

        // Count by stages
        const stagesCount: Record<string, number> = {};
        pipelineEntries.forEach(entry => {
          const stage = entry.stage || 'Unknown';
          stagesCount[stage] = (stagesCount[stage] || 0) + 1;
        });

        setOverview({
          totalOpportunities,
          activeDeals,
          closedDeals,
          totalValue,
          avgDealSize,
          avgCycleTime: 42, // Sample data
          conversionRate,
          stagesCount
        });
      }
    } catch (error) {
      console.error('Error fetching pipeline overview:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pipeline data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="h-8 bg-muted rounded w-64 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-card border-0 shadow-lg rounded-lg p-6">
              <div className="h-6 bg-muted rounded w-24 mb-4"></div>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-8 w-8 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Pipeline Management Center</h1>
        <p className="text-muted-foreground mt-2">
          Advanced sales pipeline tracking, opportunity management, and revenue forecasting
        </p>
      </div>

      {/* Pipeline Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-card border-0 shadow-lg hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold text-foreground">{overview.totalOpportunities}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-lg hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                <p className="text-2xl font-bold text-foreground">{overview.activeDeals}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-lg hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(overview.totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-lg hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Cycle Time</p>
                <p className="text-2xl font-bold text-foreground">{overview.avgCycleTime}d</p>
              </div>
              <Timer className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-card border-0 shadow-lg hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">{overview.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-lg hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(overview.avgDealSize)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-lg hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Closed Deals</p>
                <p className="text-2xl font-bold text-foreground">{overview.closedDeals}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {overview.conversionRate < 20 && (
        <Alert className="border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Pipeline conversion rate is below target ({overview.conversionRate.toFixed(1)}%). Consider reviewing qualification criteria and follow-up processes.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Button */}
      <div className="flex justify-end mb-6">
        <Button onClick={fetchPipelineOverview} className="flex items-center gap-2" variant="outline">
          <RefreshCw className="h-4 w-4" />
          Refresh Pipeline
        </Button>
      </div>

      <Tabs defaultValue="visual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 bg-muted/50">
          <TabsTrigger value="visual">Visual Pipeline</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
          <TabsTrigger value="stages">Stage Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="advanced-analytics">Advanced</TabsTrigger>
          <TabsTrigger value="collaboration">Team</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          <Card className="bg-card border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <GitBranch className="h-5 w-5 text-blue-600" />
                Interactive Pipeline View
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Drag and drop opportunities between stages to track progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InteractivePipeline />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Conversion Metrics
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Pipeline performance and conversion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Overall Conversion</span>
                    <span className="font-semibold text-foreground">{overview.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Average Deal Size</span>
                    <span className="font-semibold text-foreground">{formatCurrency(overview.avgDealSize)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Win Rate</span>
                    <span className="font-semibold text-green-600">68%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Velocity Metrics
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Speed and efficiency of deal progression
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Avg Sales Cycle</span>
                    <span className="font-semibold text-foreground">{overview.avgCycleTime} days</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Stage Progression Rate</span>
                    <span className="font-semibold text-foreground">85%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Time to Close</span>
                    <span className="font-semibold text-blue-600">32 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stages" className="space-y-6">
          <Card className="bg-card border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Stage Distribution
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Opportunities breakdown by pipeline stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(overview.stagesCount).length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pipeline data available</p>
                  </div>
                ) : (
                  Object.entries(overview.stagesCount).map(([stage, count]) => (
                    <div key={stage} className="flex justify-between items-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <span className="text-sm font-medium text-foreground">{stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-600">{count}</span>
                        <span className="text-sm text-muted-foreground">opportunities</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Revenue Forecast
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Projected revenue based on current pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">This Quarter</span>
                    <span className="font-semibold text-foreground">{formatCurrency(overview.totalValue * 0.3)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Next Quarter</span>
                    <span className="font-semibold text-foreground">{formatCurrency(overview.totalValue * 0.5)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Confidence Level</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Target className="h-5 w-5 text-green-600" />
                  Target Progress
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Progress towards revenue targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Monthly Target</span>
                    <span className="font-semibold text-foreground">{formatCurrency(1500000)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">Current Progress</span>
                    <span className="font-semibold text-foreground">78%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-sm font-medium text-muted-foreground">On Track</span>
                    <span className="font-semibold text-green-600">Yes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced-analytics" className="space-y-6">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <TeamCollaboration />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <WorkflowAutomation />
        </TabsContent>
      </Tabs>
    </div>
  );
}