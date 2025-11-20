import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Users,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPhoneNumber } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Lender {
  id: string;
  name: string;
  lender_type: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  user_id: string;
  contact_count?: number;
}

export default function Lenders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLenders, setSelectedLenders] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchLenders();
    }
  }, [user]);

  const fetchLenders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lenders')
        .select('*')
        .order('name');

      if (error) throw error;

      // Fetch contact counts separately
      const lendersWithCount = await Promise.all(
        (data || []).map(async (lender) => {
          const { count } = await supabase
            .from('lender_contacts')
            .select('*', { count: 'exact', head: true })
            .eq('lender_id', lender.id);
          
          return {
            ...lender,
            contact_count: count || 0
          };
        })
      );

      setLenders(lendersWithCount);
    } catch (error) {
      console.error('Error fetching lenders:', error);
      toast({
        title: "Error",
        description: "Failed to load lenders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLenders(filteredLenders.map(l => l.id));
    } else {
      setSelectedLenders([]);
    }
  };

  const handleSelectLender = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLenders([...selectedLenders, id]);
    } else {
      setSelectedLenders(selectedLenders.filter(lid => lid !== id));
    }
  };

  const filteredLenders = lenders.filter(lender =>
    lender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lender.lender_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lender.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lender.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLenders = lenders.length;
  const activeLenders = lenders.filter(l => l.is_active).length;
  const inactiveLenders = lenders.filter(l => !l.is_active).length;
  const totalContacts = lenders.reduce((sum, l) => sum + (l.contact_count || 0), 0);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <IBMPageHeader
        title="Banks & Lenders"
        subtitle="Manage your lending partners and their contacts"
        actions={
          <Button onClick={() => navigate('/lenders/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lender
          </Button>
        }
      />
      
      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Total Lenders</div>
              <div className="text-3xl font-bold text-primary">{totalLenders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Active Lenders</div>
              <div className="text-3xl font-bold text-primary">{activeLenders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Inactive Lenders</div>
              <div className="text-3xl font-bold text-primary">{inactiveLenders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-2">Total Contacts</div>
              <div className="text-3xl font-bold text-primary">{totalContacts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar with Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lenders by name, type, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="default" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lenders Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLenders.length === filteredLenders.length && filteredLenders.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="uppercase text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      Lender Name
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="uppercase text-xs font-semibold">Contact Information</TableHead>
                  <TableHead className="uppercase text-xs font-semibold">Lender Type</TableHead>
                  <TableHead className="uppercase text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="uppercase text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      Created
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLenders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No lenders found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first lender'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLenders.map((lender) => (
                    <TableRow
                      key={lender.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/lenders/${lender.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedLenders.includes(lender.id)}
                          onCheckedChange={(checked) => handleSelectLender(lender.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lender.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {lender.contact_count || 0} contacts
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lender.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{formatPhoneNumber(lender.phone)}</span>
                            </div>
                          )}
                          {lender.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[200px]">{lender.email}</span>
                            </div>
                          )}
                          {lender.city && lender.state && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{lender.city}, {lender.state}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {lender.lender_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lender.is_active ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                            <span className="text-sm">Inactive</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(lender.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                          <div className="text-xs text-muted-foreground">
                            {new Date(lender.created_at).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
