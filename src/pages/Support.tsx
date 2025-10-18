import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Ticket, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
}

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'support';
  timestamp: string;
}

export default function Support() {
  const { toast } = useToast();
  const [tickets] = useState<SupportTicket[]>([
    {
      id: '1',
      subject: 'Unable to upload documents',
      description: 'Getting an error when uploading PDF files',
      status: 'in_progress',
      priority: 'high',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      subject: 'Question about loan calculations',
      description: 'Need clarification on interest rate calculations',
      status: 'open',
      priority: 'medium',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! How can I help you today?',
      sender: 'support',
      timestamp: new Date().toISOString(),
    },
  ]);

  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [chatInput, setChatInput] = useState('');

  const handleCreateTicket = async () => {
    if (!newTicketSubject || !newTicketDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      toast({
        title: "Ticket created",
        description: "Your support ticket has been submitted successfully",
      });

      setNewTicketSubject('');
      setNewTicketDescription('');
      setNewTicketPriority('medium');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create support ticket",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message: chatInput,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');

    // Simulate support response
    setTimeout(() => {
      const supportReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Thank you for your message. A support agent will respond shortly.',
        sender: 'support',
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, supportReply]);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'resolved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Support Center</h1>
          <p className="text-muted-foreground">
            Get help with tickets or chat with our support team
          </p>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Support Tickets
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Live Chat
            </TabsTrigger>
          </TabsList>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Create New Ticket */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Create New Ticket
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                        <Button
                          key={priority}
                          variant={newTicketPriority === priority ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewTicketPriority(priority)}
                          className="capitalize"
                        >
                          {priority}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Detailed description of your issue..."
                      className="min-h-32"
                      value={newTicketDescription}
                      onChange={(e) => setNewTicketDescription(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleCreateTicket}>
                    Submit Ticket
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Tickets */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Your Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)} variant="outline">
                            <span className="flex items-center gap-1">
                              {getStatusIcon(ticket.status)}
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="chat" className="mt-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Live Support Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto border border-border rounded-lg p-4 space-y-4 bg-muted/20">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {msg.sender === 'user' ? 'You' : 'Support Agent'}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
