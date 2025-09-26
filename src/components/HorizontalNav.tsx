import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
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
  Download,
  RefreshCw,
  Camera,
  Shield,
  LayoutDashboard
} from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { ThemeToggle } from "@/components/ThemeToggle"

const homeItems = [
  { name: "Dashboard", path: "/", icon: Home },
]

const leadsItems = [
  { name: "All Leads", path: "/leads", icon: Users },
  { name: "New Lead", path: "/leads/new", icon: User },
  { name: "Lead Stats", path: "/leads/stats", icon: BarChart3 },
  { name: "Lead Assignment", path: "/leads/assignment", icon: Target },
]

const borrowersItems = [
  { name: "All Borrowers", path: "/existing-borrowers", icon: Building2 },
  { name: "Borrower Details", path: "/existing-borrowers/details", icon: User },
  { name: "Loan History", path: "/existing-borrowers/history", icon: FileText },
]

const pipelineItems = [
  { name: "Pipeline View", path: "/pipeline", icon: Target },
  { name: "Pipeline Analytics", path: "/pipeline/analytics", icon: BarChart3 },
  { name: "Stage Management", path: "/pipeline/stages", icon: Settings },
]

const underwriterItems = [
  { name: "Underwriter Dashboard", path: "/underwriter", icon: Shield },
  { name: "Documents", path: "/documents", icon: FileText },
  { name: "Document Review", path: "/underwriter/documents", icon: FileText },
  { name: "Risk Assessment", path: "/underwriter/risk", icon: Activity },
]

const activitiesItems = [
  { name: "All Activities", path: "/activities", icon: Activity },
  { name: "Calendar", path: "/activities/calendar", icon: Calendar },
  { name: "Tasks", path: "/activities/tasks", icon: FileText },
]

const securityItems = [
  { name: "Security Dashboard", path: "/security", icon: Shield },
  { name: "Access Management", path: "/security/access", icon: User },
  { name: "Audit Logs", path: "/security/audit", icon: FileText },
  { name: "Threat Detection", path: "/security/threats", icon: Activity },
  { name: "Compliance", path: "/security/compliance", icon: Settings },
  { name: "System Config", path: "/settings/system", icon: Settings },
]

const enterpriseItems = [
  { name: "Overview", path: "/enterprise", icon: Building2 },
  { name: "Reports", path: "/reports", icon: BarChart3 },
  { name: "User Management", path: "/settings/users", icon: User },
  { name: "Integrations", path: "/integrations", icon: RefreshCw },
  { name: "AI Tools", path: "/ai-tools", icon: Settings },
  { name: "API Docs", path: "/api-docs", icon: FileText },
  { name: "Screenshots", path: "/screenshots", icon: Camera },
  { name: "Resources", path: "/resources", icon: FileText },
]

interface HorizontalNavProps {
  onFolderClick?: (folderName: string) => void
  sidebarOpen?: boolean
  activeFolder?: string | null
}

