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
    ]
  }
]

// Microsoft Admin Sidebar Component
function MicrosoftAdminSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const collapsed = state === "collapsed"

  const isActivePath = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <Sidebar className={cn("bg-card/60 backdrop-blur border-r", collapsed ? "w-16" : "w-72")} collapsible="icon">
      <SidebarContent className="pt-20 pb-4 h-full">
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2", collapsed && "sr-only")}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2.5 text-xs rounded-lg transition-all duration-200 group",
                          isActivePath(item.url)
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-foreground hover:bg-muted/60 hover:text-primary"
                        )}
                      >
                        <item.icon 
                          className={cn(
                            "h-4 w-4 flex-shrink-0 mt-0.5",
                            isActivePath(item.url) ? "text-primary" : "text-muted-foreground"
                          )} 
                        />
                        {!collapsed && (
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "text-xs font-medium",
                              isActivePath(item.url) ? "text-primary" : "text-foreground"
                            )}>
                              {item.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </div>
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
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