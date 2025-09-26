import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Plus, Settings, Shield, Search, Edit3, Trash2, RotateCcw, UserCheck, MoreHorizontal, Lock, Archive } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function SettingsUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false)
  const { user, hasRole } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (hasRole('admin') || hasRole('super_admin')) {
      fetchUsers()
    } else {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to view this page",
        variant: "destructive"
      })
      navigate('/leads')
    }
  }, [user, hasRole, navigate])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // For admin users, use the edge function to bypass RLS issues
      if (hasRole('admin') || hasRole('super_admin')) {
        // Get the current session token
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session?.access_token) {
          throw new Error('No access token available')
        }

        const { data: edgeResponse, error: edgeError } = await supabase.functions.invoke('admin-get-users', {
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`
          }
        })

        if (edgeError) {
          throw new Error(`Failed to fetch users via admin function: ${edgeError.message}`)
        }

        if (edgeResponse?.users) {
          const transformedUsers = edgeResponse.users.map((profile: any) => ({
            ...profile,
            user_id: profile.id,
            phone: profile.phone_number || '',
            role: profile.role || 'agent'
          }))
          
          setUsers(transformedUsers)
          return
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users: " + (error as Error).message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshUserData = () => {
    fetchUsers()
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.rpc('admin_update_profile', {
        p_user_id: userId,
        p_is_active: !currentStatus
      })

      if (error) throw error

      await fetchUsers()
      toast({
        title: "Status Updated",
        description: `User has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive"
      })
    }
  }

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-reset-password', {
        body: { userId, email }
      })

      if (error) throw error

      toast({
        title: "Password Reset",
        description: "Password reset email has been sent to the user.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password.",
        variant: "destructive"
      })
    }
  }

  // Bulk selection functions
  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers)
    if (checked) {
      newSelected.add(userId)
    } else {
      newSelected.delete(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map(user => user.user_id)))
    } else {
      setSelectedUsers(new Set())
    }
  }

  // Bulk operations
  const handleBulkActivate = async () => {
    if (selectedUsers.size === 0) return
    
    setBulkOperationLoading(true)
    try {
      const promises = Array.from(selectedUsers).map(userId => 
        supabase.rpc('admin_update_profile', {
          p_user_id: userId,
          p_is_active: true
        })
      )
      
      await Promise.all(promises)
      await fetchUsers()
      setSelectedUsers(new Set())
      
      toast({
        title: "Users Activated",
        description: `${selectedUsers.size} users have been activated.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to activate users.",
        variant: "destructive"
      })
    } finally {
      setBulkOperationLoading(false)
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedUsers.size === 0) return
    
    setBulkOperationLoading(true)
    try {
      const promises = Array.from(selectedUsers).map(userId => 
        supabase.rpc('admin_update_profile', {
          p_user_id: userId,
          p_is_active: false
        })
      )
      
      await Promise.all(promises)
      await fetchUsers()
      setSelectedUsers(new Set())
      
      toast({
        title: "Users Deactivated",
        description: `${selectedUsers.size} users have been deactivated.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate users.",
        variant: "destructive"
      })
    } finally {
      setBulkOperationLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return
    
    const selectedUserNames = filteredUsers
      .filter(u => selectedUsers.has(u.user_id))
      .map(u => formatUserName(u))
      .join(', ')

    if (!confirm(`Are you sure you want to delete ${selectedUsers.size} users (${selectedUserNames})? This action cannot be undone.`)) {
      return
    }

    setBulkOperationLoading(true)
    try {
      // For now, just show a toast as delete functionality is not implemented
      toast({
        title: "Bulk Delete",
        description: `Bulk delete functionality for ${selectedUsers.size} users coming soon`,
      })
      setSelectedUsers(new Set())
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete users.",
        variant: "destructive"
      })
    } finally {
      setBulkOperationLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive'
      case 'admin': return 'default'
      case 'manager': return 'secondary'
      default: return 'outline'
    }
  }

  const formatUserName = (user: UserProfile) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.first_name || user.email
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive'
  }

  // Calculate statistics
  const totalUsers = users.length
  const adminCount = users.filter(u => ['admin', 'super_admin'].includes(u.role)).length
  const activeUsers = users.filter(u => u.is_active).length
  const inactiveUsers = totalUsers - activeUsers

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              User Management
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage user accounts, roles, and permissions across your organization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => {
                // Add user functionality - opens add user dialog
                toast({
                  title: "Add User",
                  description: "Add user functionality coming soon",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button 
              variant="outline" 
              onClick={refreshUserData}
              disabled={loading}
              size="sm"
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered accounts
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{adminCount}</div>
              <p className="text-xs text-muted-foreground">
                Admin privileges
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{inactiveUsers}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Directory Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">User Directory</CardTitle>
                <CardDescription className="text-sm">
                  Manage all user accounts and permissions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{filteredUsers.length} of {totalUsers} users</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Input */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Bulk Actions Bar */}
            {selectedUsers.size > 0 && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUsers(new Set())}
                      className="h-6 px-2 text-xs"
                    >
                      Clear selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkActivate}
                      disabled={bulkOperationLoading}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkDeactivate}
                      disabled={bulkOperationLoading}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Deactivate
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                      disabled={bulkOperationLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Loading users...</span>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-foreground mb-2">No users found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'No users available in the system'}
                </p>
              </div>
            )}

            {/* Users Table - Desktop View */}
            {!loading && filteredUsers.length > 0 && (
              <div className="hidden lg:block">
                {/* Table Header */}
                <div className="grid grid-cols-7 gap-4 font-medium text-sm text-muted-foreground border-b border-border pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={filteredUsers.length === 0}
                    />
                    <span>User</span>
                  </div>
                  <span>Email</span>
                  <span>Role</span>
                  <span>Status</span>
                  <span>Created</span>
                  <span>Actions</span>
                  <span></span>
                </div>
                
                {/* Table Body */}
                <div className="space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-7 gap-4 text-sm p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedUsers.has(user.user_id)}
                          onCheckedChange={(checked) => handleSelectUser(user.user_id, checked as boolean)}
                        />
                        <span className="font-medium text-foreground">{formatUserName(user)}</span>
                      </div>
                      <span className="text-muted-foreground truncate">{user.email}</span>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit">
                        {user.role.replace('_', ' ')}
                      </Badge>
                      <span className={getStatusColor(user.is_active)}>
                        {getStatusText(user.is_active)}
                      </span>
                      <span className="text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => {
                            setEditingUser(user);
                            setEditDialogOpen(true);
                          }}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleUserStatus(user.user_id, user.is_active)}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            {user.is_active ? 'Deactivate' : 'Activate'} User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleResetPassword(user.user_id, user.email)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Lock className="h-4 w-4 mr-2" />
                            Lock Account
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete user ${formatUserName(user)}? This action cannot be undone.`)) {
                                toast({
                                  title: "Delete User",
                                  description: "Delete user functionality coming soon",
                                })
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Cards - Mobile View */}
            {!loading && filteredUsers.length > 0 && (
              <div className="lg:hidden space-y-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedUsers.has(user.user_id)}
                            onCheckedChange={(checked) => handleSelectUser(user.user_id, checked as boolean)}
                          />
                          <div>
                            <h3 className="font-medium text-foreground">{formatUserName(user)}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => {
                              setEditingUser(user);
                              setEditDialogOpen(true);
                            }}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleUserStatus(user.user_id, user.is_active)}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              {user.is_active ? 'Deactivate' : 'Activate'} User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleResetPassword(user.user_id, user.email)}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Lock className="h-4 w-4 mr-2" />
                              Lock Account
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete user ${formatUserName(user)}? This action cannot be undone.`)) {
                                  toast({
                                    title: "Delete User",
                                    description: "Delete user functionality coming soon",
                                  })
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Role:</span>
                            <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={getStatusColor(user.is_active)}>
                              {getStatusText(user.is_active)}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">
                Edit User Profile
              </DialogTitle>
              {editingUser && (
                <p className="text-sm text-muted-foreground">
                  Editing profile for {formatUserName(editingUser)}
                </p>
              )}
            </DialogHeader>
            {editingUser && (
              <EditUserForm 
                user={editingUser}
                onSave={(updatedUser) => {
                  setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
                  setEditDialogOpen(false);
                  setEditingUser(null);
                  toast({
                    title: "User Updated",
                    description: "User information has been updated successfully.",
                  });
                }}
                onCancel={() => {
                  setEditDialogOpen(false);
                  setEditingUser(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Additional Information Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Role Overview</CardTitle>
              <CardDescription>System role definitions and access levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Super Administrator</p>
                    <p className="text-sm text-muted-foreground">Full system access and control</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Level 4
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Administrator</p>
                    <p className="text-sm text-muted-foreground">System administration access</p>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Level 3
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Manager</p>
                    <p className="text-sm text-muted-foreground">Team and lead management</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Level 2
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Loan Specialists</p>
                    <p className="text-sm text-muted-foreground">Loan processing and underwriting</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Level 1
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Activity Overview</CardTitle>
              <CardDescription>User engagement and system statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Active Users</p>
                    <p className="text-sm text-muted-foreground">Currently active accounts</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeUsers}</div>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">Role Diversity</p>
                    <p className="text-sm text-muted-foreground">Different user roles in system</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {new Set(users.map(u => u.role)).size}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">New This Month</p>
                    <p className="text-sm text-muted-foreground">Recently registered users</p>
                  </div>
                  <div className="text-2xl font-bold text-accent-foreground">
                    {users.filter(u => {
                      const created = new Date(u.created_at)
                      const now = new Date()
                      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                      return created >= thisMonth
                    }).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Edit User Form Component
interface EditUserFormProps {
  user: UserProfile;
  onSave: (user: UserProfile) => void;
  onCancel: () => void;
}

function EditUserForm({ user, onSave, onCancel }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || '',
    is_active: user.is_active
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error", 
        description: "Passwords don\'t match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.", 
        variant: "destructive",
      });
      return;
    }

    setResettingPassword(true);
    try {
      // Use Supabase Admin API to reset user password
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No access token available');
      }

      // Call edge function to reset password as admin
      const { error } = await supabase.functions.invoke('admin-reset-password', {
        body: { 
          user_id: user.user_id,
          new_password: newPassword 
        },
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      });

      if (error) {
        throw error;
      }

      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password Reset",
        description: "User password has been successfully reset.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('Attempting to update user:', user.id);
      console.log('Form data:', formData);

      // Try to update using the admin function first
      try {
        const { data: updateResult, error: adminError } = await supabase.rpc('admin_update_profile', {
          p_user_id: user.id,
          p_first_name: formData.first_name !== user.first_name ? formData.first_name : null,
          p_last_name: formData.last_name !== user.last_name ? formData.last_name : null,
          p_phone: formData.phone !== user.phone ? formData.phone : null,
          p_is_active: formData.is_active !== user.is_active ? formData.is_active : null
        });

        if (adminError) {
          console.error('Admin update profile error:', adminError);
          throw new Error(`Failed to update profile: ${adminError.message}`);
        }

        console.log('Profile updated successfully via admin function:', updateResult);
      } catch (error) {
        throw error;
      }

      // Handle role separately if it changed
      if (formData.role !== user.role) {
        console.log('Updating role from', user.role, 'to', formData.role);
        
        // Update role in user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role as any })
          .eq('user_id', user.id);

        if (roleError) {
          console.error('Role update error:', roleError);
          toast({
            title: "Partial Update",
            description: "Profile updated but role change failed. Please contact an administrator.",
            variant: "destructive",
          });
        } else {
          console.log('Role updated successfully');
        }
      }

      // Call onSave with updated user data
      onSave({
        ...user,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        is_active: formData.is_active,
        role: formData.role,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "User Updated",
        description: "User information has been successfully updated.",
      });

    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error.message || 'An unknown error occurred';
      
      toast({
        title: "Update Failed", 
        description: `Failed to update user information: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-sm font-medium">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Enter first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-sm font-medium">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">Email addresses cannot be modified</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* Role and Status Section */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="text-lg font-medium text-foreground">Access Control</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">User Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="loan_originator">Loan Originator</SelectItem>
                <SelectItem value="loan_processor">Loan Processor</SelectItem>
                <SelectItem value="underwriter">Underwriter</SelectItem>
                <SelectItem value="funder">Funder</SelectItem>
                <SelectItem value="closer">Closer</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">Account Status</Label>
            <Select 
              value={formData.is_active ? "active" : "inactive"} 
              onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Password Reset Section */}
      <div className="space-y-4 border-t border-border pt-6">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">Security</h3>
          <p className="text-sm text-muted-foreground">Reset the user's password for security purposes</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-sm font-medium">New Password</Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-sm font-medium">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
        </div>
        
        <Button 
          type="button"
          variant="secondary"
          onClick={handlePasswordReset}
          disabled={resettingPassword || !newPassword || !confirmPassword}
          className="w-full"
        >
          {resettingPassword ? "Resetting Password..." : "Reset User Password"}
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="order-2 sm:order-1">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="order-1 sm:order-2">
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}