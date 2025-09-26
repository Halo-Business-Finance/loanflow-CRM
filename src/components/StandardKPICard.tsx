import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StandardKPICardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  onClick?: () => void;
}

export function StandardKPICard({ 
  title, 
  value, 
  trend, 
  className,
  onClick 
}: StandardKPICardProps) {
  return (
    <Card 
      className={cn(
        "bg-card border-2 border-border/60 hover:border-border hover:shadow-lg transition-all duration-200 hover:scale-[1.02]",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-primary">{value}</p>
            {trend && (
              <div className="flex items-center gap-1">
                <span className={cn(
                  "text-xs font-medium",
                  trend.direction === 'up' && "text-green-600",
                  trend.direction === 'down' && "text-red-600",
                  trend.direction === 'neutral' && "text-muted-foreground"
                )}>
                  {trend.value}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}