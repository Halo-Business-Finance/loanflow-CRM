import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageComposerProps {
  replyTo?: {
    id: string;
    sender_id: string;
    subject: string;
    sender_profile?: {
      full_name: string | null;
      email: string;
    };
  } | null;
  onClose: () => void;
  onSent: () => void;
}

interface User {
  id: string;
  full_name: string | null;
  email: string;
}

export function MessageComposer({ replyTo, onClose, onSent }: MessageComposerProps) {
  const [recipients, setRecipients] = useState<User[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    
    if (replyTo) {
      setSelectedRecipient(replyTo.sender_id);
      setSubject(replyTo.subject.startsWith('Re: ') ? replyTo.subject : `Re: ${replyTo.subject}`);
    }
  }, [replyTo]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');

      if (error) throw error;
      setRecipients((data || []).map(u => ({ ...u, full_name: null })));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    }
  };

  const handleSend = async () => {
    if (!selectedRecipient || !subject.trim() || !message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('user_messages').insert({
        sender_id: user.id,
        recipient_id: selectedRecipient,
        subject: subject.trim(),
        message: message.trim(),
        parent_message_id: replyTo?.id || null,
      });

      if (error) throw error;

      // Create notification for recipient
      await supabase.from('notifications').insert({
        user_id: selectedRecipient,
        title: 'New Message',
        message: `${user.email} sent you a message: ${subject}`,
        type: 'message',
      });

      onSent();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {replyTo ? 'Reply to Message' : 'New Message'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient">To</Label>
            <Select
              value={selectedRecipient}
              onValueChange={setSelectedRecipient}
              disabled={!!replyTo}
            >
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={10}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              <Send className="mr-2 h-4 w-4" />
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
