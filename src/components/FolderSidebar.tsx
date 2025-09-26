import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { X, Home, Users, Target, BarChart3, FileText, Activity, Building2, User, Shield, Settings, Calendar, Download, RefreshCw, Camera, LayoutDashboard, ChevronDown, ChevronRight, Plus, Eye, Edit, Trash, CheckCircle, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface FolderSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeFolder: string | null
}

interface MenuItem {
  name: string
  path?: string
  icon: any
  children?: MenuItem[]
}

const folderMenuItems: Record<string, MenuItem[]> = {
  home: [
    { name: "Dashboard", path: "/", icon: Home },
  ],
  leads: [
    { 
      name: "Lead Management", 
      icon: Users,
      children: [
        { name: "All Leads", path: "/leads", icon: Users },
        { name: "New Lead", path: "/leads/new", icon: Plus },
        { name: "Lead Stats", path: "/leads/stats", icon: BarChart3 },
        { name: "Lead Assignment", path: "/leads/assignment", icon: Target },
      ]
    },
    { 
      name: "Lead Operations", 
      icon: Settings,
      children: [
        { name: "View All Leads", path: "/leads", icon: Eye },
        { name: "Lead Statistics", path: "/leads/stats", icon: BarChart3 },
        { name: "Assignment", path: "/leads/assignment", icon: Target },
      ]
    },
  ],
  borrowers: [
    { 
      name: "Borrower Management", 
      icon: Building2,
      children: [
        { name: "All Borrowers", path: "/existing-borrowers", icon: Building2 },
        { name: "Borrower Details", path: "/existing-borrowers/details", icon: User },
        { name: "Loan History", path: "/existing-borrowers/history", icon: FileText },
      ]
    },
    { 
      name: "Loan Processing", 
      icon: FileText,
      children: [
        { name: "View All Borrowers", path: "/existing-borrowers", icon: Building2 },
        { name: "Borrower Details", path: "/existing-borrowers/details", icon: User },
        { name: "Loan History", path: "/existing-borrowers/history", icon: FileText },
      ]
    },
  ],
  pipeline: [
    { 
      name: "Pipeline Overview", 
      icon: Target,
      children: [
        { name: "Pipeline View", path: "/pipeline", icon: Target },
        { name: "Pipeline Analytics", path: "/pipeline/analytics", icon: BarChart3 },
        { name: "Stage Management", path: "/pipeline/stages", icon: Settings },
      ]
    },
    { 
      name: "Pipeline Tools", 
      icon: Settings,
      children: [
        { name: "Pipeline View", path: "/pipeline", icon: Target },
        { name: "Analytics", path: "/pipeline/analytics", icon: BarChart3 },
        { name: "Stage Management", path: "/pipeline/stages", icon: Settings },
      ]
    },
  ],
  underwriter: [
    { 
      name: "Underwriter Dashboard", 
      icon: Shield,
      children: [
        { name: "Dashboard", path: "/underwriter", icon: Shield },
        { name: "Document Review", path: "/underwriter/documents", icon: FileText },
        { name: "Risk Assessment", path: "/underwriter/risk", icon: Activity },
      ]
    },
    { 
      name: "Document Management", 
      icon: FileText,
      children: [
        { name: "Document Review", path: "/underwriter/documents", icon: FileText },
        { name: "Risk Assessment", path: "/underwriter/risk", icon: Activity },
        { name: "Underwriter Dashboard", path: "/underwriter", icon: Shield },
      ]
    },
  ],
  activities: [
    { 
      name: "Activity Management", 
      icon: Activity,
      children: [
        { name: "All Activities", path: "/activities", icon: Activity },
        { name: "Calendar", path: "/activities/calendar", icon: Calendar },
        { name: "Tasks", path: "/activities/tasks", icon: FileText },
      ]
    },
    { 
      name: "Scheduling", 
      icon: Calendar,
      children: [
        { name: "All Activities", path: "/activities", icon: Activity },
        { name: "Calendar View", path: "/activities/calendar", icon: Calendar },
        { name: "Task Management", path: "/activities/tasks", icon: FileText },
      ]
    },
  ],
  security: [
    { 
      name: "Security Monitoring", 
      icon: Shield,
      children: [
        { name: "Security Dashboard", path: "/security", icon: Shield },
        { name: "Threat Detection", path: "/security/threats", icon: Activity },
        { name: "Access Management", path: "/security/access", icon: User },
      ]
    },
    { 
      name: "Compliance & Audit", 
      icon: FileText,
      children: [
        { name: "Audit Logs", path: "/security/audit", icon: FileText },
        { name: "Compliance", path: "/security/compliance", icon: Settings },
        { name: "System Config", path: "/settings/system", icon: Settings },
      ]
    },
  ],
  enterprise: [
    { 
      name: "Enterprise Management", 
      icon: Building2,
      children: [
        { name: "Overview", path: "/enterprise", icon: Building2 },
        { name: "Reports", path: "/reports", icon: BarChart3 },
        { name: "User Management", path: "/settings/users", icon: User },
      ]
    },
    { 
      name: "System Integration", 
      icon: RefreshCw,
      children: [
        { name: "Integrations", path: "/integrations", icon: RefreshCw },
        { name: "AI Tools", path: "/ai-tools", icon: Settings },
        { name: "API Docs", path: "/api-docs", icon: FileText },
      ]
    },
    { 
      name: "Development Tools", 
      icon: Settings,
      children: [
        { name: "Screenshots", path: "/screenshots", icon: Camera },
        { name: "Resources", path: "/resources", icon: FileText },
        { name: "Custom Objects", path: "/enterprise#custom-objects", icon: Home },
      ]
    },
    { 
      name: "Workflow Management", 
      icon: Target,
      children: [
        { name: "Workflow Builder", path: "/enterprise#workflows", icon: RefreshCw },
        { name: "Approval Processes", path: "/enterprise#approvals", icon: Calendar },
        { name: "Territory Management", path: "/enterprise#territories", icon: Target },
        { name: "Sales Forecasting", path: "/enterprise#forecasting", icon: BarChart3 },
        { name: "Opportunity Splits", path: "/enterprise#opportunities", icon: Download },
      ]
    },
  ]
}

