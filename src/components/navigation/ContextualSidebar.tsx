import React from "react"
import { useLocation, Link } from "react-router-dom"
import { 
  Home, Plus, BarChart3, Users, FileText, Settings,
  PieChart, Calendar, CheckSquare, Search, Filter,
  Shield, Key, UserCheck, AlertTriangle, Building,
  Workflow, Brain, Code, Image, BookOpen, Zap,
  Clock, TrendingUp, Database, Target, Award
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

// Contextual navigation based on current module
const moduleNavigation = {
  "/": [
    { title: "Overview", url: "/", icon: Home },
    { title: "Quick Actions", url: "/leads/new", icon: Plus },
    { title: "Analytics", url: "/reports", icon: BarChart3 },
  ],
  "/leads": [
    { title: "All Leads", url: "/leads", icon: Users },
    { title: "Add New Lead", url: "/leads/new", icon: Plus },
    { title: "Lead Statistics", url: "/leads/stats", icon: BarChart3 },
    { title: "Lead Assignment", url: "/leads/assignment", icon: UserCheck },
  ],
  "/existing-borrowers": [
    { title: "All Borrowers", url: "/existing-borrowers", icon: Users },
    { title: "Borrower Details", url: "/existing-borrowers/details", icon: FileText },
    { title: "Loan History", url: "/existing-borrowers/history", icon: Clock },
  ],
  "/pipeline": [
    { title: "Pipeline View", url: "/pipeline", icon: TrendingUp },
    { title: "Analytics", url: "/pipeline/analytics", icon: PieChart },
    { title: "Stage Management", url: "/pipeline/stages", icon: Settings },
  ],
  "/underwriter": [
    { title: "Dashboard", url: "/underwriter", icon: Home },
    { title: "Documents", url: "/underwriter/documents", icon: FileText },
    { title: "Risk Assessment", url: "/underwriter/risk", icon: AlertTriangle },
  ],
  "/activities": [
    { title: "Activity Feed", url: "/activities", icon: Home },
    { title: "Calendar", url: "/activities/calendar", icon: Calendar },
    { title: "Tasks", url: "/activities/tasks", icon: CheckSquare },
  ],
  "/reports": [
    { title: "Dashboard", url: "/reports", icon: BarChart3 },
    { title: "Lead Reports", url: "/reports?type=leads", icon: Users },
    { title: "Pipeline Reports", url: "/reports?type=pipeline", icon: TrendingUp },
  ],
  "/security": [
    { title: "Overview", url: "/security", icon: Shield },
    { title: "Access Control", url: "/security/access", icon: Key },
    { title: "Audit Logs", url: "/security/audit", icon: FileText },
    { title: "Threat Detection", url: "/security/threats", icon: AlertTriangle },
    { title: "Compliance", url: "/security/compliance", icon: UserCheck },
  ],
  "/enterprise": [
    { title: "Overview", url: "/enterprise", icon: Building },
    { title: "Integrations", url: "/integrations", icon: Workflow },
    { title: "AI Tools", url: "/ai-tools", icon: Brain },
    { title: "API Docs", url: "/api-docs", icon: Code },
    { title: "Resources", url: "/resources", icon: BookOpen },
  ],
  "/settings": [
    { title: "General", url: "/settings", icon: Settings },
    { title: "Users", url: "/settings/users", icon: Users },
    { title: "System", url: "/settings/system", icon: Database },
  ]
}

export function ContextualSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const collapsed = state === "collapsed"

  // Determine current module based on pathname
  const getCurrentModule = () => {
    const path = location.pathname
    
    // Find the best matching module
    const moduleKeys = Object.keys(moduleNavigation).sort((a, b) => b.length - a.length)
    for (const moduleKey of moduleKeys) {
      if (path === moduleKey || (moduleKey !== "/" && path.startsWith(moduleKey))) {
        return moduleKey
      }
    }
    return "/"
  }

  const currentModule = getCurrentModule()
  const navItems = moduleNavigation[currentModule as keyof typeof moduleNavigation] || []

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  const getModuleName = (moduleKey: string) => {
    const moduleNames = {
      "/": "Dashboard",
      "/leads": "Leads",
      "/existing-borrowers": "Borrowers", 
      "/pipeline": "Pipeline",
      "/underwriter": "Underwriter",
      "/activities": "Activities",
      "/reports": "Reports",
      "/security": "Security",
      "/enterprise": "Enterprise",
      "/settings": "Settings"
    }
    return moduleNames[moduleKey as keyof typeof moduleNames] || "Navigation"
  }

  return (
    <Sidebar className={cn("border-r bg-muted/10", collapsed ? "w-14" : "w-64")} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-xs font-medium text-muted-foreground px-2", collapsed && "sr-only")}>
            {getModuleName(currentModule)}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                        isActivePath(item.url)
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}