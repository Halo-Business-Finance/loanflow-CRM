import React, { useState } from "react"
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
  imageSrc = "/logo.svg",
}: BrandLogoProps) {
  const [imgOk, setImgOk] = useState(true)

  return (
    <div className={cn("flex items-center", className)}>
      {imgOk ? (
        <img
          src={imageSrc}
          alt="LoanFlow CRM logo"
          title="LoanFlow CRM"
          loading="lazy"
          onError={() => setImgOk(false)}
          className="rounded-sm"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="rounded-sm bg-primary text-primary-foreground flex items-center justify-center"
          style={{ width: size, height: size }}
          aria-label="LoanFlow CRM logo placeholder"
        >
          <span className="text-[10px] font-bold">LF</span>
        </div>
      )}
      {showText && (
        <span className="ml-2 font-semibold text-foreground" aria-label="LoanFlow CRM brand name">
          {text}
        </span>
      )}
    </div>
  )
}
