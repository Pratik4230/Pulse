import Link from "next/link"

import { PulseLogo } from "@/components/brand/pulse-logo"
import { Button } from "@/components/ui/button"
import { MarketingFooter } from "@/features/marketing/components/marketing-footer"
import { getSiteUrl, SITE_NAME, SUPPORT_EMAIL } from "@/lib/site"

type LegalSection = {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

type LegalPageProps = {
  title: string
  description: string
  updated: string
  sections: LegalSection[]
}

export function LegalPage({
  title,
  description,
  updated,
  sections,
}: LegalPageProps) {
  const siteUrl = getSiteUrl()

  return (
    <div className="relative min-h-svh">
      <div aria-hidden className="marketing-mesh pointer-events-none fixed inset-0 -z-10 opacity-60" />

      <header className="border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-6">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <PulseLogo size={28} showLabel />
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="space-y-3 border-b border-border/60 pb-10">
          <p className="text-xs font-semibold tracking-wider text-warm-muted uppercase">
            {SITE_NAME}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground">Last updated: {updated}</p>
        </div>

        <div className="prose-legal mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-tight">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 rounded-2xl border border-border/60 bg-card/60 p-5 text-sm text-muted-foreground">
          Questions about this policy? Contact us at{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
          . This document applies to {siteUrl}.
        </p>
      </main>

      <MarketingFooter />
    </div>
  )
}
