import { Inbox, Send, FileText, Trash2, Archive, ChevronDown, ChevronRight, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MessagesSidebarProps {
  activeFolder: string;
  onFolderChange: (folder: string) => void;
  unreadCount: number;
  onCompose: () => void;
}

export function MessagesSidebar({ activeFolder, onFolderChange, unreadCount, onCompose }: MessagesSidebarProps) {
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);

  const folders = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount },
    { id: 'sent', label: 'Sent Items', icon: Send, count: 0 },
    { id: 'drafts', label: 'Drafts', icon: FileText, count: 0 },
    { id: 'archive', label: 'Archive', icon: Archive, count: 0 },
    { id: 'deleted', label: 'Deleted Items', icon: Trash2, count: 0 },
  ];

  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col">
      {/* New Mail Button */}
      <div className="p-3 border-b">
        <Button onClick={onCompose} className="w-full gap-2">
          <Mail className="h-4 w-4" />
          New mail
        </Button>
      </div>

      {/* Folders */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Favorites Section */}
          <div className="mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-1 h-7 px-2 mb-1"
              onClick={() => setFavoritesOpen(!favoritesOpen)}
            >
              {favoritesOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              <span className="text-xs font-medium">Favorites</span>
            </Button>
            
            {favoritesOpen && (
              <div className="space-y-0.5 ml-2">
                <Button
                  variant={activeFolder === 'inbox' ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2 h-8 pl-4 text-sm"
                  onClick={() => onFolderChange('inbox')}
                >
                  <Inbox className="h-4 w-4" />
                  <span className="flex-1 text-left">Inbox</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Main Folders Section */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-1 h-7 px-2 mb-1"
              onClick={() => setFoldersOpen(!foldersOpen)}
            >
              {foldersOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              <span className="text-xs font-medium">Folders</span>
            </Button>
            
            {foldersOpen && (
              <div className="space-y-0.5 ml-2">
                {folders.map((folder) => {
                  const Icon = folder.icon;
                  return (
                    <Button
                      key={folder.id}
                      variant={activeFolder === folder.id ? 'secondary' : 'ghost'}
                      className={cn(
                        "w-full justify-start gap-2 h-8 pl-4 text-sm",
                        activeFolder === folder.id && "bg-muted font-medium"
                      )}
                      onClick={() => onFolderChange(folder.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{folder.label}</span>
                      {folder.count > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
                          {folder.count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
