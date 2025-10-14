import { formatDistanceToNow } from "date-fns"
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Target, 
  Users, 
  Clock,
  Check,
  RefreshCw,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  related_id?: string
  related_type?: string
  scheduled_for?: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onRefresh: () => void
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'lead_status_change':
    case 'lead_created':
      return <Target className="w-4 h-4 text-navy" />
    case 'client_created':
    case 'client_updated':
      return <Users className="w-4 h-4 text-green-500" />
    case 'follow_up_reminder':
    case 'call_reminder':
    case 'email_reminder':
      return <Clock className="w-4 h-4 text-orange-500" />
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />
    default:
      return <Info className="w-4 h-4 text-navy" />
  }
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh
}: NotificationCenterProps) {
  const navigate = useNavigate()

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }

    // Navigate to relevant page based on notification type
    if (notification.related_type === 'lead' && notification.related_id) {
      navigate(`/leads/${notification.related_id}`)
    } else if (notification.related_type === 'client' && notification.related_id) {
      navigate(`/clients/${notification.related_id}`)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="w-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm mt-1">We'll notify you when something important happens</p>
          </div>
        ) : (
          <div className="p-0">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={cn(
                    "p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.is_read && "bg-navy/5 border-l-4 border-l-navy"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "text-sm font-medium",
                          !notification.is_read && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {notification.scheduled_for 
                            ? new Date(notification.scheduled_for).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })
                            : new Date(notification.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })
                          }
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-navy rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Showing last 20 notifications
          </p>
        </div>
      )}
    </div>
  )
}