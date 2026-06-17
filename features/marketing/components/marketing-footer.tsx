import Link from "next/link"

import { PulseLogo } from "@/components/brand/pulse-logo"
import { Separator } from "@/components/ui/separator"
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site"

export function MarketingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <PulseLogo size={28} showLabel />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Email and calendar, rebuilt for speed. Keyboard-first navigation,
              AI when you need it, real-time sync when you don&apos;t.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider text-warm-muted uppercase">
              Product
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="transition-colors hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-foreground">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider text-warm-muted uppercase">
              Legal
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-foreground">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-foreground">
                  Terms of service
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="transition-colors hover:text-foreground"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-xs text-muted-foreground">
          © {year} {SITE_NAME}. Built for people who live in their inbox.
        </p>
      </div>
    </footer>
  )
}
