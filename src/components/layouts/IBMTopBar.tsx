import React, { useState, useEffect, useRef } from 'react';
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

interface SearchResult {
  id: string;
  name: string;
  businessName?: string;
  email?: string;
}

export function IBMTopBar({ onMenuClick, sidebarCollapsed }: IBMTopBarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate('/auth');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchBorrowers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) return;

        const { data, error } = await supabase
          .from('contact_entities')
          .select('id, first_name, last_name, business_name, email')
          .eq('user_id', session.session.user.id)
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,business_name.ilike.%${searchQuery}%`)
          .limit(10);

        if (error) throw error;

        setSearchResults(data?.map(d => {
          const borrowerName = d.first_name && d.last_name 
            ? `${d.first_name} ${d.last_name}`.trim()
            : d.first_name || d.last_name || 'Unknown';
          
          return {
            id: d.id,
            name: d.business_name || borrowerName,
            businessName: d.business_name ? borrowerName : undefined,
            email: d.email || undefined
          };
        }) || []);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(searchBorrowers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    // Navigate to leads page and let it filter by contact_entity_id
    navigate(`/leads?contact=${result.id}`);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <header className="h-24 bg-[#161616] border-b border-[#393939] flex items-center justify-between flex-shrink-0 w-full px-4">
      {/* Left section with hamburger and brand */}
      <div className="flex items-center h-full flex-1" style={{ minWidth: sidebarCollapsed ? '48px' : '240px' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-24 w-12 rounded-none text-white hover:text-white flex-shrink-0 flex items-center justify-center p-0 hover:bg-transparent group transition-all duration-300"
        >
          <div className="p-2 group-hover:outline group-hover:outline-2 group-hover:outline-blue-500 transition-all duration-300 rounded">
            <Grid3x3 className="h-5 w-5" />
          </div>
        </Button>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="h-24 w-10 rounded-none text-white hover:text-white flex-shrink-0 hover:bg-transparent p-0 group transition-all duration-300"
            title="Go back"
          >
            <div className="p-2 group-hover:outline group-hover:outline-2 group-hover:outline-blue-500 transition-all duration-300 rounded">
              <ChevronLeft className="h-5 w-5" />
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.forward()}
            className="h-24 w-10 rounded-none text-white hover:text-white flex-shrink-0 hover:bg-transparent p-0 group transition-all duration-300"
            title="Go forward"
          >
            <div className="p-2 group-hover:outline group-hover:outline-2 group-hover:outline-blue-500 transition-all duration-300 rounded">
              <ChevronRight className="h-5 w-5" />
            </div>
          </Button>
        </div>
        
        {!sidebarCollapsed && (
          <div className="text-white font-medium text-xl px-12 whitespace-nowrap">LoanFlow CRM</div>
        )}
      </div>

      {/* Center search bar */}
      <div className="flex justify-center items-center gap-2">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by the borrower or company name..."
            className="pl-10 h-9 bg-[#262626] border-[#393939] text-white placeholder:text-gray-400 focus:bg-[#393939] rounded-none"
            style={{ width: '420px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#262626] border border-[#393939] rounded-sm shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="px-4 py-3 hover:bg-[#393939] cursor-pointer border-b border-[#393939] last:border-b-0"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="text-white font-medium">{result.name}</div>
                  {result.businessName && (
                    <div className="text-gray-400 text-sm">{result.businessName}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#262626] border border-[#393939] rounded-sm shadow-lg z-50">
              <div className="px-4 py-3 text-gray-400 text-sm">
                No borrowers found matching "{searchQuery}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right section with actions */}
      <div className="flex items-center gap-1 px-6 flex-1 justify-end">
        <LoanCalculator />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:text-white hover:bg-transparent hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all duration-300 rounded"
          onClick={() => window.open('https://outlook.office.com', '_blank')}
          title="Open Microsoft 365 Email"
        >
          <Mail className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:text-white hover:bg-transparent hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all duration-300 rounded"
          onClick={() => window.open('https://app.ringcentral.com', '_blank')}
          title="Open RingCentral Dial Pad"
        >
          <Phone className="h-6 w-6" />
        </Button>

        <NotificationBell />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:text-white hover:bg-transparent hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all duration-300 rounded"
          onClick={() => navigate('/resources')}
        >
          <HelpCircle className="h-6 w-6" />
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-white hover:text-white hover:bg-transparent hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all duration-300 rounded"
            >
              <User className="h-6 w-6" />
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
