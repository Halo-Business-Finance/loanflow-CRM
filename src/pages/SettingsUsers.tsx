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
import { Separator } from "@/components/ui/separator"
import { Users, Plus, Settings, Shield, Search, Edit3, Trash2, RotateCcw, UserCheck, MoreHorizontal, Lock, Archive, Filter } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"
import { useToast } from "@/hooks/use-toast"
import { useSecureRoleManagement } from "@/hooks/useSecureRoleManagement"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { Eye, AlertTriangle } from "lucide-react"

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
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
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
          console.log('Raw edge response users:', edgeResponse.users)
          const transformedUsers = edgeResponse.users.map((profile: any) => {
            console.log('Transforming profile:', profile)
            const transformed = {
              ...profile,
              user_id: profile.id,
              phone: profile.phone_number || '',
              role: normalizeRole(profile.role || 'agent'),
              is_active: profile.is_active !== false // Ensure boolean
            }
            console.log('Transformed user:', transformed)
            return transformed
          })
          
          console.log('Final transformed users:', transformedUsers)
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
  
  // Deletion confirmation handlers
  const openDeleteDialog = (userId: string, name: string) => {
    setPendingDelete({ id: userId, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      await handleDeleteUser(pendingDelete.id, pendingDelete.name);
      setDeleteDialogOpen(false);
      setPendingDelete(null);
    }
  };

  const confirmBulkDelete = async () => {
    setBulkDeleteOpen(false);
    await handleBulkDelete();
  };

  const handleDeleteUser = async (userId: string, userName: string) => {

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No access token available')
      }

      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId },
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      })

      if (error) throw error

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete user')
      }

      toast({
        title: "User Deleted",
        description: `User ${userName} has been permanently deleted.`,
      })

      // Refresh users list
      await fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive"
      })
    }
  }

  const handleBulkDelete = async () => {

    setBulkOperationLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No access token available')
      }

      const deletePromises = Array.from(selectedUsers).map(userId =>
        supabase.functions.invoke('admin-delete-user', {
          body: { userId },
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`
          }
        })
      )

      const results = await Promise.allSettled(deletePromises)
      const userIds = Array.from(selectedUsers)

      let successCount = 0
      let failCount = 0

      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          const payload: any = r.value?.data
          if (payload && payload.success === true) {
            successCount++
          } else {
            failCount++
            console.error('Bulk delete failed for user', userIds[idx], r.value?.error || payload)
          }
        } else {
          failCount++
          console.error('Bulk delete rejected for user', userIds[idx], r.reason)
        }
      })

      toast({
        title: "Bulk Delete Complete",
        description: `Successfully deleted ${successCount} user${successCount === 1 ? '' : 's'}${failCount > 0 ? `, ${failCount} failed` : ''}.`,
        variant: failCount > 0 ? "destructive" : "default"
      })

      setSelectedUsers(new Set())
      await fetchUsers()
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
      case 'loan_processor': return 'secondary'
      case 'underwriter': return 'secondary'
      case 'funder': return 'secondary'
      case 'closer': return 'secondary'
      case 'loan_originator': return 'secondary'
      case 'agent': return 'outline'
      case 'viewer': return 'outline'
      default: return 'outline'
    }
  }

  const normalizeRole = (role: unknown): string => {
    const allowed = new Set([
      'super_admin','admin','manager','loan_processor','underwriter','funder','closer','loan_originator','agent','viewer'
    ])
    const r = typeof role === 'string' ? role.toLowerCase().trim() : ''
    if (allowed.has(r)) return r
    // Guard against status strings or unexpected values showing in the role column
    if (r === 'active' || r === 'inactive') return 'agent'
    return 'agent'
  }

  const displayRole = (role: string) => {
    return normalizeRole(role).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('Force refreshing user data...')
                fetchUsers()
              }}
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

        {/* Enterprise User Directory */}
        <Card className="border-0 shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <CardHeader className="pb-6 border-b border-border/50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                  <Eye className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Directory</CardTitle>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                    Comprehensive user management and access control
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {filteredUsers.length} of {totalUsers} users
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Enterprise Control Bar */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
                <Button variant="outline" size="default" className="shrink-0">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
            
            {/* Enterprise Bulk Actions Bar */}
            {selectedUsers.size > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-lg">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUsers(new Set())}
                        className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Clear selection
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleBulkActivate}
                      disabled={bulkOperationLoading}
                      className="bg-white dark:bg-slate-900 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/50"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleBulkDeactivate}
                      disabled={bulkOperationLoading}
                      className="bg-white dark:bg-slate-900 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Deactivate
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setBulkDeleteOpen(true)}
                      disabled={bulkOperationLoading}
                      className="bg-white dark:bg-slate-900 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
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

            {/* Enterprise Data Table - Desktop View */}
            {!loading && filteredUsers.length > 0 && (
              <div className="hidden lg:block">
                {/* Professional Table Header */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-t-xl p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-7 gap-8 font-semibold text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                        disabled={filteredUsers.length === 0}
                        className="border-slate-300 dark:border-slate-600"
                      />
                      <span>User</span>
                    </div>
                    <span>Email Address</span>
                    <span>Role & Permissions</span>
                    <span>Account Status</span>
                    <span>Created Date</span>
                    <span>Actions</span>
                    <span className="sr-only">Menu</span>
                  </div>
                </div>
                
                {/* Enterprise Table Body */}
                <div className="bg-white dark:bg-slate-950 rounded-b-xl overflow-hidden">
                  {filteredUsers.map((user, index) => {
                    console.log('Rendering user:', user.email, 'role:', user.role, 'is_active:', user.is_active)
                    return (
                    <div key={user.id} className={`grid grid-cols-7 gap-8 text-sm p-7 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 ${index !== filteredUsers.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selectedUsers.has(user.user_id)}
                          onCheckedChange={(checked) => handleSelectUser(user.user_id, checked as boolean)}
                          className="border-slate-300 dark:border-slate-600"
                        />
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-slate-200 dark:border-slate-700">
                            <AvatarImage src="" alt={formatUserName(user)} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              {formatUserName(user).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">{formatUserName(user)}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">ID: {user.user_id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{user.email}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Primary Contact</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(normalizeRole(user.role || 'agent'))} className="w-fit">
                          {displayRole(user.role || 'agent')}
                        </Badge>
                        <span className="text-sm text-foreground">{displayRole(user.role || 'agent')}</span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className={`flex items-center gap-2 ${getStatusColor(user.is_active)}`}>
                          <div className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-orange-500'}`} />
                          {getStatusText(user.is_active)}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Account State</span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Registration</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setEditDialogOpen(true);
                            }}
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <Button variant="outline" size="sm" type="button" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                                 <MoreHorizontal className="h-4 w-4" />
                               </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 z-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl">
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user.user_id, user.is_active)} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                <UserCheck className="h-4 w-4 mr-3" />
                                {user.is_active ? 'Deactivate' : 'Activate'} User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                              <DropdownMenuItem onClick={() => handleResetPassword(user.user_id, user.email)} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                <RotateCcw className="h-4 w-4 mr-3" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50">
                                <Lock className="h-4 w-4 mr-3" />
                                Lock Account
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
                              <DropdownMenuItem 
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                                onClick={() => {
                                  setPendingDelete({ id: user.user_id, name: formatUserName(user) });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Delete User Permanently
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <span className="sr-only">End of row</span>
                    </div>
                  )})}
                </div>
              </div>
            )}

            {/* Users Cards - Mobile View */}
            {!loading && filteredUsers.length > 0 && (
              <div className="lg:hidden space-y-4">
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
                             <Button variant="ghost" size="sm" type="button" className="h-8 w-8 p-0">
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 z-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl">
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
                                setPendingDelete({ id: user.user_id, name: formatUserName(user) });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User Permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Role:</span>
                            <Badge variant={getRoleBadgeVariant(normalizeRole(user.role || 'agent'))} className="text-xs">
                              {displayRole(user.role || 'agent')}
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

        {/* Confirm Delete Dialogs */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Permanently delete user?"
          description={`This will permanently delete ${pendingDelete?.name || 'this user'}. This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={confirmDelete}
        />
        <ConfirmDialog
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          title="Delete selected users?"
          description={`You are about to permanently delete ${selectedUsers.size} user(s). This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={confirmBulkDelete}
        />

        {/* Add User Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">
                Add New User
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Create a new user account with credentials and role
              </p>
            </DialogHeader>
            <AddUserForm 
              onSave={async (newUserData) => {
                await fetchUsers();
                setAddDialogOpen(false);
                toast({
                  title: "User Created",
                  description: "New user account has been created successfully.",
                });
              }}
              onCancel={() => {
                setAddDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>

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
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaInput, setShowMfaInput] = useState(false);
  const { toast } = useToast();
  const { 
    isLoading: mfaLoading, 
    mfaToken, 
    hasMfaVerification,
    generateMfaVerification,
    verifyMfaToken,
    assignUserRole
  } = useSecureRoleManagement();

  // Check if role change requires MFA
  const requiresMfa = (newRole: string) => {
    return ['admin', 'super_admin'].includes(newRole) || 
           ['admin', 'super_admin'].includes(user.role);
  };

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
    
    // Check if role change requires MFA and it hasn't been verified yet
    const roleChanged = formData.role !== user.role;
    const needsMfa = roleChanged && requiresMfa(formData.role);
    
    if (needsMfa && !hasMfaVerification) {
      setShowMfaInput(true);
      toast({
        title: "MFA Required",
        description: "Admin and super admin role changes require MFA verification.",
        variant: "destructive",
      });
      return;
    }

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

      // Handle role separately if it changed - using secure role management
      if (roleChanged) {
        console.log('Updating role from', user.role, 'to', formData.role);
        
        const result = await assignUserRole(
          user.id,
          formData.role as any,
          'Admin role update via user management',
          hasMfaVerification
        );

        if (!result.success) {
          throw new Error(result.error || 'Failed to update role');
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

  const handleGenerateMfa = async () => {
    const result = await generateMfaVerification();
    if (result.success) {
      setShowMfaInput(true);
    }
  };

  const handleVerifyMfa = async () => {
    const verified = await verifyMfaToken(mfaCode);
    if (verified) {
      setShowMfaInput(false);
      setMfaCode('');
      // Now submit the form
      handleSubmit(new Event('submit') as any);
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
        
        {/* MFA Warning for Admin Roles */}
        {requiresMfa(formData.role) && formData.role !== user.role && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>MFA Verification Required</AlertTitle>
            <AlertDescription>
              Assigning admin or super admin roles requires multi-factor authentication verification.
            </AlertDescription>
          </Alert>
        )}

        {/* MFA Input Section */}
        {showMfaInput && (
          <div className="space-y-4 p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-950/20">
            <div className="space-y-2">
              <Label htmlFor="mfa_code" className="text-sm font-medium">MFA Verification Code</Label>
              {mfaToken ? (
                <>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded border">
                    <p className="text-xs text-muted-foreground mb-2">Your MFA Token:</p>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{mfaToken}</code>
                  </div>
                  <Input
                    id="mfa_code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="Enter the MFA code shown above"
                  />
                  <Button 
                    type="button"
                    onClick={handleVerifyMfa}
                    disabled={!mfaCode || mfaLoading}
                    className="w-full"
                  >
                    {mfaLoading ? 'Verifying...' : 'Verify MFA Code'}
                  </Button>
                </>
              ) : (
                <Button 
                  type="button"
                  onClick={handleGenerateMfa}
                  disabled={mfaLoading}
                  className="w-full"
                >
                  {mfaLoading ? 'Generating...' : 'Generate MFA Code'}
                </Button>
              )}
            </div>
          </div>
        )}
        
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

// Add User Form Component
interface AddUserFormProps {
  onSave: (userData: any) => void;
  onCancel: () => void;
}

function AddUserForm({ onSave, onCancel }: AddUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'agent',
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Get the current session token
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No access token available');
      }

      // Create user using admin edge function
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          firstName: formData.first_name,
          lastName: formData.last_name,
          phone: formData.phone,
          role: formData.role,
          isActive: formData.is_active
        },
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create user');
      }

      onSave(data);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Failed to Create User",
        description: error.message || 'An unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Account Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Account Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@example.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min. 6 characters"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm password"
              required
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-4 border-t border-border pt-6">
        <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
        
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
          <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* Role and Status */}
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onCancel} className="order-2 sm:order-1">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="order-1 sm:order-2">
          {saving ? "Creating User..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}