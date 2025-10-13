import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { UserCog, Plus, Search, Filter, Download, Mail, Calendar } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SecureRoleManager } from '@/components/security/SecureRoleManager';

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
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Primary path: invoke via Supabase client (adds auth automatically)
      let { data, error } = await supabase.functions.invoke('admin-get-users', {
        body: { action: 'list_users' },
        headers: { 'Content-Type': 'application/json' },
      });

      // Fallback path: direct fetch to Edge Functions domain if invoke fails (network/env quirks)
      if (error || !data?.users) {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token || '';
        const response = await fetch(
          'https://gshxxsniwytjgcnthyfq.functions.supabase.co/admin-get-users',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaHh4c25pd3l0amdjbnRoeWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODYzMDYsImV4cCI6MjA2OTE2MjMwNn0.KZGdh-f2Z5DrNJ54lv3loaC8wrWvNfhQF7tqQ',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'list_users' }),
          }
        );
        if (!response.ok) {
          throw new Error(`Edge Function HTTP ${response.status}`);
        }
        data = await response.json();
      }

      if (data?.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        throw new Error('No users data returned from edge function');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error loading users',
        description: error?.message || 'Failed to send a request to the Edge Function',
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

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleRoleChanged = () => {
    // Refresh users after role change
    fetchUsers();
    setIsDialogOpen(false);
  };

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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
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

      {/* User Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl w-full max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information and roles
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCog className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {selectedUser.first_name && selectedUser.last_name
                          ? `${selectedUser.first_name} ${selectedUser.last_name}`
                          : 'N/A'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {selectedUser.email || 'N/A'}
                      </div>
                    </div>
                    <Badge variant="secondary">{selectedUser.role}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">User ID</p>
                      <p className="text-sm font-mono">{selectedUser.id.slice(0, 8)}...</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Joined Date</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Management */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Role Management</h4>
                  <SecureRoleManager
                    targetUserId={selectedUser.id}
                    targetUserName={
                      selectedUser.first_name && selectedUser.last_name
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : selectedUser.email || 'User'
                    }
                    currentRole={selectedUser.role as any}
                    onRoleChanged={handleRoleChanged}
                  />
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
