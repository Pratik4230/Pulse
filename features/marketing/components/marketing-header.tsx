"use client"

import Link from "next/link"
import { motion } from "motion/react"

import { PulseLogo } from "@/components/brand/pulse-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type MarketingHeaderProps = {
  className?: string
}

export function MarketingHeader({ className }: MarketingHeaderProps) {
  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="transition-opacity hover:opacity-80"
          aria-label="Pulse home"
        >
          <PulseLogo size={32} showLabel />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#shortcuts" className="transition-colors hover:text-foreground">
            Shortcuts
          </a>
          <a href="#sync" className="transition-colors hover:text-foreground">
            Live sync
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="shadow-elevated">
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  )
}
