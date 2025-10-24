import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { StandardKPICard } from "@/components/StandardKPICard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { Shield, Users, Key, Lock, Settings, UserPlus, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface RoleCount {
  role: string
  count: number
}

interface AuditLogEvent {
  id: string
  action: string
  user_id: string | null
  created_at: string
  ip_address: string | null
  email?: string
}

export default function SecurityAccess() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeUsers, setActiveUsers] = useState(0)
  const [adminUsers, setAdminUsers] = useState(0)
  const [failedLogins, setFailedLogins] = useState(0)
  const [roleCounts, setRoleCounts] = useState<RoleCount[]>([])
  const [recentEvents, setRecentEvents] = useState<AuditLogEvent[]>([])

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    try {
      setLoading(true)

      // Fetch active sessions (currently logged in users)
      const { data: sessions, error: sessionsError } = await supabase
        .from('active_sessions')
        .select('id')
        .eq('is_active', true)

      if (sessionsError) throw sessionsError
      setActiveUsers(sessions?.length || 0)

      // Fetch admin users from user_roles
      const { data: adminRoles, error: adminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'super_admin'])

      if (adminError) throw adminError
      setAdminUsers(adminRoles?.length || 0)

      // Fetch failed logins from account_lockouts in last 24 hours
      const yesterday = new Date()
      yesterday.setHours(yesterday.getHours() - 24)

      const { data: lockouts, error: lockoutsError } = await supabase
        .from('account_lockouts')
        .select('id')
        .gte('created_at', yesterday.toISOString())

      if (lockoutsError) throw lockoutsError
      setFailedLogins(lockouts?.length || 0)

      // Fetch role counts from user_roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')

      if (rolesError) throw rolesError

      // Count users by role
      const roleCounts: { [key: string]: number } = {}
      roles?.forEach(r => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1
      })

      setRoleCounts(
        Object.entries(roleCounts).map(([role, count]) => ({ role, count }))
      )

      // Fetch recent audit log events with user emails
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('id, action, user_id, created_at, ip_address')
        .order('created_at', { ascending: false })
        .limit(5)

      if (auditError) {
        console.error('Audit logs error:', auditError)
      } else if (auditLogs) {
        // Fetch user emails separately
        const userIds = auditLogs
          .map(log => log.user_id)
          .filter((id): id is string => id !== null)
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds)

        const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || [])
        
        const eventsWithEmails: AuditLogEvent[] = auditLogs.map(log => ({
          id: log.id,
          action: log.action,
          user_id: log.user_id,
          created_at: log.created_at,
          ip_address: log.ip_address as string | null,
          email: log.user_id ? profileMap.get(log.user_id) : undefined
        }))

        setRecentEvents(eventsWithEmails)
      }

    } catch (error) {
      console.error('Error fetching security data:', error)
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrator',
      'super_admin': 'Super Administrator',
      'manager': 'Manager',
      'user': 'User',
      'underwriter': 'Underwriter',
      'closer': 'Closer',
      'processor': 'Loan Processor',
      'funder': 'Funder'
    }
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1)
  }

  const getActionDisplayName = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'login': 'User Login',
      'logout': 'User Logout',
      'create': 'Record Created',
      'update': 'Record Updated',
      'delete': 'Record Deleted',
      'permission_change': 'Permission Change',
      'role_change': 'Role Change'
    }
    return actionMap[action] || action
  }

  const getActionStatus = (action: string) => {
    if (action.includes('fail') || action.includes('error')) {
      return { text: 'Failed', color: 'text-red-600' }
    }
    if (action.includes('update') || action.includes('change')) {
      return { text: 'Updated', color: 'text-blue-600' }
    }
    return { text: 'Success', color: 'text-green-600' }
  }
  return (
    <StandardPageLayout>
      <StandardPageHeader 
        title="Access Management"
        description="Manage user access permissions and security controls"
        actions={
          <div className="flex items-center gap-3">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Security Options
                  <MoreVertical className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Security Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  Configure Policies
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Key className="mr-2 h-4 w-4" />
                  Manage API Keys
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Lock className="mr-2 h-4 w-4" />
                  Session Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Bulk User Actions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      
      <ResponsiveContainer padding="md" maxWidth="full">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StandardKPICard 
              title="Active Users"
              value={loading ? "..." : activeUsers.toString()}
              trend={{
                value: "Currently logged in",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="Admin Users"
              value={loading ? "..." : adminUsers.toString()}
              trend={{
                value: "With admin privileges",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="API Keys"
              value="—"
              trend={{
                value: "Active integrations",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="Failed Logins"
              value={loading ? "..." : failedLogins.toString()}
              trend={{
                value: "Last 24 hours",
                direction: "neutral"
              }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StandardContentCard title="User Permissions">
              <p className="text-sm text-muted-foreground mb-4">
                Manage role-based access control
              </p>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : roleCounts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No roles assigned</div>
                ) : (
                  roleCounts.map((roleCount) => (
                    <div key={roleCount.role} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{getRoleDisplayName(roleCount.role)}</p>
                        <p className="text-sm text-muted-foreground">
                          {roleCount.count} user{roleCount.count !== 1 ? 's' : ''} assigned
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  ))
                )}
              </div>
            </StandardContentCard>

            <StandardContentCard title="Recent Access Events">
              <p className="text-sm text-muted-foreground mb-4">
                Latest security events
              </p>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : recentEvents.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No recent events</div>
                ) : (
                  recentEvents.map((event) => {
                    const status = getActionStatus(event.action)
                    return (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{getActionDisplayName(event.action)}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.email || 'Unknown user'} - {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <span className={`text-sm ${status.color}`}>{status.text}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </StandardContentCard>
          </div>
        </div>
      </ResponsiveContainer>
    </StandardPageLayout>
  )
}