export function FolderSidebar({ isOpen, onClose, activeFolder }: FolderSidebarProps) {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const menuItems = activeFolder ? folderMenuItems[activeFolder as keyof typeof folderMenuItems] || [] : []

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  const handleItemClick = () => {
    onClose()
  }

  const toggleExpanded = (itemName: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName)
    } else {
      newExpanded.add(itemName)
    }
    setExpandedItems(newExpanded)
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.name)
    const paddingLeft = `${(level * 16) + 16}px`

    if (hasChildren) {
      return (
        <Collapsible 
          key={item.name} 
          open={isExpanded} 
          onOpenChange={() => toggleExpanded(item.name)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-left text-xs font-medium rounded-lg transition-all duration-200 mb-1",
                level === 0 ? "text-foreground hover:bg-muted hover:text-blue-600" : "text-muted-foreground hover:bg-muted/50"
              )}
              style={{ paddingLeft }}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="flex-1">{item.name}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    // Leaf item with link
    return (
      <Link
        key={item.name}
        to={item.path || '#'}
        onClick={handleItemClick}
        className={cn(
          "flex items-center w-full py-2.5 text-xs font-medium rounded-lg transition-all duration-200 mb-1",
          isActivePath(item.path || '')
            ? "bg-blue-600 text-white shadow-lg"
            : level === 0 
              ? "text-foreground hover:bg-muted hover:text-blue-600" 
              : "text-muted-foreground hover:bg-muted/50 hover:text-blue-600"
        )}
        style={{ paddingLeft }}
      >
        <item.icon className="h-4 w-4 mr-3" />
        <span>{item.name}</span>
      </Link>
    )
  }

  if (!isOpen || !activeFolder) return null

  return (
    <div className="w-80 bg-background border-r border-border shadow-lg sticky top-0 h-screen overflow-hidden flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-600 to-blue-700 flex-shrink-0">
        <h2 className="text-sm font-semibold text-white capitalize">
          {activeFolder} Menu
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Menu Items - Scrollable */}
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => renderMenuItem(item))}
      </div>
    </div>
  )
}