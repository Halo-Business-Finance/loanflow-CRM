import React, { useState, useEffect } from 'react'
import { StandardPageLayout } from '@/components/StandardPageLayout'
import { StandardPageHeader } from '@/components/StandardPageHeader'
import { StandardKPICard } from '@/components/StandardKPICard'
import { StandardContentCard } from '@/components/StandardContentCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { 
  Bell, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  UserPlus, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Clock,
  Users,
  Phone,
  Mail,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Notification {
  id: string
  message: string
  timestamp: Date
  type: 'warning' | 'success' | 'info'
}

interface ActivityItem {
  id: string
  action: string
  details: string
  timestamp: Date
  user: string
}

export default function Activities() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch real notifications from database
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (notificationError) {
        console.error('Error fetching notifications:', notificationError)
      }

      // Convert database notifications to our format
      const dbNotifications: Notification[] = (notificationData || []).map(n => ({
        id: n.id,
        message: n.message || n.title,
        timestamp: new Date(n.created_at),
        type: n.is_read ? 'success' : 'info'
      }))

      // Sample activities for demonstration
      const sampleActivities: ActivityItem[] = [
        { 
          id: '1', 
          action: 'Lead Created', 
          details: 'New SBA loan application from John Smith - $150k equipment financing', 
          timestamp: new Date(Date.now() - 30 * 60 * 1000), 
          user: 'Sarah Johnson' 
        },
        { 
          id: '2', 
          action: 'Document Uploaded', 
          details: 'Financial statements for ABC Corp uploaded to lead #12345', 
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), 
          user: 'Mike Davis' 
        },
        { 
          id: '3', 
          action: 'Deal Closed', 
          details: '$250k commercial real estate loan approved and funded', 
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), 
          user: 'Lisa Wong' 
        },
        { 
          id: '4', 
          action: 'Follow-up Scheduled', 
          details: 'Meeting scheduled with prospect for loan restructuring discussion', 
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), 
          user: 'Tom Anderson' 
        },
      ]

      // Combine with sample notifications
      const sampleNotifications: Notification[] = [
        { id: 'n1', message: 'New lead requires immediate follow-up', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'warning' },
        { id: 'n2', message: 'Deal closed successfully - Commission earned!', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), type: 'success' },
        { id: 'n3', message: 'Payment reminder scheduled for tomorrow', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), type: 'info' },
      ]

      setNotifications([...dbNotifications, ...sampleNotifications])
      setActivities(sampleActivities)
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load activities and notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'info': return <Info className="h-4 w-4 text-blue-600" />
      default: return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Lead Created': return <UserPlus className="h-4 w-4 text-blue-600" />
      case 'Document Uploaded': return <FileText className="h-4 w-4 text-green-600" />
      case 'Deal Closed': return <TrendingUp className="h-4 w-4 text-purple-600" />
      case 'Follow-up Scheduled': return <Calendar className="h-4 w-4 text-orange-600" />
      case 'Call Made': return <Phone className="h-4 w-4 text-blue-600" />
      case 'Email Sent': return <Mail className="h-4 w-4 text-green-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <StandardPageLayout>
        <StandardPageHeader 
          title="Activity Command Center"
          description="Monitor system notifications, user activities, and important updates in real-time"
        />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-card border-2 border-border/60 rounded-lg p-6">
                <div className="h-6 bg-muted rounded w-24 mb-4"></div>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout>
      <StandardPageHeader 
        title="Activity Command Center"
        description="Monitor system notifications, user activities, and important updates in real-time"
        actions={
          <Button onClick={fetchData} className="flex items-center gap-2" variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        }
      />
      
      <div className="p-6 space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StandardKPICard
            title="Total Activities"
            value={activities.length}
            icon={Activity}
          />
          
          <StandardKPICard
            title="Notifications"
            value={notifications.length}
            icon={Bell}
          />
          
          <StandardKPICard
            title="Today's Actions"
            value="12"
            icon={TrendingUp}
          />
          
          <StandardKPICard
            title="Active Users"
            value="8"
            icon={Users}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Notifications */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Bell className="h-5 w-5 text-yellow-600" />
                Recent Notifications
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Important system alerts and priority updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    {getTypeIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp)} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activities
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Latest user actions and business operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    {getActionIcon(activity.action)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {activity.action}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {activity.user}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.details}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(activity.timestamp)} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Timeline */}
        <StandardContentCard 
          title="Activity Timeline"
          headerActions={<Clock className="h-5 w-5 text-green-600" />}
        >
          <div className="space-y-6">
            {[...activities, ...notifications.map(n => ({
              id: n.id,
              action: 'System Notification',
              details: n.message,
              timestamp: n.timestamp,
              user: 'System'
            }))].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8).map((item, index) => (
              <div key={item.id} className="flex items-center space-x-4 relative">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {getActionIcon(item.action)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(item.timestamp)} ago
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.details}</p>
                  <Badge variant="secondary" className="text-xs mt-1">{item.user}</Badge>
                </div>
                {index < 7 && (
                  <div className="absolute left-4 top-8 w-px h-6 bg-border"></div>
                )}
              </div>
            ))}
          </div>
        </StandardContentCard>
      </div>
    </StandardPageLayout>
  )
}