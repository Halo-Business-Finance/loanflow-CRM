import React from 'react';
import { cn } from '@/lib/utils';

interface StandardPageHeaderProps {
  title: React.ReactNode;
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
      <div className="px-4 md:px-6 pt-6 pb-4 md:pt-8 md:pb-6">
        <div className="flex items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground no-underline flex items-center gap-3">
              {title}
            </h1>
            {description && (
              <p className="text-sm md:text-base text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
      <div className="mb-6 md:mb-8" />
    </div>
  );
}