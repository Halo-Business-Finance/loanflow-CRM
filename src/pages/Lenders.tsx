import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
  const [showForm, setShowForm] = useState(false);
  const [editingLender, setEditingLender] = useState<Lender | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    lender_type: 'bank',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
    is_active: true,
  });

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
        .select(`
          *,
          lender_contacts(count)
        `)
        .order('name');

      if (error) throw error;

      const lendersWithCount = data.map(lender => ({
        ...lender,
        contact_count: lender.lender_contacts?.[0]?.count || 0
      }));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      if (editingLender) {
        const { error } = await supabase
          .from('lenders')
          .update(formData)
          .eq('id', editingLender.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lender updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('lenders')
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Lender created successfully"
        });
      }

      setShowForm(false);
      setEditingLender(null);
      resetForm();
      fetchLenders();
    } catch (error) {
      console.error('Error saving lender:', error);
      toast({
        title: "Error",
        description: "Failed to save lender",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const { error } = await supabase
        .from('lenders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lender deleted successfully"
      });

      fetchLenders();
    } catch (error) {
      console.error('Error deleting lender:', error);
      toast({
        title: "Error",
        description: "Failed to delete lender",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      lender_type: 'bank',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      website: '',
      notes: '',
      is_active: true,
    });
  };

  const openEditForm = (lender: Lender) => {
    setEditingLender(lender);
    setFormData({
      name: lender.name,
      lender_type: lender.lender_type,
      address: lender.address || '',
      city: lender.city || '',
      state: lender.state || '',
      zip_code: lender.zip_code || '',
      phone: lender.phone || '',
      email: lender.email || '',
      website: lender.website || '',
      notes: lender.notes || '',
      is_active: lender.is_active,
    });
    setShowForm(true);
  };

  const filteredLenders = lenders.filter(lender =>
    lender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lender.lender_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lender.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lender.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lenderTypeColors: Record<string, string> = {
    bank: 'bg-blue-500',
    credit_union: 'bg-green-500',
    private_lender: 'bg-purple-500',
    mortgage_company: 'bg-orange-500',
    other: 'bg-gray-500'
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <IBMPageHeader
        title="Banks & Lenders"
        subtitle="Manage your lending partners and their contacts"
        actions={
          <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lender
          </Button>
        }
      />
      
      <div className="p-8 space-y-8">
        {/* Search Bar */}
        <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search lenders by name, type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lenders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLenders.map((lender) => (
          <Card key={lender.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${lenderTypeColors[lender.lender_type] || 'bg-gray-500'}`}>
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{lender.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {lender.lender_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {!lender.is_active && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {lender.city && lender.state && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{lender.city}, {lender.state}</span>
                </div>
              )}
              {lender.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{lender.phone}</span>
                </div>
              )}
              {lender.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{lender.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{lender.contact_count || 0} contacts</span>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/lenders/${lender.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openEditForm(lender)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(lender.id, lender.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLenders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No lenders found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first lender'}
            </p>
            {!searchQuery && (
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lender
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lender Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLender ? 'Edit Lender' : 'Add New Lender'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Lender Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lender_type">Type *</Label>
                <Select
                  value={formData.lender_type}
                  onValueChange={(value) => setFormData({ ...formData, lender_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="credit_union">Credit Union</SelectItem>
                    <SelectItem value="private_lender">Private Lender</SelectItem>
                    <SelectItem value="mortgage_company">Mortgage Company</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  maxLength={2}
                />
              </div>

              <div>
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingLender ? 'Update' : 'Create'} Lender
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
