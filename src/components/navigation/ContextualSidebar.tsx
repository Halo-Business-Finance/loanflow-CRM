import React from "react"
import { useLocation, Link } from "react-router-dom"
import { 
  Home, Plus, BarChart3, Users, FileText, Settings,
  PieChart, Calendar, CheckSquare, Search, Filter,
  Shield, Key, UserCheck, AlertTriangle, Building,
  Workflow, Brain, Code, Image, BookOpen, Zap,
  Clock, TrendingUp, Database, Target, Award, MoreVertical,
  Lock, Bell
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
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
    <Sidebar className={cn("bg-card/60 backdrop-blur h-full !border-0 group-data-[side=left]:!border-r-0 group-data-[side=right]:!border-l-0", collapsed ? "w-16" : "w-72")} collapsible="icon">
      <SidebarContent className="pt-32 pb-4 h-full">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-sm font-bold text-black px-8 mt-6 mb-2 flex items-center justify-between", collapsed && "sr-only")}>
            <span>{getModuleName(currentModule)}</span>
            {currentModule === "/security" && !collapsed && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Configure
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Security Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      Security Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lock className="mr-2 h-4 w-4" />
                      Access Controls
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      Alert Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Key className="mr-2 h-4 w-4" />
                      Manage Keys
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-6">
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={cn(
                        "flex items-start gap-3 px-3 py-3 text-[11px] rounded-lg transition-all duration-200 font-medium",
                        isActivePath(item.url)
                          ? "text-primary"
                          : "text-foreground hover:text-primary hover:bg-primary/10 hover:shadow-soft"
                      )}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0 mt-1" />
                      {!collapsed && (
                        <span 
                          className={cn(
                            "truncate mt-0.5 transition-all duration-200",
                            isActivePath(item.url) ? "border-b-2 border-primary" : ""
                          )}
                        >
                          {item.title}
                        </span>
                      )}
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