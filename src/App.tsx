import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { AuthPage } from "@/components/auth/AuthPage";
import { CallbackHandler } from "@/components/auth/CallbackHandler";
import { SecurityManager } from "@/components/security/SecurityManager";
import { GeoSecurityCheck } from "@/components/GeoSecurityCheck";
import { AsyncErrorBoundary } from "@/components/AsyncErrorBoundary";
import { CSPHeaders } from "@/components/security/CSPHeaders";
import { MasterSecurityDashboard } from "@/components/security/MasterSecurityDashboard";
import { MilitaryGradeSecurityDashboard } from "@/components/security/MilitaryGradeSecurityDashboard";
import Layout from "@/components/Layout";
import HorizontalLayout from "@/components/HorizontalLayout";
import { SecurityEnhancementProvider } from "@/components/security/SecurityEnhancementProvider";
import { SecurityProvider as EnhancedSecurityProvider } from "@/components/security/SecurityProvider";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import Index from "./pages/Index";
import Overview from "./pages/Overview";
import QuickActions from "./pages/QuickActions";
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
import Activities from "./pages/Activities";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
console.log('Users component imported:', Users);
import UsersLeads from "./pages/UsersLeads";
import Resources from "./pages/Resources";
import Enterprise from "./pages/Enterprise";
import Integrations from "./pages/Integrations";
import AITools from "./pages/AITools";
import APIDocs from "./pages/APIDocs";
import Screenshots from "./pages/Screenshots";
import Security from "./pages/Security";
import EmergencyMaintenance from "./pages/EmergencyMaintenance";
import NotFound from "./pages/NotFound";
import UnderwriterDocuments from "./pages/UnderwriterDocuments";
import UnderwriterRisk from "./pages/UnderwriterRisk";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentTemplates from "./pages/DocumentTemplates";
import ActivitiesCalendar from "./pages/ActivitiesCalendar";
import ActivitiesTasks from "./pages/ActivitiesTasks";
import SecurityAccess from "./pages/SecurityAccess";
import SecurityAudit from "./pages/SecurityAudit";
import SecurityThreats from "./pages/SecurityThreats";
import SecurityCompliance from "./pages/SecurityCompliance";
import SettingsUsers from "./pages/SettingsUsers";
import SettingsSystem from "./pages/SettingsSystem";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useEnhancedSecurity } from "@/hooks/useEnhancedSecurity";

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
  const { user, loading, userRole } = useAuth();
  
  // Removed logging for production security

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3">Loading authentication...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <KeyboardShortcutsProvider />
      <SecurityProvider />
      <Routes>
        {/* Public routes - accessible without authentication */}
        <Route path="/auth" element={<AuthPage />} errorElement={<RouteErrorBoundary />} />
        <Route path="/auth/callback" element={<CallbackHandler />} errorElement={<RouteErrorBoundary />} />
        
        {/* Protected routes - require authentication */}
        {user ? (
          <>
            <Route path="/" element={<HorizontalLayout><Index /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/overview" element={<HorizontalLayout><Overview /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/quick-actions" element={<HorizontalLayout><QuickActions /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/leads" element={<HorizontalLayout><Leads /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/leads/new" element={<HorizontalLayout><NewLead /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/leads/stats" element={<HorizontalLayout><LeadStats /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/leads/assignment" element={<HorizontalLayout><LeadAssignment /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/leads/:id" element={<LeadDetail />} errorElement={<RouteErrorBoundary />} />
            <Route path="/leads/:leadId/documents" element={<HorizontalLayout><LeadDocuments /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/existing-borrowers" element={<HorizontalLayout><Clients /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/existing-borrowers/details" element={<HorizontalLayout><BorrowerDetails /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/existing-borrowers/history" element={<HorizontalLayout><LoanHistory /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/existing-borrowers/:id" element={<HorizontalLayout><ClientDetail /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            {/* Redirect old client routes to existing borrowers */}
            <Route path="/clients/:id" element={<HorizontalLayout><ClientDetail /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/pipeline" element={<HorizontalLayout><Pipeline /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/pipeline/analytics" element={<HorizontalLayout><PipelineAnalytics /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/pipeline/stages" element={<HorizontalLayout><StageManagement /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/underwriter" element={<HorizontalLayout><Underwriter /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/underwriter/documents" element={<HorizontalLayout><UnderwriterDocuments /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/underwriter/risk" element={<HorizontalLayout><UnderwriterRisk /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/documents" element={<HorizontalLayout><Documents /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/documents/upload" element={<HorizontalLayout><DocumentUpload /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/documents/templates" element={<HorizontalLayout><DocumentTemplates /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/activities" element={<HorizontalLayout><Activities /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/activities/calendar" element={<HorizontalLayout><ActivitiesCalendar /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/activities/tasks" element={<HorizontalLayout><ActivitiesTasks /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/reports" element={<HorizontalLayout><Reports /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/settings" element={<HorizontalLayout><Settings /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/settings/users" element={<HorizontalLayout><SettingsUsers /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/settings/system" element={<HorizontalLayout><SettingsSystem /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/users" element={<HorizontalLayout><Users /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            {/* Debug route */}
            <Route path="/users-debug" element={<div>Users route test</div>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/security" element={<HorizontalLayout><Security /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/security/access" element={<HorizontalLayout><SecurityAccess /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/security/audit" element={<HorizontalLayout><SecurityAudit /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/security/threats" element={<HorizontalLayout><SecurityThreats /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/security/compliance" element={<HorizontalLayout><SecurityCompliance /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/security/military" element={<Layout><MilitaryGradeSecurityDashboard /></Layout>} errorElement={<RouteErrorBoundary />} />
            
            <Route path="/enterprise" element={<HorizontalLayout><Enterprise /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/integrations" element={<HorizontalLayout><Integrations /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/ai-tools" element={<HorizontalLayout><AITools /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/screenshots" element={<HorizontalLayout><Screenshots /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/api-docs" element={<HorizontalLayout><APIDocs /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/resources" element={<HorizontalLayout><Resources /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="/emergency-maintenance" element={<HorizontalLayout><EmergencyMaintenance /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
            <Route path="*" element={<HorizontalLayout><NotFound /></HorizontalLayout>} errorElement={<RouteErrorBoundary />} />
          </>
        ) : (
          <>
            {/* Redirect all other routes to auth when not logged in */}
            <Route path="*" element={<AuthPage />} errorElement={<RouteErrorBoundary />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

const App = () => {
  // Removed console.log for production security
  
  return (
    <AsyncErrorBoundary onError={(error) => {
      // Only log errors in development
      if (import.meta.env.DEV) {
        console.error('AsyncErrorBoundary caught:', error);
      }
    }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CSPHeaders />
          {/* ProductionSecurityHeaders now included in MasterSecurityDashboard */}
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
