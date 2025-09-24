import React from "react"
import MicrosoftAdminLayout from "./MicrosoftAdminLayout"

interface HybridLayoutProps {
  children: React.ReactNode
}

export default function HybridLayout({ children }: HybridLayoutProps) {
  return (
    <MicrosoftAdminLayout>
      {children}
    </MicrosoftAdminLayout>
  )
}