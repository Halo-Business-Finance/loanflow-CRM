import React from "react"
import { TopNavigation } from "./navigation/TopNavigation"

interface HybridLayoutProps {
  children: React.ReactNode
}

export default function HybridLayout({ children }: HybridLayoutProps) {
  return (
    <div className="h-screen flex flex-col w-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Top Navigation - Fixed Header */}
      <TopNavigation />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}