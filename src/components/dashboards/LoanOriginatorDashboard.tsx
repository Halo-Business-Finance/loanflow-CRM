import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { CompactMessagesWidget } from '@/components/CompactMessagesWidget';
import { CompactCalendarWidget } from '@/components/CompactCalendarWidget';
import { TodaysScheduleWidget } from '@/components/widgets/TodaysScheduleWidget';
import { LeadScoring } from '@/components/ai/LeadScoring';
import { QuoteGenerator } from '@/components/originator/QuoteGenerator';
import { CommissionCalculator } from '@/components/originator/CommissionCalculator';
import { 
  Target,
  Calculator,
  DollarSign,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const LoanOriginatorDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <IBMPageHeader
        title="Loan Originator Dashboard"
        subtitle="Generate leads, quotes, and track commissions"
        actions={
          <Button 
            size="sm" 
            onClick={handleRefresh}
            className="h-9 px-4 bg-[#0f62fe] hover:bg-[#0353e9] text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        }
      />

      <div className="p-8 space-y-6" key={refreshKey}>
        {/* Top Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CompactMessagesWidget />
          <CompactCalendarWidget />
          <TodaysScheduleWidget />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="lead-scoring" className="space-y-4">
          <TabsList className="bg-[#0A1628] p-1 gap-2 inline-flex w-auto">
            <TabsTrigger value="lead-scoring" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2">
              <Target className="w-4 h-4" />
              AI Lead Scoring
            </TabsTrigger>
            <TabsTrigger value="quote-generator" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Quote Generator
            </TabsTrigger>
            <TabsTrigger value="commissions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Commissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lead-scoring" className="space-y-4">
            <LeadScoring />
          </TabsContent>

          <TabsContent value="quote-generator" className="space-y-4">
            <QuoteGenerator />
          </TabsContent>

          <TabsContent value="commissions" className="space-y-4">
            <CommissionCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
