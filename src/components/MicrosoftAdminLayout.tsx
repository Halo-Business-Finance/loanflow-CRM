import React from "react"
import { useLocation, Link } from "react-router-dom"
import { 
  Home, BarChart3, Users, FileText, Settings, Search, CreditCard,
  HelpCircle, Shield, Key, Building, Workflow, Brain, TrendingUp,
  Calendar, CheckSquare, PieChart, Activity, Target, Database,
  UserCheck, AlertTriangle, Clock, Award, Zap, BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TopNavigation } from "./navigation/TopNavigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ContextualSidebar } from "./navigation/ContextualSidebar"

interface MicrosoftAdminLayoutProps {
  children: React.ReactNode
}

// Microsoft 365 admin center style navigation
const navigationGroups = [
  {
    label: "Main",
    items: [
      { title: "Home", url: "/", icon: Home, description: "Overview and quick actions" },
      { title: "Overview", url: "/dashboard", icon: BarChart3, description: "Performance dashboard" },
    ]
  },
  {
    label: "Core CRM",
    items: [
      { title: "Leads", url: "/leads", icon: Users, description: "Manage your lead pipeline" },
      { title: "Pipeline", url: "/pipeline", icon: TrendingUp, description: "Sales pipeline management" },
      { title: "Clients", url: "/clients", icon: Building, description: "Client management" },
      { title: "Activities", url: "/activities", icon: Activity, description: "Tasks and calendar" },
    ]
  },
  {
    label: "Loan Processing",
    items: [
      { title: "Underwriter", url: "/underwriter", icon: Shield, description: "Loan underwriting tools" },
      { title: "Documents", url: "/documents", icon: FileText, description: "Document management" },
      { title: "Borrower Details", url: "/existing-borrowers", icon: UserCheck, description: "Existing borrower information" },
    ]
  },
  {
    label: "Analytics & Reports",
    items: [
      { title: "Reports", url: "/reports", icon: PieChart, description: "Business intelligence" },
      { title: "Analytics", url: "/pipeline/analytics", icon: BarChart3, description: "Advanced analytics" },
      { title: "Lead Stats", url: "/leads/stats", icon: Target, description: "Lead performance metrics" },
    ]
  },
  {
    label: "Enterprise Tools",
    items: [
      { title: "AI Tools", url: "/ai-tools", icon: Brain, description: "Artificial intelligence features" },
      { title: "Integrations", url: "/integrations", icon: Workflow, description: "Third-party integrations" },
      { title: "API Docs", url: "/api-docs", icon: BookOpen, description: "Developer resources" },
    ]
  },
  {
    label: "Administration",
    items: [
      { title: "Security", url: "/security", icon: Shield, description: "Security management" },
      { title: "Settings", url: "/settings", icon: Settings, description: "System configuration" },
      { title: "Users", url: "/settings/users", icon: Users, description: "User management" },
    ]
  }
]

export default function MicrosoftAdminLayout({ children }: MicrosoftAdminLayoutProps) {
  const location = useLocation()

  const isActivePath = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col w-full bg-background">
        {/* Top Navigation - Preserved as requested */}
        <TopNavigation />
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Contextual Sidebar - Collapsible */}
          <ContextualSidebar />

          {/* Main Content */}
          <SidebarInset>
            <main className="flex-1 overflow-y-auto bg-background p-6">
              <div className="h-full">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}