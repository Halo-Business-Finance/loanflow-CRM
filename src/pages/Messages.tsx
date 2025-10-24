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
    <div className="p-4 md:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Internal communication system</p>
        </div>
        <Button onClick={handleCompose} size="sm" className="gap-2 h-8 text-xs shadow-sm">
          <Send className="h-3 w-3" />
          New Message
        </Button>
      </div>

      <Card className="border shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-muted/30 px-4 py-2">
            <TabsList className="bg-background border shadow-sm h-9">
              <TabsTrigger value="inbox" className="relative data-[state=active]:shadow-sm gap-1.5 px-4 text-xs">
                <Inbox className="h-3.5 w-3.5" />
                <span className="font-medium">Inbox</span>
                {unreadCount > 0 && (
                  <Badge variant="default" className="ml-1 px-1 py-0 text-xs h-4 min-w-4 rounded-full bg-primary">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="data-[state=active]:shadow-sm gap-1.5 px-4 text-xs">
                <Send className="h-3.5 w-3.5" />
                <span className="font-medium">Sent</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x">
            <div className="lg:col-span-1">
              <ScrollArea className="h-[500px]">
                {!currentUserId ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center space-y-1.5">
                      <div className="animate-pulse h-6 w-6 bg-primary/20 rounded-full mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Loading...</p>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center space-y-1.5">
                      <div className="animate-pulse h-6 w-6 bg-primary/20 rounded-full mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center space-y-2">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <Mail className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">No messages yet</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Start a conversation</p>
                      </div>
                      <Button onClick={handleCompose} variant="outline" size="sm" className="mt-2 h-7 text-xs">
                        <Send className="h-3 w-3 mr-1.5" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <TabsContent value="inbox" className="mt-0">
                      {messages
                        .filter(msg => msg.recipient_id === currentUserId)
                        .map((message, index) => (
                          <div
                            key={message.id}
                            onClick={() => handleMessageClick(message)}
                            className={`
                              group relative p-3 cursor-pointer transition-all duration-200
                              hover:bg-accent/50 border-b last:border-b-0
                              ${selectedMessage?.id === message.id ? 'bg-accent border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                              ${!message.is_read ? 'bg-primary/5' : ''}
                            `}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="relative">
                                <Avatar className={`h-9 w-9 border transition-colors ${!message.is_read ? 'border-primary/40' : 'border-border'}`}>
                                  <AvatarFallback className={`text-xs ${!message.is_read ? 'bg-primary/10 text-primary font-semibold' : ''}`}>
                                    {getInitials(
                                      message.sender_profile?.full_name || null,
                                      message.sender_profile?.email || ''
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                {!message.is_read && (
                                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-primary rounded-full border border-background" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-xs truncate ${!message.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'}`}>
                                    {message.sender_profile?.full_name || message.sender_profile?.email}
                                  </p>
                                  <p className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true }).replace('about ', '')}
                                  </p>
                                </div>
                                <p className={`text-xs truncate ${!message.is_read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                                  {message.subject}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {message.message}
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
                            className={`
                              group relative p-3 cursor-pointer transition-all duration-200
                              hover:bg-accent/50 border-b last:border-b-0
                              ${selectedMessage?.id === message.id ? 'bg-accent border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}
                            `}
                          >
                            <div className="flex items-start gap-2.5">
                              <Avatar className="h-9 w-9 border border-border">
                                <AvatarFallback className="text-xs">
                                  {getInitials(
                                    message.recipient_profile?.full_name || null,
                                    message.recipient_profile?.email || ''
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-xs text-muted-foreground flex-shrink-0">To:</span>
                                    <p className="text-xs font-medium text-foreground/90 truncate">
                                      {message.recipient_profile?.full_name || message.recipient_profile?.email}
                                    </p>
                                  </div>
                                  <p className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true }).replace('about ', '')}
                                  </p>
                                </div>
                                <p className="text-xs text-foreground/80 truncate">
                                  {message.subject}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {message.message}
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

            <div className="lg:col-span-2 bg-muted/20">
              {isComposing ? (
                <div className="p-4">
                  <MessageComposer
                    replyTo={replyTo}
                    onClose={() => {
                      setIsComposing(false);
                      setReplyTo(null);
                    }}
                    onSent={handleMessageSent}
                  />
                </div>
              ) : selectedMessage ? (
                <div className="p-4">
                  <Card className="shadow-sm border">
                    <div className="p-4 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar className="h-10 w-10 border border-primary/20 shadow-sm">
                            <AvatarFallback className="text-sm font-semibold">
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
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground">
                              {activeTab === 'inbox'
                                ? selectedMessage.sender_profile?.full_name || selectedMessage.sender_profile?.email
                                : selectedMessage.recipient_profile?.full_name || selectedMessage.recipient_profile?.email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {activeTab === 'inbox'
                                ? selectedMessage.sender_profile?.email
                                : `To: ${selectedMessage.recipient_profile?.email}`}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                              {formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          {activeTab === 'inbox' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleReply(selectedMessage)}
                              className="gap-1.5 h-7 text-xs"
                            >
                              <Reply className="h-3 w-3" />
                              Reply
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMessage(selectedMessage.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h3 className="text-base font-semibold text-foreground">{selectedMessage.subject}</h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="p-8 flex items-center justify-center h-full">
                  <div className="text-center space-y-3 max-w-sm">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                      <Mail className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">No message selected</h3>
                      <p className="text-xs text-muted-foreground">
                        Select a message from the list to view its contents
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
