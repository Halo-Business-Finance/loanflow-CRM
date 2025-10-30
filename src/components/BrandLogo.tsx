import React from "react"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  size?: number
  showText?: boolean
  text?: string
  className?: string
  imageSrc?: string // Path in public/ e.g. "/logo.svg" or "/logo.png"
}

export function BrandLogo({
  size = 32,
  showText = true,
  text = "LoanFlow CRM",
  className,
  imageSrc = "/logo.png",
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={imageSrc}
        alt="LoanFlow CRM logo"
        title="LoanFlow CRM"
        loading="lazy"
        className="rounded-sm"
        style={{ height: size, width: 'auto' }}
      />
      {showText && (
        <span className="ml-2 font-semibold text-foreground text-lg" aria-label="LoanFlow CRM brand name">
          {text}
        </span>
      )}
    </div>
  )
}
