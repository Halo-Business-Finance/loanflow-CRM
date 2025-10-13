import React, { useState } from 'react';
import { IBMTopBar } from './IBMTopBar';
import { IBMSidebar } from './IBMSidebar';

interface IBMCloudLayoutProps {
  children: React.ReactNode;
}

export function IBMCloudLayout({ children }: IBMCloudLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <IBMSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <IBMTopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
