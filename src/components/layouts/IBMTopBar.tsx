import React from 'react';
import { Search, HelpCircle, Grid3x3, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationBell } from '@/components/NotificationBell';

interface IBMTopBarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export function IBMTopBar({ onMenuClick, sidebarCollapsed }: IBMTopBarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate('/auth');
  };

  return (
    <header className="h-14 bg-[#161616] border-b border-[#393939] flex items-center justify-between flex-shrink-0 w-full">
      {/* Left section with hamburger and brand */}
      <div className="flex items-center h-full flex-1" style={{ minWidth: sidebarCollapsed ? '48px' : '240px' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-14 w-12 rounded-none text-white hover:bg-white/10 flex-shrink-0"
        >
          {sidebarCollapsed ? <Grid3x3 className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
        </Button>
        {!sidebarCollapsed && (
          <div className="text-white font-medium text-lg px-4 whitespace-nowrap">LoanFlow CRM</div>
        )}
      </div>

      {/* Center search bar */}
      <div className="flex justify-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by the borrower or company name..."
            className="pl-10 h-9 bg-[#262626] border-[#393939] text-white placeholder:text-gray-400 focus:bg-[#393939] rounded-none"
            style={{ width: '420px' }}
          />
        </div>
      </div>

      {/* Right section with actions */}
      <div className="flex items-center gap-1 px-4 flex-1 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-white hover:bg-white/10 text-sm px-3"
            >
              Manage <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/security')}>
              Security
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-[#393939] mx-2" />

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-white/10"
          onClick={() => navigate('/resources')}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:bg-white/10"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
