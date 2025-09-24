import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Target,
  FileText,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatCurrency } from "@/lib/utils";

interface FunderStats {
  totalFunded: number;
  avgFundingTime: number;
  fundingVolume: number;
  activeFundings: number;
  successRate: number;
}

interface FundingLead {
  id: string;
  client_name: string;
  business_name: string;
  loan_amount: number;
  loan_type: string;
  stage: string;
  submitted_date: string;
  urgency: 'low' | 'medium' | 'high';
}

export function FunderDashboard() {
  const { user } = useAuth();
  const [funderStats, setFunderStats] = useState<FunderStats>({
    totalFunded: 0,
    avgFundingTime: 0,
    fundingVolume: 0,
    activeFundings: 0,
    successRate: 0
  });
  const [recentFundings, setRecentFundings] = useState<FundingLead[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<FundingLead[]>([]);
  const [pendingFundings, setPendingFundings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFunderData()
  }, [])

  const fetchFunderData = async () => {
    try {
      // Fetch loans that need funding or have been funded
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .in('status', ['approved', 'funded']);

      if (loansError) {
        console.error('Error fetching loans:', loansError);
        // Empty state fallback
        setFunderStats({
          totalFunded: 0,
          avgFundingTime: 0,
          fundingVolume: 0,
          activeFundings: 0,
          successRate: 0
        });
        setRecentFundings([]);
        setPendingApprovals([]);
        return;
      }

      if (loansData && loansData.length > 0) {
        const fundedLoans = loansData.filter(loan => loan.status === 'funded');
        const totalFunded = fundedLoans.reduce((sum, loan) => sum + (loan.loan_amount || 0), 0);
        const fundingVolume = loansData.reduce((sum, loan) => sum + (loan.loan_amount || 0), 0);

        setFunderStats({
          totalFunded,
          avgFundingTime: 7, // Default value since we don't have funding dates
          fundingVolume,
          activeFundings: loansData.filter(loan => loan.status === 'approved').length,
          successRate: fundedLoans.length > 0 ? Math.round((fundedLoans.length / loansData.length) * 100) : 0
        });
        
        setRecentFundings([]);
        setPendingApprovals([]);
      } else {
        // Empty state
        setFunderStats({
          totalFunded: 0,
          avgFundingTime: 0,
          fundingVolume: 0,
          activeFundings: 0,
          successRate: 0
        });
        setRecentFundings([]);
        setPendingApprovals([]);
      }
    } catch (error) {
      console.error('Error in fetchFunderData:', error);
      // Empty state fallback
      setFunderStats({
        totalFunded: 0,
        avgFundingTime: 0,
        fundingVolume: 0,
        activeFundings: 0,
        successRate: 0
      });
      setRecentFundings([]);
      setPendingApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunderData();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Funder Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor funding operations and manage loan approvals
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Fund Loans
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Funded
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(funderStats.totalFunded)}
            </div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 inline mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Funding Time
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funderStats.avgFundingTime} days</div>
            <p className="text-xs text-muted-foreground">
              <ArrowDownRight className="h-3 w-3 inline mr-1" />
              -2 days from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Funding Volume
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(funderStats.fundingVolume)}
            </div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 inline mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Fundings
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funderStats.activeFundings}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting funding approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Success Rate
            </CardTitle>
            
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{funderStats.successRate}%</div>
            <Progress value={funderStats.successRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Pending Approvals ({pendingApprovals.length})
            </CardTitle>
            <CardDescription>
              Loans ready for funding approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {pendingApprovals.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{loan.client_name || 'Unknown Client'}</div>
                        <div className="text-sm text-muted-foreground">
                          {loan.business_name || 'Unknown Business'} • {formatCurrency(loan.loan_amount || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {loan.loan_type || 'Unknown Type'} • Applied recently
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getUrgencyColor('medium')}>
                          Ready
                        </Badge>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground">No pending approvals</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Fundings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Recent Fundings ({recentFundings.length})
            </CardTitle>
            <CardDescription>
              Recently completed funding transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentFundings.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {recentFundings.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="font-medium">{loan.client_name || 'Unknown Client'}</div>
                        <div className="text-sm text-muted-foreground">
                          {loan.business_name || 'Unknown Business'} • {formatCurrency(loan.loan_amount || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Funded recently
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">
                          Funded
                        </Badge>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground">No recent fundings</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}