import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Activity,
  FileText,
  Settings,
  Shield,
  Database,
  Server,
  Briefcase,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Building2,
  UserCog,
  CheckSquare,
  Link2,
  Sparkles,
  BookOpen,
  Code,
  Camera,
  Layers,
  TrendingUp,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IBMSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItemData {
  icon: React.ElementType;
  label: string;
  to?: string;
  subItems?: NavItemData[];
}

interface NavItemProps extends NavItemData {
  collapsed: boolean;
}

const navItems: NavItemData[] = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { 
    icon: Users, 
    label: 'Leads', 
    to: '/leads',
    subItems: [
      { icon: Users, label: 'All Leads', to: '/leads' },
      { icon: Users, label: 'Create New Lead', to: '/leads/new' },
      { icon: BarChart3, label: 'Lead Stats', to: '/leads/stats' },
      { icon: UserCog, label: 'Lead Assignment', to: '/leads/assignment' },
    ]
  },
  { 
    icon: GitBranch, 
    label: 'Pipeline', 
    to: '/pipeline',
    subItems: [
      { icon: GitBranch, label: 'Pipeline Management', to: '/pipeline' },
      { icon: TrendingUp, label: 'Pipeline Analytics', to: '/pipeline/analytics' },
    ]
  },
  { icon: Briefcase, label: 'Existing Borrowers', to: '/existing-borrowers' },
  { 
    icon: CheckSquare, 
    label: 'Underwriter', 
    to: '/underwriter',
    subItems: [
      { icon: LayoutDashboard, label: 'Underwriter Dashboard', to: '/underwriter' },
      { icon: FileCheck, label: 'Document Review', to: '/underwriter/documents' },
      { icon: AlertTriangle, label: 'Risk Assessment', to: '/underwriter/risk' },
    ]
  },
  { icon: Activity, label: 'Activities', to: '/activities' },
  { 
    icon: FileText, 
    label: 'Documents', 
    to: '/documents',
    subItems: [
      { icon: FileText, label: 'All Documents', to: '/documents' },
      { icon: FileText, label: 'Upload Document', to: '/documents/upload' },
      { icon: FileText, label: 'Document Templates', to: '/documents/templates' },
    ]
  },
  { icon: BarChart3, label: 'Reports', to: '/reports' },
  { icon: UserCog, label: 'User Directory', to: '/user-directory' },
  { 
    icon: Building2, 
    label: 'Enterprise', 
    to: '/enterprise',
    subItems: [
      { icon: Building2, label: 'Enterprise Command Center', to: '/enterprise' },
      { icon: Link2, label: 'Integrations', to: '/integrations' },
      { icon: Sparkles, label: 'AI Tools', to: '/ai-tools' },
      { icon: BookOpen, label: 'Resources', to: '/resources' },
      { icon: Code, label: 'API Docs', to: '/api-docs' },
      { icon: Camera, label: 'Screenshots', to: '/screenshots' },
      { icon: Layers, label: 'Stage Management', to: '/pipeline/stages' },
    ]
  },
  { icon: Shield, label: 'Security', to: '/security' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

function NavItem({ icon: Icon, label, to, collapsed, subItems }: NavItemProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = to ? (location.pathname === to || location.pathname.startsWith(to + '/')) : false;
  const hasActiveSubItem = subItems?.some(item => 
    item.to && (location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
  );

  const handleClick = (e: React.MouseEvent) => {
    if (subItems && subItems.length > 0) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  if (subItems && subItems.length > 0) {
    return (
      <div>
        <div
          onClick={handleClick}
          className={cn(
            'flex items-center h-12 text-sm transition-colors relative group cursor-pointer',
            collapsed ? 'justify-center w-12 px-0' : 'pl-0 pr-4',
            (isActive || hasActiveSubItem)
              ? 'bg-[#e0e0e0] text-[#161616] font-medium'
              : 'text-[#525252] hover:bg-[#e0e0e0] hover:text-[#161616]'
          )}
        >
          {(isActive || hasActiveSubItem) && !collapsed && (
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0f62fe]" />
          )}
          <div className="w-12 flex items-center justify-center">
            <Icon className="h-4 w-4 flex-shrink-0 text-[#003f88]" />
          </div>
          {!collapsed && (
            <>
              <span className="truncate flex-1">{label}</span>
              {isOpen ? (
                <ChevronDown className="h-3 w-3 ml-auto" />
              ) : (
                <ChevronRight className="h-3 w-3 ml-auto" />
              )}
            </>
          )}
        </div>
        {!collapsed && isOpen && (
          <div className="ml-4 border-l border-[#e0e0e0]">
            {subItems.map((subItem) => (
              <NavLink
                key={subItem.to}
                to={subItem.to!}
                className={cn(
                  'flex items-center h-8 text-sm transition-colors relative pl-4',
                  location.pathname === subItem.to || location.pathname.startsWith(subItem.to! + '/')
                    ? 'bg-[#f4f4f4] text-[#161616] font-medium'
                    : 'text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]'
                )}
              >
                <subItem.icon className="h-3 w-3 flex-shrink-0 mr-2 text-[#003f88]" />
                <span className="truncate text-xs">{subItem.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={to!}
      className={cn(
        'flex items-center h-12 text-sm transition-colors relative group',
        collapsed ? 'justify-center w-12 px-0' : 'pl-0 pr-4',
        isActive
          ? 'bg-[#e0e0e0] text-[#161616] font-medium'
          : 'text-[#525252] hover:bg-[#e0e0e0] hover:text-[#161616]'
      )}
    >
      {isActive && !collapsed && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0f62fe]" />
      )}
      <div className="w-12 flex items-center justify-center">
        <Icon className="h-4 w-4 flex-shrink-0 text-[#003f88]" />
      </div>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export function IBMSidebar({ collapsed }: IBMSidebarProps) {
  return (
    <aside
      className={cn(
        'bg-[#f4f4f4] border-r border-[#e0e0e0] flex-shrink-0 transition-all duration-300 overflow-y-auto no-scrollbar pl-4',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <nav className="space-y-0.5 pt-4">
        {navItems.map((item) => (
          <NavItem key={item.to || item.label} {...item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
