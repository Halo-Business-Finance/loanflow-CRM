import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { useMfaStatus } from '@/hooks/useMfaStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

interface MfaEnforcementWrapperProps {
  children: React.ReactNode;
}

export const MfaEnforcementWrapper: React.FC<MfaEnforcementWrapperProps> = ({ children }) => {
  const { user } = useAuth();
  const { mfaStatus, loading } = useMfaStatus(user?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If MFA setup is required immediately (after 3 logins), show blocking banner but do not redirect
  if (mfaStatus?.requires_immediate_setup) {
    if (import.meta.env.DEV) {
      console.info('[MFA] Immediate setup required — showing banner, no redirect');
    }
    return (
      <div className="min-h-screen flex flex-col">
        <Alert className="rounded-none border-l-4 border-l-warning bg-warning/10">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <AlertTitle className="font-semibold">MFA Required</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Multi-factor authentication is required to continue using the app. Please set up MFA now to secure your account.
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => (window.location.href = '/settings?tab=security&mfa=required')}
              className="ml-4"
           >
              <Shield className="mr-2 h-4 w-4" />
              Set Up MFA Now
            </Button>
          </AlertDescription>
        </Alert>
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  // Show grace period warning banner if applicable
  if (mfaStatus?.mfa_setup_required && 
      !mfaStatus?.mfa_setup_completed && 
      mfaStatus?.grace_logins_remaining > 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Alert className="rounded-none border-l-4 border-l-warning bg-warning/10">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <AlertTitle className="font-semibold">MFA Setup Required</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have {mfaStatus.grace_logins_remaining} login{mfaStatus.grace_logins_remaining === 1 ? '' : 's'} remaining 
              before multi-factor authentication is required. Please set up MFA to secure your account.
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/settings?tab=security'}
              className="ml-4"
            >
              <Shield className="mr-2 h-4 w-4" />
              Set Up MFA Now
            </Button>
          </AlertDescription>
        </Alert>
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
