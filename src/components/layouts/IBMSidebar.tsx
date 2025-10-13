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
  BarChart3,
  Building2,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IBMSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItemData {
  icon: React.ElementType;
  label: string;
  to: string;
}

interface NavItemProps extends NavItemData {
  collapsed: boolean;
}

const navItems: NavItemData[] = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Users, label: 'Leads', to: '/leads' },
  { icon: GitBranch, label: 'Pipeline', to: '/pipeline' },
  { icon: Briefcase, label: 'Existing Borrowers', to: '/existing-borrowers' },
  { icon: Activity, label: 'Activities', to: '/activities' },
  { icon: FileText, label: 'Documents', to: '/documents' },
  { icon: BarChart3, label: 'Reports', to: '/reports' },
  { icon: UserCog, label: 'User Directory', to: '/user-directory' },
  { icon: Building2, label: 'Enterprise', to: '/enterprise' },
  { icon: Shield, label: 'Security', to: '/security' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

function NavItem({ icon: Icon, label, to, collapsed }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <NavLink
      to={to}
      className={cn(
        'flex items-center h-8 px-3 text-sm transition-colors relative group',
        isActive
          ? 'bg-[#e0e0e0] text-[#161616] font-medium'
          : 'text-[#525252] hover:bg-[#e0e0e0] hover:text-[#161616]'
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0f62fe]" />
      )}
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="ml-3 truncate">{label}</span>}
    </NavLink>
  );
}

export function IBMSidebar({ collapsed }: IBMSidebarProps) {
  return (
    <aside
      className={cn(
        'bg-[#f4f4f4] border-r border-[#e0e0e0] flex-shrink-0 transition-all duration-300 overflow-y-auto',
        collapsed ? 'w-12' : 'w-60'
      )}
    >
      <nav className="py-2 space-y-0.5">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
