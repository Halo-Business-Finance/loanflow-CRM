import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IBMPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hasDropdown?: boolean;
  className?: string;
}

export function IBMPageHeader({
  title,
  subtitle,
  actions,
  hasDropdown = false,
  className,
}: IBMPageHeaderProps) {
  return (
    <div className={cn('bg-white px-6 py-4 border-b border-[#e0e0e0]', className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-normal text-[#161616]">{title}</h1>
            {hasDropdown && <ChevronDown className="h-4 w-4 text-[#525252]" />}
          </div>
          {subtitle && (
            <p className="text-sm text-[#525252] mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
