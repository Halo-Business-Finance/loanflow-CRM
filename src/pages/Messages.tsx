import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageComposer } from '@/components/MessageComposer';
import { Mail, MailOpen, Send, Inbox, Reply, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

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
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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


  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const unreadCount = messages.filter(msg => !msg.is_read && msg.recipient_id === currentUserId).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Internal communication system</p>
        </div>
        <Button onClick={handleCompose}>
          <Send className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="inbox" className="relative">
              <Inbox className="mr-2 h-4 w-4" />
              Inbox
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">
              <Send className="mr-2 h-4 w-4" />
              Sent
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ScrollArea className="h-[600px]">
                {!currentUserId ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  <>
                    <TabsContent value="inbox" className="mt-0">
                      {messages
                        .filter(msg => msg.recipient_id === currentUserId)
                        .map((message) => (
                          <div
                            key={message.id}
                            onClick={() => handleMessageClick(message)}
                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                              selectedMessage?.id === message.id ? 'bg-muted' : ''
                            } ${!message.is_read ? 'font-semibold' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {getInitials(
                                    message.sender_profile?.full_name || null,
                                    message.sender_profile?.email || ''
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {!message.is_read ? (
                                    <Mail className="h-4 w-4 text-primary" />
                                  ) : (
                                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <p className="text-sm font-medium truncate">
                                    {message.sender_profile?.full_name || message.sender_profile?.email}
                                  </p>
                                </div>
                                <p className="text-sm font-medium truncate mt-1">
                                  {message.subject}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {message.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="sent" className="mt-0">
                      {messages
                        .filter(msg => msg.sender_id === currentUserId)
                        .map((message) => (
                          <div
                            key={message.id}
                            onClick={() => handleMessageClick(message)}
                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                              selectedMessage?.id === message.id ? 'bg-muted' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {getInitials(
                                    message.recipient_profile?.full_name || null,
                                    message.recipient_profile?.email || ''
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Send className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm font-medium truncate">
                                    To: {message.recipient_profile?.full_name || message.recipient_profile?.email}
                                  </p>
                                </div>
                                <p className="text-sm font-medium truncate mt-1">
                                  {message.subject}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {message.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </TabsContent>
                  </>
                )}
              </ScrollArea>
            </div>

            <div className="lg:col-span-2">
              {isComposing ? (
                <MessageComposer
                  replyTo={replyTo}
                  onClose={() => {
                    setIsComposing(false);
                    setReplyTo(null);
                  }}
                  onSent={handleMessageSent}
                />
              ) : selectedMessage ? (
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {getInitials(
                              activeTab === 'inbox'
                                ? selectedMessage.sender_profile?.full_name || null
                                : selectedMessage.recipient_profile?.full_name || null,
                              activeTab === 'inbox'
                                ? selectedMessage.sender_profile?.email || ''
                                : selectedMessage.recipient_profile?.email || ''
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {activeTab === 'inbox'
                              ? selectedMessage.sender_profile?.full_name || selectedMessage.sender_profile?.email
                              : selectedMessage.recipient_profile?.full_name || selectedMessage.recipient_profile?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activeTab === 'inbox'
                              ? selectedMessage.sender_profile?.email
                              : selectedMessage.recipient_profile?.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {activeTab === 'inbox' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReply(selectedMessage)}
                          >
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMessage(selectedMessage.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-2">{selectedMessage.subject}</h3>
                      <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Mail className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No message selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a message from the list to view its contents
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
