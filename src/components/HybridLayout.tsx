import React from "react"
import { TopNavigation } from "./navigation/TopNavigation"
import { ContextualSidebar } from "./navigation/ContextualSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

interface HybridLayoutProps {
  children: React.ReactNode
}

export default function HybridLayout({ children }: HybridLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-background via-background to-muted/20">
        {/* Top Navigation - Fixed Header */}
        <TopNavigation />
        
        {/* Main Content Area with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Contextual Left Sidebar */}
          <ContextualSidebar />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="container mx-auto px-8 py-8 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}