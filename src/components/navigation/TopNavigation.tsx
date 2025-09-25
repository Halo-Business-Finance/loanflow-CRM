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
    <header className="bg-blue-900 sticky top-0 z-40 shadow-medium">
      {/* Primary Header */}
      <div className="flex h-20 items-center px-8 gap-6 relative">
        {/* Logo and Navigation Controls */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center">
            <BrandLogo size={48} showText={true} className="[&>span]:text-white" />
          </Link>
          
          {/* Sidebar Toggle */}
          <SidebarTrigger className="h-8 w-8 [&>svg]:h-4 [&>svg]:w-4 text-white hover:bg-blue-700" />
          
          {/* Navigation Controls */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-blue-700" 
            onClick={() => window.history.back()}
            title="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-blue-700" 
            onClick={() => window.history.forward()}
            title="Go forward"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Centered Search Bar */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <form onSubmit={handleSearch} className="w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200" />
              <Input
                placeholder="Search for Borrower or Company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-blue-800/50 border-blue-700 focus-visible:bg-blue-800 h-10 w-full text-white placeholder:text-blue-200"
              />
            </div>
          </form>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 relative text-white hover:bg-blue-800"
            onClick={() => navigate('/activities')}
            title="Activities & Notifications"
          >
            <Bell className="h-4 w-4" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
              3
            </Badge>
          </Button>

          {/* Help */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-white hover:bg-blue-800"
            onClick={() => navigate('/resources')}
            title="Help & Resources"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 gap-2 font-medium text-white hover:bg-blue-800">
                <div className="h-7 w-7 rounded-full bg-white text-blue-900 flex items-center justify-center text-sm font-semibold">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:inline text-white">
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

    </header>
  )
}