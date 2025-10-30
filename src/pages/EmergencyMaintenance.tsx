import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmergencyShutdown } from '@/components/security/EmergencyShutdown';
import { useRoleBasedAccess } from '@/hooks/useRoleBasedAccess';
import { StandardPageLayout } from '@/components/StandardPageLayout';
import { StandardPageHeader } from '@/components/StandardPageHeader';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function EmergencyMaintenance() {
  const { canAccessAdminFeatures } = useRoleBasedAccess();

  // Only admins can access this page
  if (!canAccessAdminFeatures) {
    return (
      <StandardPageLayout>
        <ResponsiveContainer padding="lg" maxWidth="md">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full">
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
        </ResponsiveContainer>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout>
      <StandardPageHeader
        title="Emergency Maintenance Control"
        description="Monitor and manage emergency shutdown system for critical security incidents"
      />
      
      <ResponsiveContainer padding="md" maxWidth="full">
        <EmergencyShutdown />
      </ResponsiveContainer>
    </StandardPageLayout>
  );
}