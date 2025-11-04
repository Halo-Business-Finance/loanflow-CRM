import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

interface MessageListProps {
  messages: Message[];
  selectedMessageId: string | null;
  onMessageClick: (message: Message) => void;
  currentUserId: string | null;
  folder: string;
  loading: boolean;
  selectedMessageIds: string[];
  onSelectMessage: (messageId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export function MessageList({ 
  messages, 
  selectedMessageId, 
  onMessageClick, 
  currentUserId,
  folder,
  loading,
  selectedMessageIds,
  onSelectMessage,
  onSelectAll
}: MessageListProps) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const filteredMessages = messages.filter(msg => {
    if (folder === 'inbox') return msg.recipient_id === currentUserId;
    if (folder === 'sent') return msg.sender_id === currentUserId;
    return false;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-2">
          <div className="animate-pulse h-8 w-8 bg-primary/20 rounded-full mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  const allSelected = filteredMessages.length > 0 && 
    filteredMessages.every(m => selectedMessageIds.includes(m.id));

  if (filteredMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Mail className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No messages</p>
            <p className="text-xs text-muted-foreground mt-1">
              {folder === 'inbox' ? 'Your inbox is empty' : 'No sent messages'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Select All Row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-background">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onSelectAll}
          aria-label="Select all messages"
        />
        <span className="text-xs text-muted-foreground">
          Select all
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div>
          {filteredMessages.map((message) => {
            const isSelected = selectedMessageId === message.id;
            const isChecked = selectedMessageIds.includes(message.id);
            const isInbox = folder === 'inbox';
            const displayProfile = isInbox ? message.sender_profile : message.recipient_profile;
            
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 border-b cursor-pointer transition-colors hover:bg-muted/50",
                  isSelected && "bg-muted border-l-2 border-l-primary",
                  !message.is_read && isInbox && "bg-blue-50/30"
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => onSelectMessage(message.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
                
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => onMessageClick(message)}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(
                        displayProfile?.full_name || null,
                        displayProfile?.email || ''
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn(
                        "text-sm truncate",
                        !message.is_read && isInbox ? "font-semibold" : "font-normal"
                      )}>
                        {displayProfile?.full_name || displayProfile?.email}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(message.created_at), 'h:mm a')}
                      </span>
                    </div>
                    
                    <p className={cn(
                      "text-sm truncate",
                      !message.is_read && isInbox ? "font-medium" : "font-normal"
                    )}>
                      {message.subject}
                    </p>
                    
                    <p className="text-xs text-muted-foreground truncate">
                      {message.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}
