import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Settings,
  ChevronRight,
  ChevronDown,
  Home,
  Users,
  Target,
  BarChart3,
  FileText,
  Activity,
  Building2,
  User,
  LogOut,
  Calendar,
  Shield,
  LayoutDashboard,
  Menu,
  X
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { ThemeToggle } from "@/components/ThemeToggle"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: React.ReactNode
}

interface NavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  name: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
  defaultOpen?: boolean
}

const navigationGroups: NavGroup[] = [
  {
    name: "Home",
    icon: Home,
    items: [
      { name: "Dashboard", path: "/", icon: LayoutDashboard },
    ],
    defaultOpen: true
  },
  {
    name: "Leads",
    icon: Users,
    items: [
      { name: "All Leads", path: "/leads", icon: Users },
      { name: "New Lead", path: "/leads/new", icon: User },
      { name: "Lead Stats", path: "/leads/stats", icon: BarChart3 },
      { name: "Lead Assignment", path: "/leads/assignment", icon: Target },
    ]
  },
  {
    name: "Borrowers",
    icon: Building2,
    items: [
      { name: "All Borrowers", path: "/existing-borrowers", icon: Building2 },
      { name: "Borrower Details", path: "/existing-borrowers/details", icon: User },
      { name: "Loan History", path: "/existing-borrowers/history", icon: FileText },
    ]
  },
  {
    name: "Pipeline",
    icon: Target,
    items: [
      { name: "Pipeline View", path: "/pipeline", icon: Target },
      { name: "Pipeline Analytics", path: "/pipeline/analytics", icon: BarChart3 },
      { name: "Stage Management", path: "/pipeline/stages", icon: Settings },
    ]
  },
  {
    name: "Underwriter",
    icon: Shield,
    items: [
      { name: "Underwriter Dashboard", path: "/underwriter", icon: Shield },
      { name: "Documents", path: "/documents", icon: FileText },
      { name: "Document Review", path: "/underwriter/documents", icon: FileText },
      { name: "Risk Assessment", path: "/underwriter/risk", icon: Activity },
    ]
  },
  {
    name: "Activities",
    icon: Activity,
    items: [
      { name: "All Activities", path: "/activities", icon: Activity },
      { name: "Calendar", path: "/activities/calendar", icon: Calendar },
      { name: "Tasks", path: "/activities/tasks", icon: FileText },
    ]
  },
  {
    name: "Security",
    icon: Shield,
    items: [
      { name: "Security Dashboard", path: "/security", icon: Shield },
      { name: "Access Management", path: "/security/access", icon: User },
      { name: "Audit Logs", path: "/security/audit", icon: FileText },
      { name: "Threat Detection", path: "/security/threats", icon: Activity },
      { name: "Compliance", path: "/security/compliance", icon: Settings },
    ]
  },
  {
    name: "Enterprise",
    icon: Building2,
    items: [
      { name: "Overview", path: "/enterprise", icon: Building2 },
      { name: "Reports", path: "/reports", icon: BarChart3 },
      { name: "User Management", path: "/settings/users", icon: User },
      { name: "Integrations", path: "/integrations", icon: Settings },
      { name: "AI Tools", path: "/ai-tools", icon: Settings },
    ]
  }
]

export default function MicrosoftLayout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    // Initialize with default open groups and currently active group
    const initial: Record<string, boolean> = {}
    navigationGroups.forEach(group => {
      if (group.defaultOpen) {
        initial[group.name] = true
      }
      // Also expand group if it contains the current path
      const hasActivePath = group.items.some(item => 
        item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
      )
      if (hasActivePath) {
        initial[group.name] = true
      }
    })
    return initial
  })

  const getUserDisplayName = () => {
    const firstName = user?.user_metadata?.first_name
    const emailName = user?.email?.split('@')[0]
    const name = firstName || emailName || 'User'
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }))
  }

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-64"

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar - Microsoft Style */}
      <div className={cn("bg-card border-r border-border transition-all duration-300 flex flex-col", sidebarWidth)}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded-sm flex items-center justify-center">
                  <div className="h-6 w-6 bg-white rounded-sm"></div>
                </div>
                <span className="font-semibold text-foreground">Halo Finance</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4">
          {navigationGroups.map((group) => {
            const isExpanded = expandedGroups[group.name]
            const hasActiveItem = group.items.some(item => isActivePath(item.path))
            
            return (
              <div key={group.name} className="mb-2">
                {/* Group Header */}
                <Button
                  variant="ghost"
                  onClick={() => !sidebarCollapsed && toggleGroup(group.name)}
                  className={cn(
                    "w-full justify-start px-4 py-2 h-auto text-left font-normal hover:bg-muted/50",
                    hasActiveItem && "bg-primary/10 text-primary",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  <group.icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1">{group.name}</span>
                      {group.items.length > 1 && (
                        isExpanded ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>

                {/* Group Items */}
                {!sidebarCollapsed && isExpanded && (
                  <div className="ml-4 space-y-1">
                    {group.items.map((item) => (
                      <Button
                        key={item.path}
                        asChild
                        variant="ghost"
                        className={cn(
                          "w-full justify-start px-4 py-2 h-auto text-left font-normal hover:bg-muted/50",
                          isActivePath(item.path) && "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        <Link to={item.path} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{getUserDisplayName()}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              {navigationGroups
                .flatMap(group => group.items)
                .find(item => isActivePath(item.path))?.name || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search across applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus:bg-background"
              />
            </div>

            {/* Actions */}
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
}