import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  Archive, 
  Mail, 
  MailOpen, 
  Flag, 
  Tag,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';

interface MessageToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onMarkAsRead: () => void;
  hasSelection: boolean;
}

export function MessageToolbar({ 
  selectedCount, 
  onDelete, 
  onMarkAsRead,
  hasSelection 
}: MessageToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-muted/30">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        onClick={onDelete}
        disabled={!hasSelection}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        disabled={!hasSelection}
      >
        <Archive className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        disabled={!hasSelection}
      >
        <Flag className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-8 gap-1"
        onClick={onMarkAsRead}
        disabled={!hasSelection}
      >
        <MailOpen className="h-4 w-4" />
        <span className="text-xs">Read</span>
        <ChevronDown className="h-3 w-3" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8"
        disabled={!hasSelection}
      >
        <Tag className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 ml-auto"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      
      {hasSelection && (
        <span className="text-xs text-muted-foreground ml-2">
          {selectedCount} selected
        </span>
      )}
    </div>
  );
}
