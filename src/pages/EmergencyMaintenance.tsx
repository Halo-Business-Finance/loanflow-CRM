import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmergencyShutdown } from '@/components/security/EmergencyShutdown';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { StandardPageLayout } from '@/components/StandardPageLayout';

export default function EmergencyMaintenance() {
  const { canAccessAdminFeatures } = useRoleBasedAccess();

  // Only admins can access this page
  if (!canAccessAdminFeatures) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
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
    );
  }

  return (
    <StandardPageLayout>
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="h-8 w-8 text-destructive" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Emergency Maintenance Control</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage emergency shutdown system for critical security incidents</p>
        </div>
      </div>
      
      <EmergencyShutdown />
    </StandardPageLayout>
  );
}