import React from "react"
import { useLocation, Link } from "react-router-dom"
import { 
  Home, BarChart3, Users, FileText, Settings, Search, CreditCard,
  HelpCircle, Shield, Key, Building, Workflow, Brain, TrendingUp,
  Calendar, CheckSquare, PieChart, Activity, Target, Database,
  UserCheck, AlertTriangle, Clock, Award, Zap, BookOpen, 
  Monitor, ShieldCheck, LineChart, DollarSign, FileCheck,
  Gauge, ShieldAlert, TrendingDown, ChevronRight, ChevronDown
} from "lucide-react"
import { useRoleBasedAccess } from "@/hooks/useRoleBasedAccess"
import { cn } from "@/lib/utils"
import { TopNavigation } from "./navigation/TopNavigation"
import { 
  SidebarProvider, 
  SidebarInset, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar 
} from "@/components/ui/sidebar"

interface MicrosoftAdminLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  title: string
  url: string
  icon: any
  description: string
  subItems?: NavigationItem[]
}

interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

// Microsoft 365 admin center style navigation
const getNavigationGroups = (roleAccess: any) => [
  {
    label: "Dashboard",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: BarChart3, description: "Main dashboard and analytics" },
    ]
  },
  {
    label: "Loan Originations",
    items: [
      { title: "Leads", url: "/leads", icon: Users, description: "Manage your lead pipeline" },
      { title: "Loan Pipeline", url: "/pipeline", icon: TrendingUp, description: "Sales pipeline management" },
      { title: "Existing Borrowers", url: "/existing-borrowers", icon: Building, description: "Existing borrower management" },
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
      ...(roleAccess.canCloseLoans || roleAccess.canFundLoans || roleAccess.canProcessLoans || 
          roleAccess.canUnderwriteLoans || roleAccess.canAccessAdminFeatures || roleAccess.hasMinimumRole('manager') ? 
        [{
          title: "Dashboards", 
          url: "#", 
          icon: Monitor, 
          description: "Role-based dashboards",
          subItems: [
            ...(roleAccess.canCloseLoans ? [{ title: "Closer Dashboard", url: "/dashboards/closer", icon: FileCheck, description: "Loan closing management" }] : []),
            ...(roleAccess.canFundLoans ? [{ title: "Funder Dashboard", url: "/dashboards/funder", icon: DollarSign, description: "Funding management" }] : []),
            ...(roleAccess.canProcessLoans ? [{ title: "Processor Dashboard", url: "/dashboards/processor", icon: Workflow, description: "Loan processing" }] : []),
            ...(roleAccess.canUnderwriteLoans ? [{ title: "Underwriter Dashboard", url: "/dashboards/underwriter", icon: ShieldCheck, description: "Loan underwriting" }] : []),
            ...(roleAccess.canAccessAdminFeatures ? [
              { title: "Enhanced Security", url: "/dashboards/security-enhanced", icon: Shield, description: "Advanced security monitoring" },
              { title: "Security Compliance", url: "/dashboards/security-compliance", icon: ShieldAlert, description: "Compliance monitoring" },
              { title: "Threat Monitoring", url: "/dashboards/threat-monitoring", icon: AlertTriangle, description: "Threat detection" },
              { title: "Data Integrity", url: "/dashboards/data-integrity", icon: Database, description: "Data integrity monitoring" }
            ] : []),
            ...(roleAccess.hasMinimumRole('manager') ? [{ title: "Forecasting", url: "/dashboards/forecasting", icon: TrendingUp, description: "Revenue forecasting" }] : [])
          ]
        }] : [])
    ]
  }
]

// Microsoft Admin Sidebar Component
function MicrosoftAdminSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const collapsed = state === "collapsed"
  const roleAccess = useRoleBasedAccess()
  const navigationGroups = getNavigationGroups(roleAccess)
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({})

  const toggleItem = (title: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  const isActivePath = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <Sidebar className={cn("bg-card/60 backdrop-blur border-r overflow-hidden", collapsed ? "w-16" : "w-72")} collapsible="icon">
      <SidebarContent className="pt-32 pb-4 pl-4 h-full overflow-y-auto overflow-x-hidden">
        {navigationGroups.map((group, groupIndex) => (
            <SidebarGroup className="mx-2">
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0">
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.url} className="border-b border-border/30 last:border-b-0">
                      {item.subItems ? (
                        <>
                          <button
                            onClick={() => toggleItem(item.title)}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-muted/50",
                              "text-foreground"
                            )}
                          >
                            {!collapsed && (
                              <>
                                <span className="font-medium">{item.title}</span>
                                {expandedItems[item.title] ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </>
                            )}
                          </button>
                          {!collapsed && expandedItems[item.title] && (
                            <div className="pl-8 space-y-0">
                              {item.subItems.map((subItem) => (
                                <SidebarMenuButton key={subItem.url} asChild>
                                  <Link
                                    to={subItem.url}
                                    className={cn(
                                      "flex items-center px-4 py-2 text-sm border-b border-border/20 last:border-b-0 transition-colors hover:bg-muted/30",
                                      isActivePath(subItem.url)
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    <span className={cn(
                                      isActivePath(subItem.url) && "border-b-2 border-b-blue-700"
                                    )}>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.url}
                            className={cn(
                              "flex items-center px-4 py-3 text-sm transition-colors hover:bg-muted/50",
                              isActivePath(item.url)
                                ? "text-primary"
                                : "text-foreground"
                            )}
                          >
                            {!collapsed && (
                              <span className={cn(
                                "font-medium",
                                isActivePath(item.url) && "border-b-2 border-b-blue-700"
                              )}>{item.title}</span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

export default function MicrosoftAdminLayout({ children }: MicrosoftAdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="h-screen flex flex-col w-full bg-background">
        {/* Top Navigation */}
        <TopNavigation />
        
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Microsoft Admin Sidebar - Collapsible */}
          <MicrosoftAdminSidebar />

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