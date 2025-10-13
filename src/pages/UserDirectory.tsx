import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { UserCog, Plus, Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
}

export default function UserDirectory() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Use the admin edge function to fetch users with roles
      const { data, error } = await supabase.functions.invoke('admin-get-users', {
        method: 'POST'
      });

      if (error) throw error;

      if (data?.users) {
        setUsers(data.users);
      } else {
        throw new Error('No users data returned');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error loading users',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  const totalUsers = users.length;
  const activeUsers = users.length; // All fetched users are considered active
  const pendingInvites = 0; // Would need a separate invites table
  const uniqueRoles = new Set(users.map(u => u.role)).size;
  return (
    <div className="bg-white min-h-full">
      <IBMPageHeader
        title="User Directory Management"
        subtitle="Manage users, roles, and permissions across your organization"
        actions={
          <>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </>
        }
      />

      <div className="px-6 py-6 space-y-6">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#525252]" />
              <Input
                placeholder="Search by name, email, or role..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-[#e0e0e0]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252]">Total Users</CardDescription>
              <CardTitle className="text-2xl text-[#161616]">{totalUsers}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-[#e0e0e0]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252]">Active Users</CardDescription>
              <CardTitle className="text-2xl text-[#161616]">{activeUsers}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-[#e0e0e0]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252]">Pending Invites</CardDescription>
              <CardTitle className="text-2xl text-[#161616]">{pendingInvites}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-[#e0e0e0]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#525252]">Roles</CardDescription>
              <CardTitle className="text-2xl text-[#161616]">{uniqueRoles}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* User Directory Table */}
        <Card className="border-[#e0e0e0]">
          <CardHeader>
            <CardTitle className="text-lg">User Directory</CardTitle>
            <CardDescription className="text-[#525252]">
              Manage all users in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f62fe] mx-auto"></div>
                <p className="text-sm text-[#525252] mt-4">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserCog className="h-12 w-12 text-[#525252] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#161616] mb-2">
                  {searchTerm ? 'No users found' : 'No users yet'}
                </h3>
                <p className="text-sm text-[#525252] mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once they sign up'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
