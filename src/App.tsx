import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { AuthPage } from "@/components/auth/AuthPage";
import { CallbackHandler } from "@/components/auth/CallbackHandler";
import { MfaEnforcementWrapper } from "@/components/auth/MfaEnforcementWrapper";
import { SecurityManager } from "@/components/security/SecurityManager";
import { GeoSecurityCheck } from "@/components/GeoSecurityCheck";
import { AsyncErrorBoundary } from "@/components/AsyncErrorBoundary";
import { CSPHeaders } from "@/components/security/CSPHeaders";
import { EnterpriseSecurityDashboard } from "@/components/security/EnterpriseSecurityDashboard";
import { LoanCloserDashboard } from "@/components/dashboards/LoanCloserDashboard";
import { LoanProcessorDashboard } from "@/components/dashboards/LoanProcessorDashboard";
import { UnderwriterDashboard } from "@/components/dashboards/UnderwriterDashboard";
import { DataIntegrityDashboard } from "@/components/DataIntegrityDashboard";

import { IBMCloudLayout } from "@/components/layouts/IBMCloudLayout";
import { SecurityEnhancementProvider } from "@/components/security/SecurityEnhancementProvider";
import { SecurityProvider as EnhancedSecurityProvider } from "@/components/security/SecurityProvider";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import Dashboard from "./pages/Dashboard";

import Leads from "./pages/Leads";
import NewLead from "./pages/NewLead";
import LeadStats from "./pages/LeadStats";
import LeadAssignment from "./pages/LeadAssignment";
import LeadDetail from "./pages/LeadDetail";
import LeadDocuments from "./pages/LeadDocuments";
import Pipeline from "./pages/Pipeline";
import PipelineAnalytics from "./pages/PipelineAnalytics";
import StageManagement from "./pages/StageManagement";
import Underwriter from "./pages/Underwriter";
import Clients from "./pages/Clients";
import BorrowerDetails from "./pages/BorrowerDetails";
import LoanHistory from "./pages/LoanHistory";
import ClientDetail from "./pages/ClientDetail";
import Documents from "./pages/Documents";
import LoanDocumentsFolder from "./pages/LoanDocumentsFolder";
import Activities from "./pages/Activities";
import Reports from "./pages/Reports";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import UserDirectory from "./pages/UserDirectory";
import Resources from "./pages/Resources";
import Enterprise from "./pages/Enterprise";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import Integrations from "./pages/Integrations";
import AITools from "./pages/AITools";
import APIDocs from "./pages/APIDocs";
import Screenshots from "./pages/Screenshots";
import Security from "./pages/Security";
import EmergencyMaintenance from "./pages/EmergencyMaintenance";
import NotFound from "./pages/NotFound";
import DocumentTemplates from "./pages/DocumentTemplates";
import ActivitiesCalendar from "./pages/ActivitiesCalendar";
import ActivitiesTasks from "./pages/ActivitiesTasks";
import SecurityAccess from "./pages/SecurityAccess";
import SecurityAudit from "./pages/SecurityAudit";
import SecurityThreats from "./pages/SecurityThreats";
import SecurityCompliance from "./pages/SecurityCompliance";
import SettingsUsers from "./pages/SettingsUsers";
import SettingsSystem from "./pages/SettingsSystem";
import Messages from "./pages/Messages";
import LeadAccessDiagnostics from "./pages/LeadAccessDiagnostics";
import Lenders from "./pages/Lenders";
import NewLender from "./pages/NewLender";
import NewLenderContact from "./pages/NewLenderContact";
import LenderDetail from "./pages/LenderDetail";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useEnhancedSecurity } from "@/hooks/useEnhancedSecurity";
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess";

const queryClient = new QueryClient();

function KeyboardShortcutsProvider() {
  useKeyboardShortcuts();
  return null;
}

