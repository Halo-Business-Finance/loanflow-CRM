import { useState, useEffect } from "react"
import { StandardPageLayout } from "@/components/StandardPageLayout"
import { StandardPageHeader } from "@/components/StandardPageHeader"
import { StandardContentCard } from "@/components/StandardContentCard"
import { StandardKPICard } from "@/components/StandardKPICard"
import { ResponsiveContainer } from "@/components/ResponsiveContainer"
import { AlertTriangle, Shield, Activity, TrendingUp, Settings, MoreVertical, Bell, Lock, Key, Ban, RefreshCw } from "lucide-react"
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

interface SecurityEvent {
  id: string
  created_at: string
  user_id: string | null
  event_type: string
  severity: string
  details: any
  ip_address?: unknown
  user_agent?: string | null
}

export default function SecurityThreats() {
  const { toast } = useToast()
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeThreats: 0,
    blockedAttempts: 0,
    securityScore: 98.5,
    anomalies: 0
  })
  const [threatCategories, setThreatCategories] = useState({
    bruteForce: 0,
    suspicious: 0,
    malware: 0,
    dataExfiltration: 0
  })

  const fetchSecurityEvents = async () => {
    try {
      setLoading(true)
      
      // Fetch recent security events
      const { data: events, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      
      setSecurityEvents(events || [])
      
      // Calculate stats from the events
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentEvents = events?.filter(event => new Date(event.created_at) > last24Hours) || []
      
      // Active threats (high severity, recent events)
      const activeThreats = recentEvents.filter(event => 
        event.severity === 'high' || event.severity === 'critical'
      ).length
      
      // Blocked attempts (failed logins, blocked access, etc.)
      const blockedAttempts = recentEvents.filter(event => 
        event.event_type?.toLowerCase().includes('failed') ||
        event.event_type?.toLowerCase().includes('blocked') ||
        event.event_type?.toLowerCase().includes('denied')
      ).length
      
      // Anomalies (medium severity)
      const anomalies = recentEvents.filter(event => 
        event.severity === 'medium'
      ).length
      
      // Calculate security score based on threat levels
      const criticalCount = recentEvents.filter(e => e.severity === 'critical').length
      const highCount = recentEvents.filter(e => e.severity === 'high').length
      const mediumCount = recentEvents.filter(e => e.severity === 'medium').length
      
      const scoreReduction = (criticalCount * 5) + (highCount * 2) + (mediumCount * 0.5)
      const securityScore = Math.max(85, 100 - scoreReduction)
      
      setStats({
        activeThreats,
        blockedAttempts,
        securityScore: Number(securityScore.toFixed(1)),
        anomalies
      })
      
      // Categorize threats
      const bruteForce = recentEvents.filter(e => 
        e.event_type?.toLowerCase().includes('brute') ||
        e.event_type?.toLowerCase().includes('login_attempt') ||
        e.event_type?.toLowerCase().includes('failed_login')
      ).length
      
      const suspicious = recentEvents.filter(e => 
        e.event_type?.toLowerCase().includes('suspicious') ||
        e.event_type?.toLowerCase().includes('anomaly')
      ).length
      
      const malware = recentEvents.filter(e => 
        e.event_type?.toLowerCase().includes('malware') ||
        e.event_type?.toLowerCase().includes('virus')
      ).length
      
      const dataExfiltration = recentEvents.filter(e => 
        e.event_type?.toLowerCase().includes('exfiltration') ||
        e.event_type?.toLowerCase().includes('bulk_access')
      ).length
      
      setThreatCategories({
        bruteForce,
        suspicious,
        malware,
        dataExfiltration
      })
      
    } catch (error: any) {
      console.error('Error fetching security events:', error)
      toast({
        title: "Error",
        description: "Failed to load security events",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSecurityEvents()
    
    // Set up realtime subscription
    const channel = supabase
      .channel('security_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_events'
        },
        () => {
          fetchSecurityEvents()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      case 'high':
        return 'text-orange-600 dark:text-orange-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'low':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusText = (event: SecurityEvent) => {
    const eventAge = Date.now() - new Date(event.created_at).getTime()
    const hoursOld = eventAge / (1000 * 60 * 60)
    
    if (hoursOld < 1) return 'Active'
    if (hoursOld < 24) return 'Monitoring'
    return 'Archived'
  }

  const getStatusColor = (event: SecurityEvent) => {
    const status = getStatusText(event)
    switch (status) {
      case 'Active':
        return 'text-red-600 dark:text-red-400'
      case 'Monitoring':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'Archived':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const activeThreatsData = securityEvents
    .filter(event => 
      event.severity === 'high' || event.severity === 'critical'
    )
    .slice(0, 5)

  return (
    <StandardPageLayout>
      <StandardPageHeader 
        title="Threat Detection"
        description="Real-time threat monitoring and security incident management"
        actions={
          <div className="flex items-center gap-3">
            <Button onClick={fetchSecurityEvents} disabled={loading} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <AlertTriangle className="mr-2 h-4 w-4" />
              View Alerts
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
                <DropdownMenuLabel>Threat Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Configure Alerts
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Ban className="mr-2 h-4 w-4" />
                  Block IP Addresses
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Lock className="mr-2 h-4 w-4" />
                  Lockdown Mode
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Key className="mr-2 h-4 w-4" />
                  Detection Rules
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      
      <ResponsiveContainer padding="md" maxWidth="full">
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StandardKPICard 
              title="Active Threats"
              value={stats.activeThreats}
              trend={{
                value: "Requires immediate attention",
                direction: stats.activeThreats > 0 ? "down" : "neutral"
              }}
            />

            <StandardKPICard 
              title="Blocked Attempts"
              value={stats.blockedAttempts}
              trend={{
                value: "Last 24 hours",
                direction: "neutral"
              }}
            />

            <StandardKPICard 
              title="Security Score"
              value={`${stats.securityScore}%`}
              trend={{
                value: "System security rating",
                direction: stats.securityScore >= 95 ? "up" : "neutral"
              }}
            />

            <StandardKPICard 
              title="Anomalies"
              value={stats.anomalies}
              trend={{
                value: "Under investigation",
                direction: "neutral"
              }}
            />
          </div>

          {/* Active Threats and Categories Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <StandardContentCard title="Active Threats">
              <p className="text-sm text-muted-foreground mb-4">
                Current security incidents requiring attention
              </p>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading threats...
                </div>
              ) : activeThreatsData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p>No active threats detected</p>
                  <p className="text-xs">All systems secure</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeThreatsData.map((threat) => (
                    <div 
                      key={threat.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        threat.severity === 'critical' 
                          ? 'border-red-200 bg-red-50 dark:bg-red-950/20' 
                          : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <AlertTriangle className={`h-6 w-6 ${getSeverityColor(threat.severity)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {threat.event_type.replace(/_/g, ' ').toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {formatDistanceToNow(new Date(threat.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="destructive" className="border-2 border-red-800">
                        Investigate
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </StandardContentCard>

            <StandardContentCard title="Threat Categories">
              <p className="text-sm text-muted-foreground mb-4">
                Breakdown of detected threats by type
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Brute Force Attacks</p>
                    <p className="text-sm text-muted-foreground">Login attempts</p>
                  </div>
                  <span className="text-lg font-semibold">{threatCategories.bruteForce}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Suspicious Activity</p>
                    <p className="text-sm text-muted-foreground">Anomalous behavior</p>
                  </div>
                  <span className="text-lg font-semibold">{threatCategories.suspicious}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Malware Detection</p>
                    <p className="text-sm text-muted-foreground">File uploads</p>
                  </div>
                  <span className="text-lg font-semibold">{threatCategories.malware}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Data Exfiltration</p>
                    <p className="text-sm text-muted-foreground">Unusual downloads</p>
                  </div>
                  <span className="text-lg font-semibold">{threatCategories.dataExfiltration}</span>
                </div>
              </div>
            </StandardContentCard>
          </div>

          {/* Recent Security Events */}
          <StandardContentCard title="Recent Security Events">
            <p className="text-sm text-muted-foreground mb-4">
              Latest threat detection activities
            </p>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading security events...
              </div>
            ) : securityEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No security events found
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 font-medium text-sm border-b pb-2">
                  <span>Time</span>
                  <span>Threat Type</span>
                  <span>Source</span>
                  <span>Severity</span>
                  <span>Status</span>
                </div>
                
                {securityEvents.slice(0, 20).map((event) => (
                  <div key={event.id} className="grid grid-cols-5 gap-4 text-sm p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <span className="text-muted-foreground truncate">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </span>
                    <span className="truncate" title={event.event_type}>
                      {event.event_type.replace(/_/g, ' ')}
                    </span>
                    <span className="truncate" title={event.user_id || 'External'}>
                      {event.user_id ? event.user_id.slice(0, 8) + '...' : 'External'}
                    </span>
                    <span className={getSeverityColor(event.severity)}>
                      {event.severity}
                    </span>
                    <span className={getStatusColor(event)}>
                      {getStatusText(event)}
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