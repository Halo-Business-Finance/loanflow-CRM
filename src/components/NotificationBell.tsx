import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { NotificationCenter } from "./NotificationCenter"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/components/auth/AuthProvider"

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
  borrower_name?: string
  company_name?: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const [hasError, setHasError] = useState(false)

  const fetchNotifications = async () => {
    if (!user) return

    try {
      // Ensure we have a valid session before making requests
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        console.warn('No valid session for notifications')
        setHasError(true)
        return
      }
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }

      // Fetch related contact entities for the notifications
      const relatedIds = (data || [])
        .filter(n => n.related_id && n.related_type === 'lead')
        .map(n => n.related_id)

      let contactEntityMap = new Map()
      if (relatedIds.length > 0) {
        const { data: contactData } = await supabase
          .from('leads')
          .select(`
            id,
            contact_entities!inner(
              name,
              business_name,
              first_name,
              last_name
            )
          `)
          .in('id', relatedIds)

        if (contactData) {
          contactData.forEach(lead => {
            const contact = (lead as any).contact_entities
            contactEntityMap.set(lead.id, contact)
          })
        }
      }

      const allNotifications = (data || []).map(n => {
        const contactEntity = n.related_id ? contactEntityMap.get(n.related_id) : null
        const borrowerName = contactEntity 
          ? (contactEntity.name || `${contactEntity.first_name || ''} ${contactEntity.last_name || ''}`.trim())
          : null
        const companyName = contactEntity?.business_name

        return {
          ...n,
          borrower_name: borrowerName,
          company_name: companyName
        }
      })
      
      // Show both past notifications and future reminders
      // Sort by scheduled_for if it exists, otherwise by created_at
      const sortedNotifications = allNotifications.sort((a, b) => {
        const aTime = a.scheduled_for || a.created_at
        const bTime = b.scheduled_for || b.created_at
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      }).slice(0, 20)
      
      setNotifications(sortedNotifications as any)
      const unread = sortedNotifications.filter(n => !n.is_read).length || 0
      setUnreadCount(unread)
      setHasError(false)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      // Check if it's a SecurityError
      if (error instanceof Error && error.name === 'SecurityError') {
        console.warn('SecurityError accessing notifications - session may need refresh')
        setHasError(true)
      }
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
      
      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      
      if (error) {
        console.error('Error marking all notifications as read:', error)
        return
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  useEffect(() => {
    // Add delay to ensure auth is fully initialized
    const initNotifications = async () => {
      try {
        await fetchNotifications()

        // Set up real-time subscription for new notifications
        if (user && !hasError) {
          const channel = supabase
            .channel('notifications')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
              },
              (payload) => {
                const newNotification = payload.new as Notification
                setNotifications(prev => [newNotification, ...prev.slice(0, 19)])
                if (!newNotification.is_read) {
                  setUnreadCount(prev => prev + 1)
                }
              }
            )
            .subscribe()

          return () => {
            supabase.removeChannel(channel)
          }
        }
      } catch (error) {
        console.error('Error initializing notifications:', error)
      }
    }

    const timer = setTimeout(initNotifications, 100)
    return () => clearTimeout(timer)
  }, [user, hasError])

  if (!user || hasError) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative text-foreground dark:text-white hover:bg-transparent hover:outline hover:outline-2 hover:outline-blue-500 hover:outline-offset-[-2px] transition-all duration-300 rounded"
        >
          <Bell className="w-6 h-6" fill="rgb(234, 179, 8)" stroke="rgb(234, 179, 8)" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-96 p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onRefresh={fetchNotifications}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}