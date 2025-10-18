import { useState, useEffect } from "react"
import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { StandardKPICard } from "@/components/StandardKPICard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { FileText, Download, Filter, RefreshCw, Settings, MoreVertical, Shield, Key, Lock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface AuditLog {
  id: string
  created_at: string
  user_id: string | null
  action: string
  table_name: string | null
  record_id: string | null
  ip_address: unknown
  user_agent: string | null
  risk_score: number | null
  old_values: any
  new_values: any
  session_id?: string | null
}

export default function SecurityAudit() {
  const { toast } = useToast()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEvents: 0,
    loginEvents: 0,
    dataAccess: 0,
    systemChanges: 0
  })

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      
      // Fetch recent audit logs
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      
      setAuditLogs(logs || [])
      
      // Calculate stats from the logs
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentLogs = logs?.filter(log => new Date(log.created_at) > last24Hours) || []
      
      setStats({
        totalEvents: recentLogs.length,
        loginEvents: recentLogs.filter(log => 
          log.action?.toLowerCase().includes('login') || 
          log.action?.toLowerCase().includes('auth')
        ).length,
        dataAccess: recentLogs.filter(log => 
          log.action?.toLowerCase().includes('view') || 
          log.action?.toLowerCase().includes('read') ||
          log.action?.toLowerCase().includes('select')
        ).length,
        systemChanges: recentLogs.filter(log => 
          log.action?.toLowerCase().includes('update') || 
          log.action?.toLowerCase().includes('create') ||
          log.action?.toLowerCase().includes('delete')
        ).length
      })
      
    } catch (error: any) {
      console.error('Error fetching audit logs:', error)
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
    
    // Set up realtime subscription
    const channel = supabase
      .channel('audit_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audit_logs'
        },
        () => {
          fetchAuditLogs()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getActionColor = (action: string) => {
    if (!action) return 'text-foreground'
    
    const lowerAction = action.toLowerCase()
    if (lowerAction.includes('delete') || lowerAction.includes('remove')) {
      return 'text-red-600 dark:text-red-400'
    }
    if (lowerAction.includes('create') || lowerAction.includes('insert')) {
      return 'text-green-600 dark:text-green-400'
    }
    if (lowerAction.includes('update') || lowerAction.includes('modify')) {
      return 'text-blue-600 dark:text-blue-400'
    }
    return 'text-foreground'
  }

  const getRiskColor = (riskScore: number | null) => {
    if (!riskScore) return 'text-green-600'
    if (riskScore >= 70) return 'text-red-600'
    if (riskScore >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <StandardPageLayout>
      <StandardPageHeader 
        title="Audit Logs"
        description="Comprehensive audit trail of all system activities"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAuditLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Options
                  <MoreVertical className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Audit Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  Configure Retention
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Key className="mr-2 h-4 w-4" />
                  Access Controls
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Lock className="mr-2 h-4 w-4" />
                  Archive Logs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Alert Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      
      <ResponsiveContainer padding="md" maxWidth="full">
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            <StandardKPICard 
              title="Total Events"
              value={stats.totalEvents}
              trend={{
                value: "Last 24 hours",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="Login Events"
              value={stats.loginEvents}
              trend={{
                value: "Authentication activities",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="Data Access"
              value={stats.dataAccess}
              trend={{
                value: "Records accessed",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="System Changes"
              value={stats.systemChanges}
              trend={{
                value: "Configuration updates",
                direction: "neutral"
              }}
            />
          </div>

          {/* Audit Logs Table */}
          <StandardContentCard title="Recent Audit Events">
            <p className="text-sm text-muted-foreground mb-4">
              Latest system activities and security events
            </p>
            
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading audit logs...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No audit logs found
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 font-medium text-sm border-b pb-2">
                  <span>Timestamp</span>
                  <span>User ID</span>
                  <span>Action</span>
                  <span>Resource</span>
                  <span>IP Address</span>
                  <span>Risk</span>
                </div>
                
                {auditLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-6 gap-4 text-sm p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                    <span className="truncate" title={log.user_id || 'System'}>
                      {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
                    </span>
                    <span className={getActionColor(log.action)}>
                      {log.action}
                    </span>
                    <span className="truncate" title={log.table_name || 'N/A'}>
                      {log.table_name || 'N/A'}
                      {log.record_id && ` #${log.record_id.slice(0, 8)}`}
                    </span>
                    <span className="truncate" title={String(log.ip_address || 'N/A')}>
                      {String(log.ip_address || 'N/A')}
                    </span>
                    <span className={getRiskColor(log.risk_score)}>
                      {log.risk_score !== null ? `${log.risk_score}%` : 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </StandardContentCard>
        </div>
      </ResponsiveContainer>
    </StandardPageLayout>
  )
}