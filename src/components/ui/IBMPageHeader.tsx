import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

interface IBMPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hasDropdown?: boolean;
  className?: string;
  showBreadcrumbs?: boolean;
}

export function IBMPageHeader({
  title,
  subtitle,
  actions,
  hasDropdown = false,
  className,
  showBreadcrumbs = true,
}: IBMPageHeaderProps) {
  const breadcrumbs = useBreadcrumbs();

  return (
    <div className={cn('bg-white px-6 py-4 border-b border-[#e0e0e0]', className)}>
      {showBreadcrumbs && breadcrumbs.length > 1 && (
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {breadcrumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={breadcrumb.href} className="text-[#525252] hover:text-[#161616]">
                        {breadcrumb.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-[#161616]">
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
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
