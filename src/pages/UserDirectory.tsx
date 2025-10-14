import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IBMPageHeader } from '@/components/ui/IBMPageHeader';
import { UserCog, Plus, Search, Filter, Mail, Calendar, Phone, Edit, Trash2, X, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SecureRoleManager } from '@/components/security/SecureRoleManager';
import { formatPhoneNumber } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  role: string | null;
  created_at: string;
  user_number?: number | null;
  is_active?: boolean;
}

const userEditSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  phoneNumber: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number').optional().or(z.literal('')),
  isActive: z.boolean(),
});

const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  phoneNumber: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number').optional().or(z.literal('')),
  role: z.string().min(1, 'Role is required'),
  isActive: z.boolean(),
});

export default function UserDirectory() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'deactivate' | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof userEditSchema>>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      isActive: true,
    },
  });

  const createForm = useForm<z.infer<typeof userCreateSchema>>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'agent',
      isActive: true,
    },
  });

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
      user.phone_number?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
    setIsEditing(false);
    
    // Reset form with user data
    form.reset({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      phoneNumber: user.phone_number || '',
      isActive: user.is_active ?? true,
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && selectedUser) {
      // Reset form when starting to edit
      form.reset({
        firstName: selectedUser.first_name || '',
        lastName: selectedUser.last_name || '',
        phoneNumber: selectedUser.phone_number || '',
        isActive: selectedUser.is_active ?? true,
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof userEditSchema>) => {
    if (!selectedUser) return;

    try {
      setIsSaving(true);
      
      const { data, error } = await supabase.functions.invoke('admin-update-user', {
        body: {
          userId: selectedUser.id,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phoneNumber || null,
          isActive: values.isActive,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User details updated successfully',
      });

      setIsEditing(false);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update user details',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChanged = () => {
    // Refresh users after role change
    fetchUsers();
    setIsDialogOpen(false);
  };

  const onCreateUser = async (values: z.infer<typeof userCreateSchema>) => {
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phoneNumber || null,
          role: values.role,
          isActive: values.isActive,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User created successfully',
      });

      setIsAddUserOpen(false);
      createForm.reset();
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsDeleting(true);
      
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: {
          userId: selectedUser.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkAction = (action: 'delete' | 'deactivate') => {
    if (selectedUserIds.size === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select at least one user',
        variant: 'destructive',
      });
      return;
    }
    setBulkActionType(action);
    setIsBulkActionOpen(true);
  };

  const executeBulkAction = async () => {
    if (selectedUserIds.size === 0 || !bulkActionType) return;

    try {
      setIsBulkProcessing(true);
      const selectedUsersArray = Array.from(selectedUserIds);
      let successCount = 0;
      let failCount = 0;

      if (bulkActionType === 'delete') {
        // Delete users one by one
        for (const userId of selectedUsersArray) {
          try {
            const { error } = await supabase.functions.invoke('admin-delete-user', {
              body: { userId },
            });
            if (!error) {
              successCount++;
            } else {
              failCount++;
            }
          } catch {
            failCount++;
          }
        }

        toast({
          title: 'Bulk delete completed',
          description: `Successfully deleted ${successCount} user(s). ${failCount > 0 ? `Failed: ${failCount}` : ''}`,
        });
      } else if (bulkActionType === 'deactivate') {
        // Deactivate users one by one
        for (const userId of selectedUsersArray) {
          try {
            const { error } = await supabase.functions.invoke('admin-update-user', {
              body: {
                userId,
                isActive: false,
              },
            });
            if (!error) {
              successCount++;
            } else {
              failCount++;
            }
          } catch {
            failCount++;
          }
        }

        toast({
          title: 'Bulk deactivation completed',
          description: `Successfully deactivated ${successCount} user(s). ${failCount > 0 ? `Failed: ${failCount}` : ''}`,
        });
      }

      setSelectedUserIds(new Set());
      setIsBulkActionOpen(false);
      setBulkActionType(null);
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      console.error('Error in bulk action:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to complete bulk action',
        variant: 'destructive',
      });
    } finally {
      setIsBulkProcessing(false);
    }
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
            <Button size="sm" onClick={() => setIsAddUserOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </>
        }
      />

      <div className="px-6 py-6 space-y-6">
        {/* Bulk Actions Bar */}
        {selectedUserIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedUserIds.size} user{selectedUserIds.size > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserIds(new Set())}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
                disabled={isBulkProcessing}
              >
                <UserX className="h-4 w-4 mr-2" />
                Deactivate Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={isBulkProcessing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUserIds.has(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : 'N/A'}
                          </span>
                          <span className={`text-xs ${user.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        {user.phone_number ? formatPhoneNumber(user.phone_number) : 'N/A'}
                      </TableCell>
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

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with role and permissions
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateUser)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Min 8 characters" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="agent">Agent</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="loan_processor">Loan Processor</option>
                        <option value="underwriter">Underwriter</option>
                        <option value="funder">Funder</option>
                        <option value="closer">Closer</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable user account immediately
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddUserOpen(false);
                    createForm.reset();
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl w-full max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  View and manage user information and roles
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditToggle}
                  disabled={isSaving || isDeleting}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isSaving || isDeleting}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                {!isEditing ? (
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
                        <Badge variant="secondary" className="mb-2">{selectedUser.role}</Badge>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {selectedUser.email || 'N/A'}
                          </div>
                          {selectedUser.phone_number && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {formatPhoneNumber(selectedUser.phone_number)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">User Number</p>
                        <p className="text-sm font-mono">
                          {selectedUser.user_number !== undefined && selectedUser.user_number !== null
                            ? String(selectedUser.user_number).padStart(3, '0')
                            : `${selectedUser.id.slice(0, 8)}...`}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Joined Date</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(selectedUser.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <p className="text-sm">
                          {selectedUser.is_active ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-gray-500">Inactive</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                        <h4 className="font-semibold">Edit User Details</h4>
                        
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Active Status</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Enable or disable user account
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2 pt-4">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleEditToggle}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                )}

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for{' '}
              <span className="font-semibold">
                {selectedUser?.first_name && selectedUser?.last_name
                  ? `${selectedUser.first_name} ${selectedUser.last_name}`
                  : selectedUser?.email}
              </span>{' '}
              and remove all associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={isBulkActionOpen} onOpenChange={setIsBulkActionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkActionType === 'delete' ? 'Delete Multiple Users?' : 'Deactivate Multiple Users?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkActionType === 'delete' ? (
                <>
                  This action cannot be undone. This will permanently delete{' '}
                  <span className="font-semibold">{selectedUserIds.size}</span> user
                  {selectedUserIds.size > 1 ? 's' : ''} and remove all associated data from the system.
                </>
              ) : (
                <>
                  This will deactivate <span className="font-semibold">{selectedUserIds.size}</span> user
                  {selectedUserIds.size > 1 ? 's' : ''}. They will no longer be able to access the system.
                  You can reactivate them later.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeBulkAction}
              disabled={isBulkProcessing}
              className={bulkActionType === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {isBulkProcessing
                ? 'Processing...'
                : bulkActionType === 'delete'
                ? `Delete ${selectedUserIds.size} User${selectedUserIds.size > 1 ? 's' : ''}`
                : `Deactivate ${selectedUserIds.size} User${selectedUserIds.size > 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
