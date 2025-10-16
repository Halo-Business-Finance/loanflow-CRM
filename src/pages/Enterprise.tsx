import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { CustomObjectsManager } from "@/components/enterprise/CustomObjectsManager";
import { WorkflowBuilder } from "@/components/enterprise/WorkflowBuilder";
import { ApprovalProcessManager } from "@/components/enterprise/ApprovalProcessManager";
import { TerritoryManager } from "@/components/enterprise/TerritoryManager";
import { ForecastingDashboard } from "@/components/enterprise/ForecastingDashboard";
import { OpportunityManager } from "@/components/enterprise/OpportunityManager";
import { 
  Database, 
  Workflow, 
  CheckCircle, 
  Map, 
  TrendingUp, 
  Target,
  Shield
} from "lucide-react";

export default function Enterprise() {
  const { hasRole, loading: authLoading, userRoles, user } = useAuth();
  const [activeTab, setActiveTab] = useState("custom-objects");

  // Debug logging
  console.log('Enterprise Page - Auth State:', {
    authLoading,
    userRoles,
    userId: user?.id,
    hasAdminRole: hasRole('admin'),
    hasSuperAdminRole: hasRole('super_admin')
  });

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // If roles haven't loaded yet, keep showing the loading state
  if (!userRoles || userRoles.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading roles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!(hasRole('admin') || hasRole('super_admin'))) {
    return (
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-96">
            <Card className="text-center max-w-xl w-full">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
                <CardTitle>Access Restricted</CardTitle>
                <CardDescription>
                  Only administrators can access enterprise features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Signed in as <span className="font-medium">{user?.email ?? 'unknown'}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your roles: <span className="font-medium">{userRoles?.join(', ') || 'none'}</span>
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <a href="/auth">
                    <Button variant="outline">Switch account</Button>
                  </a>
                  <a href="/">
                    <Button variant="ghost">Go Home</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    );
  }

  const features = [
    {
      id: "custom-objects",
      label: "Custom Objects",
      icon: Database,
      description: "Create custom data models beyond leads and clients"
    },
    {
      id: "workflows",
      label: "Workflow Builder",
      icon: Workflow,
      description: "Visual process automation with conditional logic"
    },
    {
      id: "approvals",
      label: "Approval Processes",
      icon: CheckCircle,
      description: "Multi-step approval workflows for deals and pricing"
    },
    {
      id: "territories",
      label: "Territory Management",
      icon: Map,
      description: "Geographic and hierarchical territory assignment"
    },
    {
      id: "forecasting",
      label: "Sales Forecasting",
      icon: TrendingUp,
      description: "Advanced forecasting with multiple methodologies"
    },
    {
      id: "opportunities",
      label: "Opportunity Splits",
      icon: Target,
      description: "Revenue sharing across multiple team members"
    }
  ];

  return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Enterprise Command Center</h1>
          <p className="text-muted-foreground ml-4">
            Advanced CRM capabilities for enterprise-level sales management
          </p>
        </div>

        {/* Enterprise Features Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Features</p>
                  <div className="mt-1">
                    <p className="text-lg font-bold">{features.length}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">
                  ENTERPRISE
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                  <p className="text-2xl font-bold text-primary">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Custom Objects</p>
                  <p className="text-2xl font-bold text-primary">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approval Processes</p>
                  <p className="text-2xl font-bold text-primary">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <TabsTrigger key={feature.id} value={feature.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline text-xs">{feature.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeTab === feature.id;
              return (
                <Card 
                  key={feature.id} 
                  className={`cursor-pointer transition-colors ${
                    isActive ? 'border-primary bg-primary text-primary-foreground' : 'hover:border-primary/50'
                  }`}
                  onClick={() => setActiveTab(feature.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-primary-foreground'}`} />
                      {isActive && <span className="text-sm font-medium">Active</span>}
                    </div>
                    <CardTitle className="text-sm">{feature.label}</CardTitle>
                    <CardDescription className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-primary-foreground/80'}`}>
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <TabsContent value="custom-objects" className="space-y-6">
            <CustomObjectsManager />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <WorkflowBuilder />
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <ApprovalProcessManager />
          </TabsContent>

          <TabsContent value="territories" className="space-y-6">
            <TerritoryManager />
          </TabsContent>

          <TabsContent value="forecasting" className="space-y-6">
            <ForecastingDashboard />
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            <OpportunityManager />
          </TabsContent>
        </Tabs>
      </div>
    
  );
}