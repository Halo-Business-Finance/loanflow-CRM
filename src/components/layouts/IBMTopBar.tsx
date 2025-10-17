import React from 'react';
import { Search, HelpCircle, Grid3x3, User, ChevronDown, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { LoanCalculator } from '@/components/LoanCalculator';

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
    <header className="h-24 bg-[#161616] border-b border-[#393939] flex items-center justify-between flex-shrink-0 w-full px-4">
      {/* Left section with hamburger and brand */}
      <div className="flex items-center h-full flex-1" style={{ minWidth: sidebarCollapsed ? '48px' : '240px' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-24 w-12 rounded-none text-white hover:text-white flex-shrink-0 flex items-center justify-center p-0 hover:bg-transparent hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all duration-300"
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="h-24 w-10 rounded-none text-white hover:text-white flex-shrink-0 hover:bg-transparent hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all duration-300"
            title="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.forward()}
            className="h-24 w-10 rounded-none text-white hover:text-white flex-shrink-0 hover:bg-transparent hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all duration-300"
            title="Go forward"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {!sidebarCollapsed && (
          <div className="text-white font-medium text-lg px-6 whitespace-nowrap">LoanFlow CRM</div>
        )}
      </div>

      {/* Center search bar */}
      <div className="flex justify-center items-center gap-2">
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
      <div className="flex items-center gap-1 px-6 flex-1 justify-end">
        <LoanCalculator />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:text-white hover:bg-transparent rounded"
          onClick={() => window.open('https://outlook.office.com', '_blank')}
          title="Open Microsoft 365 Email"
        >
          <Mail className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:text-white hover:bg-transparent rounded"
          onClick={() => window.open('https://app.ringcentral.com', '_blank')}
          title="Open RingCentral Dial Pad"
        >
          <Phone className="h-5 w-5" />
        </Button>

        <NotificationBell />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:text-white hover:bg-transparent rounded"
          onClick={() => navigate('/resources')}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:text-white hover:bg-transparent rounded"
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