export function HorizontalNav({ onFolderClick, sidebarOpen = false, activeFolder = null }: HorizontalNavProps = {}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [localSidebarOpen, setLocalSidebarOpen] = useState(false)
  const [localActiveFolder, setLocalActiveFolder] = useState<string | null>(null)

  // Use local state if no props are provided (backward compatibility)
  const isControlled = onFolderClick !== undefined
  const currentSidebarOpen = isControlled ? sidebarOpen : localSidebarOpen
  const currentActiveFolder = isControlled ? activeFolder : localActiveFolder

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const getUserDisplayName = () => {
    const firstName = user?.user_metadata?.first_name
    const emailName = user?.email?.split('@')[0]
    const name = firstName || emailName || 'User'
    return capitalizeFirstLetter(name)
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

  const handleFolderClick = (folderName: string) => {
    if (isControlled && onFolderClick) {
      onFolderClick(folderName)
    } else {
      setLocalActiveFolder(folderName)
      setLocalSidebarOpen(true)
    }
  }

  return (
    <div className="bg-royal-blue shadow-sm sticky top-0 z-50">
      {/* Microsoft-style Top Header */}
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - App Logo & Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white rounded-sm flex items-center justify-center">
                <div className="h-6 w-6 bg-primary rounded-sm"></div>
              </div>
              <h1 className="text-white font-normal text-lg">Halo Business Finance</h1>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
              <Input
                type="text"
                placeholder="Search applications, docs, and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border-white/20 text-white placeholder:text-white/70 rounded-sm text-sm focus:bg-white/20 focus:border-white/40"
              />
            </div>
          </div>

          {/* Right Side - Actions and Profile */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 text-white hover:bg-white/10"
              onClick={() => navigate('/activities')}
              title="Activities & Notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 w-9 p-0 text-white hover:bg-white/10"
              onClick={() => navigate('/resources')}
              title="Help & Resources"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
            
            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-white hover:bg-white/10">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm">Theme</span>
                    <ThemeToggle />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0 text-white hover:bg-white/10">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs bg-white text-primary">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="font-medium text-sm">{getUserDisplayName()}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Microsoft-style Secondary Navigation */}
      <div className="bg-white border-b border-border px-6">
        <nav className="flex items-center space-x-1">
          {/* Dashboard */}
          <Button 
            asChild
            variant="ghost" 
            className={`relative px-4 py-3 text-sm font-normal text-foreground hover:bg-muted/50 border-b-2 transition-colors ${
              isActivePath("/")
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent hover:border-muted'
            }`}
          >
            <Link to="/" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>

          {/* Leads */}
          <Button 
            variant="ghost" 
            onClick={() => handleFolderClick('leads')}
            className={`relative px-4 py-3 text-sm font-normal text-foreground hover:bg-muted/50 border-b-2 transition-colors ${
              leadsItems.some(item => isActivePath(item.path))
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent hover:border-muted'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            <span>Leads</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>

          {/* Borrowers */}
          <Button 
            variant="ghost" 
            onClick={() => handleFolderClick('borrowers')}
            className={`relative px-4 py-3 text-sm font-normal text-foreground hover:bg-muted/50 border-b-2 transition-colors ${
              borrowersItems.some(item => isActivePath(item.path))
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent hover:border-muted'
            }`}
          >
            <Building2 className="h-4 w-4 mr-2" />
            <span>Borrowers</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>

          {/* Pipeline */}
          <Button 
            variant="ghost" 
            onClick={() => handleFolderClick('pipeline')}
            className={`relative px-4 py-3 text-sm font-normal text-foreground hover:bg-muted/50 border-b-2 transition-colors ${
              pipelineItems.some(item => isActivePath(item.path))
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent hover:border-muted'
            }`}
          >
            <Target className="h-4 w-4 mr-2" />
            <span>Pipeline</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>

          {/* Underwriter */}
          <Button 
            variant="ghost" 
            onClick={() => handleFolderClick('underwriter')}
            className={`relative px-4 py-3 text-sm font-normal text-foreground hover:bg-muted/50 border-b-2 transition-colors ${
              underwriterItems.some(item => isActivePath(item.path))
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent hover:border-muted'
            }`}
          >
            <Shield className="h-4 w-4 mr-2" />
            <span>Underwriter</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>

          {/* Activities */}
          <Button 
            variant="ghost" 
            onClick={() => handleFolderClick('activities')}
            className={`relative px-4 py-3 text-sm font-normal text-foreground hover:bg-muted/50 border-b-2 transition-colors ${
              activitiesItems.some(item => isActivePath(item.path))
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent hover:border-muted'
            }`}
          >
            <Activity className="h-4 w-4 mr-2" />
            <span>Activities</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>

          {/* Security */}
          <Button 
            variant="ghost" 
            onClick={() => handleFolderClick('security')}
            className={`relative px-4 py-3 text-sm font-normal text-foreground hover:bg-muted/50 border-b-2 transition-colors ${
              securityItems.some(item => isActivePath(item.path))
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent hover:border-muted'
            }`}
          >
            <Shield className="h-4 w-4 mr-2" />
            <span>Security</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>

          {/* Enterprise */}
          <Button 
            variant="ghost" 
            onClick={() => handleFolderClick('enterprise')}
            className={`relative px-4 py-3 text-sm font-normal text-foreground hover:bg-muted/50 border-b-2 transition-colors ${
              enterpriseItems.some(item => isActivePath(item.path.split('#')[0]))
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent hover:border-muted'
            }`}
          >
            <Building2 className="h-4 w-4 mr-2" />
            <span>Enterprise</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </nav>
      </div>
    </div>
  )
}