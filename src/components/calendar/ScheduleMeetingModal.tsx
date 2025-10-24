import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ScheduleMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess?: () => void;
}

export function ScheduleMeetingModal({ 
  open, 
  onOpenChange, 
  selectedDate,
  onSuccess 
}: ScheduleMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'meeting',
    scheduledDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    scheduledTime: '09:00',
    assignedUserId: '',
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const scheduledFor = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      // Create notification for the current user
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          scheduled_for: scheduledFor.toISOString(),
        });

      if (error) throw error;

      // If a user is assigned and it's a team meeting, create a notification for them too
      if (formData.assignedUserId && formData.assignedUserId !== user.id) {
        const { error: assignedError } = await supabase
          .from('notifications')
          .insert({
            user_id: formData.assignedUserId,
            title: formData.title,
            message: formData.message,
            type: formData.type,
            scheduled_for: scheduledFor.toISOString(),
          });

        if (assignedError) {
          console.error('Error creating notification for assigned user:', assignedError);
        }
      }

      toast.success('Event scheduled successfully');
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'meeting',
        scheduledDate: '',
        scheduledTime: '09:00',
        assignedUserId: '',
      });
    } catch (error) {
      console.error('Error scheduling event:', error);
      toast.error('Failed to schedule event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="follow_up">Follow-up</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.type === 'meeting' || formData.type === 'call') && (
            <div className="space-y-2">
              <Label htmlFor="assignedUser">Assign to Team Member (Optional)</Label>
              <Select
                value={formData.assignedUserId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignedUserId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50 max-h-[200px]">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Description (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Add event details or notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
