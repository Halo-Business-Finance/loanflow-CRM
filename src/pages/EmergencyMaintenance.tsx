import React, { useState } from 'react';
import { ShieldAlert, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { EmergencyShutdown } from '@/components/security/EmergencyShutdown';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';

export default function EmergencyMaintenance() {
  const { canAccessAdminFeatures } = useRoleBasedAccess();
  const [activeTab, setActiveTab] = useState("shutdown");

  // Only admins can access this page
  if (!canAccessAdminFeatures) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Lock className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
              <CardDescription className="text-lg">
                You do not have permission to access Emergency Maintenance controls
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  This page is restricted to security administrators only. 
                  Emergency shutdown controls require elevated privileges to prevent unauthorized system lockdowns.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Emergency Maintenance Control
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor and manage emergency shutdown system for critical security incidents
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-[#0A1628] p-1 gap-2">
              <TabsTrigger 
                value="shutdown" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Emergency Shutdown</span>
              </TabsTrigger>
              <TabsTrigger 
                value="monitoring" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>System Monitoring</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white hover:text-white rounded-md flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Event History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shutdown" className="space-y-6">
              <EmergencyShutdown />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Card className="border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-normal text-[#161616]">System Status Monitoring</CardTitle>
                  <CardDescription className="text-[#525252]">
                    Real-time monitoring of critical system components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      System monitoring dashboard - Coming soon
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-normal text-[#161616]">Emergency Event History</CardTitle>
                  <CardDescription className="text-[#525252]">
                    View past emergency shutdown events and system responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <RefreshCw className="h-4 w-4" />
                    <AlertDescription>
                      Event history log - Coming soon
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}