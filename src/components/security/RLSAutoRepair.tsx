import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface RLSAutoRepairProps {
  onRepairComplete?: () => void;
  autoDetect?: boolean;
  showSuccessAlert?: boolean;
}

interface DiagnosticIssue {
  type: 'missing_viewer_role' | 'no_accessible_leads' | 'rpc_error';
  severity: 'critical' | 'high' | 'medium';
  message: string;
  canAutoFix: boolean;
}

export function RLSAutoRepair({ 
  onRepairComplete, 
  autoDetect = true,
  showSuccessAlert = true 
}: RLSAutoRepairProps) {
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  const [issues, setIssues] = useState<DiagnosticIssue[]>([]);
  const [showRepairDialog, setShowRepairDialog] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<'success' | 'failed' | null>(null);
  const [checking, setChecking] = useState(false);

  const detectIssues = async () => {
    if (!user) return;

    setChecking(true);
    const detectedIssues: DiagnosticIssue[] = [];

    try {
      // Check 1: User has viewer role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('role', 'viewer')
        .eq('is_active', true)
        .maybeSingle();

      if (!roleData && !roleError) {
        detectedIssues.push({
          type: 'missing_viewer_role',
          severity: 'critical',
          message: 'Viewer role is not assigned to your account',
          canAutoFix: true
        });
      }

      // Check 2: Can access leads via RPC
      const { data: rpcLeads, error: rpcError } = await supabase
        .rpc('get_accessible_leads');

      if (rpcError) {
        detectedIssues.push({
          type: 'rpc_error',
          severity: 'high',
          message: `RPC access error: ${rpcError.message}`,
          canAutoFix: false
        });
      } else if (rpcLeads && rpcLeads.length === 0) {
        // Check if there are leads in the database
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        if (count && count > 0) {
          detectedIssues.push({
            type: 'no_accessible_leads',
            severity: 'high',
            message: `Database contains ${count} leads but RPC returns 0 accessible`,
            canAutoFix: true
          });
        }
      }

      setIssues(detectedIssues);

      // Auto-show repair dialog if critical issues found
      if (detectedIssues.some(i => i.severity === 'critical' && i.canAutoFix)) {
        setShowRepairDialog(true);
      }

    } catch (err: any) {
      console.error('[RLSAutoRepair] Detection failed:', err);
    } finally {
      setChecking(false);
    }
  };

  const performRepair = async () => {
    if (!user) return;

    setRepairing(true);
    try {
      // Step 1: Ensure viewer role
      const { error: roleError } = await supabase.rpc('ensure_default_viewer_role');
      
      if (roleError) {
        throw new Error(`Failed to assign viewer role: ${roleError.message}`);
      }

      // Step 2: Verify role was assigned
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for DB consistency
      
      const { data: verifyRole } = await supabase
        .from('user_roles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .eq('role', 'viewer')
        .eq('is_active', true)
        .maybeSingle();

      if (!verifyRole) {
        throw new Error('Role assignment could not be verified');
      }

      // Step 3: Test RPC access
      const { data: testLeads, error: testError } = await supabase
        .rpc('get_accessible_leads');

      if (testError) {
        throw new Error(`RPC access test failed: ${testError.message}`);
      }

      setRepairResult('success');
      setIssues([]);
      
      if (showSuccessAlert) {
        toast({
          title: 'Repair Successful',
          description: `Viewer role assigned. You now have access to ${testLeads?.length || 0} leads.`,
          duration: 5000,
        });
      }

      // Notify parent component
      if (onRepairComplete) {
        onRepairComplete();
      }

      // Close dialog after brief delay
      setTimeout(() => {
        setShowRepairDialog(false);
        setRepairResult(null);
      }, 2000);

    } catch (err: any) {
      console.error('[RLSAutoRepair] Repair failed:', err);
      setRepairResult('failed');
      toast({
        title: 'Repair Failed',
        description: err.message || 'Unable to complete automatic repair',
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => {
    if (autoDetect && user) {
      // Run detection after a short delay to allow auth to settle
      const timer = setTimeout(() => {
        detectIssues();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, autoDetect]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  if (issues.length === 0) {
    return null;
  }

  return (
    <>
      {/* Inline Alert for detected issues */}
      <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-orange-900 dark:text-orange-100">
              Access Issues Detected
            </strong>
            <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
              {issues.length} issue{issues.length > 1 ? 's' : ''} found that may prevent you from accessing leads.
            </p>
          </div>
          <Button
            onClick={() => setShowRepairDialog(true)}
            variant="default"
            size="sm"
            className="ml-4 bg-orange-600 hover:bg-orange-700"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Auto-Repair
          </Button>
        </AlertDescription>
      </Alert>

      {/* Repair Confirmation Dialog */}
      <AlertDialog open={showRepairDialog} onOpenChange={setShowRepairDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              RLS Access Repair
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              The following access issues were detected:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 my-4">
            {issues.map((issue, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50"
              >
                {issue.severity === 'critical' ? (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getSeverityBadge(issue.severity)}
                    {issue.canAutoFix && (
                      <Badge variant="outline" className="text-xs">
                        Auto-fixable
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{issue.message}</p>
                </div>
              </div>
            ))}
          </div>

          {repairResult === 'success' && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                Repair completed successfully! Access has been restored.
              </AlertDescription>
            </Alert>
          )}

          {repairResult === 'failed' && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900 dark:text-red-100">
                Automatic repair failed. Please contact your administrator.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>What will happen:</strong>
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
              <li>Assign default 'viewer' role to your account</li>
              <li>Verify role assignment in database</li>
              <li>Test RPC access to leads</li>
              <li>Refresh your lead data automatically</li>
            </ul>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={repairing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                performRepair();
              }}
              disabled={repairing || repairResult === 'success'}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {repairing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Repairing...
                </>
              ) : repairResult === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Repaired
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 mr-2" />
                  Run Auto-Repair
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manual trigger button for diagnostics page */}
      {!autoDetect && (
        <Button
          onClick={detectIssues}
          disabled={checking}
          variant="outline"
          size="sm"
        >
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Wrench className="h-4 w-4 mr-2" />
              Check for Issues
            </>
          )}
        </Button>
      )}
    </>
  );
}
