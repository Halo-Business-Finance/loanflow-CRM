import React, { useState } from "react"
import { useLocation, useNavigate, Link } from "react-router-dom"
import { Search, Bell, Settings, LogOut, User, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { BrandLogo } from "@/components/BrandLogo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"
import { cn } from "@/lib/utils"

// Main navigation modules
const mainModules = [
  { name: "Home", path: "/", exact: true },
  { name: "Leads", path: "/leads" },
  { name: "Borrowers", path: "/existing-borrowers" },
  { name: "Pipeline", path: "/pipeline" },
  { name: "Underwriter", path: "/underwriter" },
  { name: "Activities", path: "/activities" },
  { name: "Reports", path: "/reports" },
  { name: "Security", path: "/security" },
  { name: "Enterprise", path: "/enterprise" }
]

export function TopNavigation() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email?.split('@')[0] || 'User'
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActiveModule = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement global search functionality
      console.log('Searching for:', searchQuery)
    }
  }

  return (
    <header className="border-b bg-card/95 sticky top-0 z-40 shadow-medium">
      {/* Primary Header */}
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <BrandLogo size={32} showText={true} />
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Global Search - Centered */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search across all modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/30 border-input-border focus-visible:bg-card h-10 w-full"
            />
          </div>
        </form>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 gap-2 font-medium">
                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:inline text-foreground">
                  {getUserDisplayName()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-card border shadow-large">
              <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings/system')}>
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Secondary Navigation - Module Tabs */}
      <div className="border-t bg-muted/20">
        <nav className="flex items-center px-6 overflow-x-auto scrollbar-hide">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2 mr-4">
            <SidebarTrigger className="h-12 w-12 [&>svg]:h-6 [&>svg]:w-6" />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => window.history.back()}
              title="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => window.history.forward()}
              title="Go forward"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {mainModules.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              className={cn(
                "flex items-center px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-200",
                isActiveModule(module.path, module.exact)
                  ? "border-primary text-black font-bold" 
                  : "border-transparent text-black hover:text-black hover:bg-muted/40 hover:border-muted-foreground/30"
              )}
            >
              {module.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}