function SecurityProvider() {
  useEnhancedSecurity();
  return null;
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();
  const {
    hasMinimumRole,
    canProcessLoans,
    canFundLoans,
    canUnderwriteLoans,
    canCloseLoans,
    canAccessAdminFeatures
  } = useRoleBasedAccess();
  
  // Only show loading state during initial auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, only allow auth routes
  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<CallbackHandler />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // User is authenticated - show full app
  return (
    <BrowserRouter>
      <KeyboardShortcutsProvider />
      <SecurityProvider />
      <Routes>
        {/* Public routes - always accessible */}
        <Route path="/auth" element={<AuthPage />} errorElement={<RouteErrorBoundary />} />
        <Route path="/auth/callback" element={<CallbackHandler />} errorElement={<RouteErrorBoundary />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/" element={<Navigate to="/loan-originator" replace />} errorElement={<RouteErrorBoundary />} />
        <Route path="/loan-originator" element={<MfaEnforcementWrapper><IBMCloudLayout key="dashboard-layout"><Dashboard /></IBMCloudLayout></MfaEnforcementWrapper>} errorElement={<RouteErrorBoundary />} />
        <Route path="/dashboard" element={<Navigate to="/loan-originator" replace />} errorElement={<RouteErrorBoundary />} />
        
        <Route path="/leads" element={<IBMCloudLayout><Leads /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/leads/new" element={<IBMCloudLayout><NewLead /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/leads/stats" element={<IBMCloudLayout><LeadStats /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/leads/assignment" element={<IBMCloudLayout><LeadAssignment /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/leads/recently-assigned" element={<IBMCloudLayout><LeadAssignment /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/leads/:id" element={<IBMCloudLayout><LeadDetail /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/leads/:leadId/documents" element={<IBMCloudLayout><LeadDocuments /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        
        <Route path="/existing-borrowers" element={<IBMCloudLayout><Clients /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/existing-borrowers/details" element={<IBMCloudLayout><BorrowerDetails /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/existing-borrowers/history" element={<IBMCloudLayout><LoanHistory /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/existing-borrowers/:id" element={<IBMCloudLayout><ClientDetail /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        
        <Route path="/pipeline" element={<IBMCloudLayout><Pipeline /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/pipeline/analytics" element={<IBMCloudLayout><PipelineAnalytics /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/pipeline/stages" element={<IBMCloudLayout><StageManagement /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        
        {/* Documents routes */}
        <Route path="/documents" element={<IBMCloudLayout><Documents /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/documents/loan/:leadId" element={<IBMCloudLayout><LoanDocumentsFolder /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/documents/templates" element={<IBMCloudLayout><DocumentTemplates /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        
        <Route path="/activities" element={<IBMCloudLayout><Activities /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/activities/calendar" element={<IBMCloudLayout><ActivitiesCalendar /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/activities/tasks" element={<IBMCloudLayout><ActivitiesTasks /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        
        <Route path="/messages" element={<IBMCloudLayout><Messages /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        
        <Route path="/reports" element={<IBMCloudLayout><Reports /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/support" element={<IBMCloudLayout><Support /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/user-directory" element={<IBMCloudLayout><UserDirectory /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        
        {/* Lenders routes */}
        <Route path="/lenders" element={<IBMCloudLayout><Lenders /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/lenders/new" element={<IBMCloudLayout><NewLender /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/lenders/:id" element={<IBMCloudLayout><LenderDetail /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/lenders/:id/contacts/new" element={<IBMCloudLayout><NewLenderContact /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        
        <Route path="/settings" element={<IBMCloudLayout key="settings-layout"><Settings /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/settings/users" element={<IBMCloudLayout><SettingsUsers /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/settings/system" element={<IBMCloudLayout><SettingsSystem /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        
        <Route path="/security" element={<IBMCloudLayout><Security /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/security/access" element={<IBMCloudLayout><SecurityAccess /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/security/audit" element={<IBMCloudLayout><SecurityAudit /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/security/threats" element={<IBMCloudLayout><SecurityThreats /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/security/compliance" element={<IBMCloudLayout><SecurityCompliance /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/security/enterprise" element={<IBMCloudLayout><EnterpriseSecurityDashboard /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/security/lead-diagnostics" element={<IBMCloudLayout><LeadAccessDiagnostics /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />

        {/* Role-based Dashboard Routes */}
        {canCloseLoans && <Route path="/dashboards/closer" element={<IBMCloudLayout><LoanCloserDashboard /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />}
        {canProcessLoans && <Route path="/dashboards/processor" element={<IBMCloudLayout><LoanProcessorDashboard /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />}
        
        {/* Enterprise Dashboard Routes */}
        {canAccessAdminFeatures && <Route path="/dashboards/data-integrity" element={<IBMCloudLayout><DataIntegrityDashboard /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />}
        
        <Route path="/enterprise" element={<IBMCloudLayout><Enterprise /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/analytics/advanced" element={<IBMCloudLayout><AdvancedAnalytics /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/integrations" element={<IBMCloudLayout><Integrations /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/ai-tools" element={<IBMCloudLayout><AITools /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/screenshots" element={<IBMCloudLayout><Screenshots /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/api-docs" element={<IBMCloudLayout><APIDocs /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/resources" element={<IBMCloudLayout><Resources /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="/emergency-maintenance" element={<IBMCloudLayout><EmergencyMaintenance /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
        <Route path="*" element={<IBMCloudLayout><NotFound /></IBMCloudLayout>} errorElement={<RouteErrorBoundary />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => {
  // Removed console.log for production security
  
  return (
    <AsyncErrorBoundary onError={(error) => {
      import('@/lib/production-logger').then(({ logger }) => {
        logger.error('AsyncErrorBoundary caught error', error);
      })
    }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CSPHeaders />
          {/* Security enhancement providers temporarily disabled */}
          <AuthProvider>
            {/* Temporarily disabled security enhancement providers to prevent auto-refresh */}
            {/* <SecurityEnhancementProvider>
              <EnhancedSecurityProvider> */}
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <AuthenticatedApp />
                </TooltipProvider>
            {/* </EnhancedSecurityProvider>
            </SecurityEnhancementProvider> */}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AsyncErrorBoundary>
  );
};

export default App;
