import React from 'react';
import { Search, Bell, HelpCircle, Grid3x3, User, ChevronDown } from 'lucide-react';
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

interface IBMTopBarProps {
  onMenuClick: () => void;
}

export function IBMTopBar({ onMenuClick }: IBMTopBarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate('/auth');
  };

  return (
    <header className="h-12 bg-[#161616] border-b border-[#393939] flex items-center px-4 gap-4 flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="h-8 w-8 text-white hover:bg-white/10"
      >
        <Grid3x3 className="h-5 w-5" />
      </Button>

      <div className="text-white font-medium text-sm">LoanFlow CRM</div>

      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources and products..."
            className="w-full pl-10 h-8 bg-[#262626] border-[#393939] text-white placeholder:text-gray-400 focus:bg-[#393939]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-white hover:bg-white/10 text-xs"
        >
          Catalog
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-white hover:bg-white/10 text-xs"
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

        <div className="h-6 w-px bg-[#393939]" />

        <div className="text-white text-xs px-2">Halo Business Finance</div>

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/10"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/10"
            >
              <User className="h-4 w-4" />
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
