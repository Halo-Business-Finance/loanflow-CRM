import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Button } from '@/components/ui/button';
import { MessageComposer } from '@/components/MessageComposer';
import { MessagesSidebar } from '@/components/messages/MessagesSidebar';
import { MessageList } from '@/components/messages/MessageList';
import { MessageContent } from '@/components/messages/MessageContent';
import { MessageToolbar } from '@/components/messages/MessageToolbar';
import { Send, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender_profile?: {
    full_name: string | null;
    email: string;
  };
  recipient_profile?: {
    full_name: string | null;
    email: string;
  };
}

export default function Messages() {
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const fetchMessages = async () => {
    let isMounted = true;
    
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!isMounted) return;
      
      // Batch profile lookups
      const uniqueIds = Array.from(new Set((data || []).flatMap(d => [d.sender_id, d.recipient_id])));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', uniqueIds);
      
      if (!isMounted) return;
      
      const emailById = new Map((profiles || []).map(p => [p.id, p.email]));
      
      const messagesWithProfiles = (data || []).map(msg => ({
        ...msg,
        sender_profile: { 
          full_name: null, 
          email: emailById.get(msg.sender_id) || msg.sender_id 
        },
        recipient_profile: { 
          full_name: null, 
          email: emailById.get(msg.recipient_id) || msg.recipient_id 
        }
      }));
      
      if (isMounted) {
        setMessages(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (isMounted) {
        setMessages([]);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        });
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useRealtimeSubscription({
    table: 'user_messages',
    onChange: () => {
      try {
        fetchMessages();
      } catch (e) {
        console.warn('Realtime fetch failed:', e);
      }
    },
  });

  const markAsRead = async (messageId: string) => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', currentUserId);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Message deleted',
      });
      
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.is_read && message.recipient_id === currentUserId) {
      markAsRead(message.id);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    setIsComposing(true);
  };

  const handleCompose = () => {
    setReplyTo(null);
    setIsComposing(true);
  };

  const handleMessageSent = () => {
    setIsComposing(false);
    setReplyTo(null);
    fetchMessages();
    toast({
      title: 'Success',
      description: 'Message sent successfully',
    });
  };

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    setSelectedMessageIds(prev => 
      checked ? [...prev, messageId] : prev.filter(id => id !== messageId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const visibleMessages = messages.filter(msg => 
        activeFolder === 'inbox' ? msg.recipient_id === currentUserId : msg.sender_id === currentUserId
      );
      setSelectedMessageIds(visibleMessages.map(m => m.id));
    } else {
      setSelectedMessageIds([]);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('user_messages')
        .delete()
        .in('id', selectedMessageIds);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Deleted ${selectedMessageIds.length} message(s)`,
      });
      
      setSelectedMessageIds([]);
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete messages',
        variant: 'destructive',
      });
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (!currentUserId) return;
    
    try {
      const { error } = await supabase
        .from('user_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', selectedMessageIds)
        .eq('recipient_id', currentUserId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Marked ${selectedMessageIds.length} message(s) as read`,
      });
      
      setSelectedMessageIds([]);
      fetchMessages();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const unreadCount = messages.filter(msg => !msg.is_read && msg.recipient_id === currentUserId).length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar - Folders */}
      <MessagesSidebar
        activeFolder={activeFolder}
        onFolderChange={(folder) => {
          setActiveFolder(folder);
          setSelectedMessage(null);
          setSelectedMessageIds([]);
        }}
        unreadCount={unreadCount}
        onCompose={handleCompose}
      />

      {/* Middle Pane - Message List */}
      <div className={`${selectedMessage || isComposing ? 'w-80' : 'flex-1'} flex flex-col border-r bg-background transition-all duration-200`}>
        {/* Message List Header */}
        <div className="border-b bg-background">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold capitalize">{activeFolder === 'inbox' ? 'Inbox' : activeFolder === 'sent' ? 'Sent Items' : activeFolder}</h2>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleCompose} size="sm" className="gap-1.5 h-8">
              <Send className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
          
          {/* Toolbar */}
          <MessageToolbar
            selectedCount={selectedMessageIds.length}
            onDelete={handleBulkDelete}
            onMarkAsRead={handleBulkMarkAsRead}
            hasSelection={selectedMessageIds.length > 0}
          />
        </div>

        <MessageList
          messages={messages}
          selectedMessageId={selectedMessage?.id || null}
          onMessageClick={handleMessageClick}
          currentUserId={currentUserId}
          folder={activeFolder}
          loading={loading}
          selectedMessageIds={selectedMessageIds}
          onSelectMessage={handleSelectMessage}
          onSelectAll={handleSelectAll}
        />
      </div>

      {/* Right Pane - Message Content or Composer */}
      {(selectedMessage || isComposing) && (
        <div className="flex-1 bg-background">
          {isComposing ? (
            <div className="p-6 h-full overflow-auto">
              <MessageComposer
                replyTo={replyTo}
                onClose={() => {
                  setIsComposing(false);
                  setReplyTo(null);
                }}
                onSent={handleMessageSent}
              />
            </div>
          ) : (
            <MessageContent
              message={selectedMessage}
              folder={activeFolder}
              onReply={handleReply}
              onDelete={deleteMessage}
            />
          )}
        </div>
      )}
    </div>
  );
}
