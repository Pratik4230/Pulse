import Link from "next/link"

import { PulseLogo } from "@/components/brand/pulse-logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6">
      <Link
        href="/"
        className="transition-opacity hover:opacity-80"
      >
        <PulseLogo size={40} showLabel priority />
      </Link>
      {children}
    </div>
  )
}
