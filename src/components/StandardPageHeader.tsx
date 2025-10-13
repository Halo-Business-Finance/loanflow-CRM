import React from 'react';
import { cn } from '@/lib/utils';

interface StandardPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function StandardPageHeader({ 
  title, 
  description, 
  actions, 
  className 
}: StandardPageHeaderProps) {
  return (
    <div className={cn("bg-card sticky top-0 z-10", className)}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground no-underline">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}