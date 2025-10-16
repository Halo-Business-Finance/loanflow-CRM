import React, { useState } from 'react';
import { IBMTopBar } from './IBMTopBar';
import { IBMSidebar } from './IBMSidebar';

interface IBMCloudLayoutProps {
  children: React.ReactNode;
}

export function IBMCloudLayout({ children }: IBMCloudLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <IBMTopBar 
        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="flex flex-1 overflow-hidden">
        <IBMSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <main className="flex-1 overflow-auto bg-white no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
