"use client"

import Link from "next/link"
import { motion } from "motion/react"
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Keyboard,
  Languages,
  Mail,
  Mic,
  Radio,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { LANDING_SHORTCUT_GROUPS } from "@/lib/app-shortcuts"
import { STARTER_LANGUAGES } from "@/features/pulse/lib/starter-suggestions"
import { HeroMockup } from "@/features/marketing/components/hero-mockup"
import { MarketingFooter } from "@/features/marketing/components/marketing-footer"
import { MarketingHeader } from "@/features/marketing/components/marketing-header"
import { PricingSection } from "@/features/marketing/components/pricing-section"
import { SITE_TAGLINE } from "@/lib/site"
import { cn } from "@/lib/utils"

const FEATURES = [
  {
    icon: Mail,
    title: "Inbox at the speed of thought",
    description:
      "A dense, keyboard-navigable Gmail view. Move with arrow keys, focus search with /, and enrich metadata on demand.",
    className: "md:col-span-2",
    accent: "from-warm/20 to-transparent",
  },
  {
    icon: CalendarDays,
    title: "Calendar in context",
    description:
      "See what's next without leaving flow. Create events with natural language from Pulse AI.",
    className: "md:col-span-1",
    accent: "from-primary/10 to-transparent",
  },
  {
    icon: Bot,
    title: "Pulse AI",
    description:
      "Type or talk to Pulse AI. Ask about your inbox, draft replies, and schedule meetings in your language.",
    className: "md:col-span-1",
    accent: "from-accent to-transparent",
  },
  {
    icon: Radio,
    title: "Real-time sync",
    description:
      "New emails and calendar changes push to your UI within seconds via Google webhooks. No manual refresh.",
    className: "md:col-span-2",
    accent: "from-warm/15 via-accent/30 to-transparent",
  },
]

const SHORTCUTS = LANDING_SHORTCUT_GROUPS

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-x-clip">
      <div
        aria-hidden
        className="marketing-mesh pointer-events-none fixed inset-0 -z-10"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.98_0.03_78),transparent_55%)]"
      />

      <MarketingHeader />

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-20 lg:grid-cols-2 lg:gap-16 lg:pt-24">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                  <Zap className="size-3 text-warm-muted" />
                  Keyboard-first workspace
                </Badge>
                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                  <Mic className="size-3 text-warm-muted" />
                  Voice input
                </Badge>
                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                  <Languages className="size-3 text-warm-muted" />
                  {STARTER_LANGUAGES.length} languages
                </Badge>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="space-y-5"
            >
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Email &amp; calendar,
                <span className="block bg-linear-to-r from-foreground via-foreground to-warm-muted bg-clip-text text-transparent">
                  without the friction.
                </span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
                {SITE_TAGLINE} Navigate with shortcuts, speak to Pulse AI in
                English or Indian languages, and watch your inbox update in real
                time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Button
                asChild
                size="lg"
                className="shadow-elevated-lg h-11 gap-2 px-6"
              >
                <Link href="/signup">
                  Start for free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-6">
                <Link href="/login">Sign in</Link>
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-xs text-muted-foreground"
            >
              Connect Gmail &amp; Google Calendar in one click. Your data stays
              yours.
            </motion.p>
          </div>

          <HeroMockup className="lg:justify-self-end" />
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <FadeIn className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-warm-muted uppercase">
              Everything in one flow
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for people who never leave the inbox
            </h2>
          </FadeIn>

          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <FadeIn
                key={feature.title}
                delay={index * 0.06}
                className={cn(
                  "group shadow-elevated relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 backdrop-blur-sm transition-transform hover:-translate-y-0.5",
                  feature.className
                )}
              >
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-0 bg-linear-to-br opacity-60 transition-opacity group-hover:opacity-100",
                    feature.accent
                  )}
                />
                <div className="relative space-y-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-background/80">
                    <feature.icon className="size-5 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <section
          id="voice"
          className="border-y border-border/60 bg-card/30 py-20"
        >
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mb-12 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                <Mic className="size-3.5" />
                Voice + multilingual AI
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Talk to your inbox in the language you think in
              </h2>
              <p className="mt-4 text-muted-foreground">
                Tap the mic in Pulse AI and speak naturally. Sarvam Saaras
                transcribes your voice, auto-detects the language, and handles
                code-mixed speech like Hinglish. Type works too.
              </p>
            </FadeIn>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
              <FadeIn delay={0.05}>
                <div className="shadow-elevated rounded-2xl border border-border/70 bg-card/80 p-6">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-12 items-center justify-center rounded-full border border-border/60 bg-background">
                      <Mic className="size-5 text-foreground" />
                      <span
                        aria-hidden
                        className="absolute inset-0 animate-ping rounded-full border border-warm/40 opacity-40"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Listening...</p>
                      <p className="text-xs text-muted-foreground">
                        Up to 27 seconds per message
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                    <p className="text-[11px] font-medium tracking-wide text-warm-muted uppercase">
                      Example (Hindi)
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      मेरे 5 सबसे हाल के unread emails दिखाओ। हर email के लिए
                      sender, subject और एक लाइन summary दो।
                    </p>
                  </div>

                  <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
                    <p className="text-[11px] font-medium tracking-wide text-warm-muted uppercase">
                      Example (English)
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      Schedule a 30-minute interview with alex@company.com on
                      Friday at 10am and send a confirmation email.
                    </p>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="shadow-elevated rounded-2xl border border-border/70 bg-card/80 p-6">
                  <div className="flex items-center gap-2">
                    <Languages className="size-4 text-warm-muted" />
                    <h3 className="text-sm font-semibold">
                      Supported languages
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Pulse AI starter prompts and voice input work across these
                    languages. Ask about Gmail, Calendar, or both.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {STARTER_LANGUAGES.map((language) => (
                      <Badge
                        key={language}
                        variant="secondary"
                        className="px-2.5 py-1 text-xs"
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                    Same languages for typed prompts and voice. Mix languages in
                    one sentence when that is how you naturally speak.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <PricingSection />

        <section id="shortcuts" className="py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                <Keyboard className="size-3.5" />
                Keyboard-driven navigation
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Your hands never leave the keyboard
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Arrow keys move through your inbox. Slash focuses search. Cmd+K
                opens the command palette to jump to Calendar, Pulse AI, or
                Settings. Ctrl+K and Ctrl+B on Windows.
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="space-y-6">
                {SHORTCUTS.map((group) => (
                  <div key={group.id}>
                    <p className="mb-2 text-xs font-semibold tracking-wider text-warm-muted uppercase">
                      {group.title}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {group.shortcuts.map((shortcut) => (
                        <div
                          key={`${group.id}-${shortcut.label}`}
                          className="shadow-elevated flex items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3"
                        >
                          <span className="text-sm text-muted-foreground">
                            {shortcut.label}
                          </span>
                          <KbdGroup>
                            {shortcut.keys.map((key) => (
                              <Kbd key={key}>{key}</Kbd>
                            ))}
                          </KbdGroup>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        <section id="sync" className="mx-auto max-w-6xl px-6 py-20">
          <FadeIn>
            <div className="shadow-elevated-lg relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-card via-card to-accent/30 p-8 sm:p-12">
              <div
                aria-hidden
                className="absolute -top-20 -right-20 size-64 rounded-full bg-warm/20 blur-3xl"
              />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-4">
                  <Badge variant="outline">Live sync</Badge>
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    New mail appears before you reach for refresh
                  </h2>
                  <p className="max-w-xl text-muted-foreground">
                    Google Pub/Sub pushes Gmail changes to Pulse in seconds.
                    Calendar watches keep your schedule current. Stay in the
                    thread. The UI catches up to you.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <div className="rounded-2xl border border-border/60 bg-background/80 px-5 py-4">
                    <p className="text-2xl font-semibold tabular-nums">
                      &lt;15s
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Typical inbox update latency
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/80 px-5 py-4">
                    <p className="text-2xl font-semibold">SSE</p>
                    <p className="text-xs text-muted-foreground">
                      Real-time UI invalidation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-4 pb-24">
          <FadeIn>
            <div className="shadow-elevated-lg flex flex-col items-center gap-6 rounded-3xl border border-border/70 bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to move at the speed of your thoughts?
              </h2>
              <p className="max-w-md text-sm text-primary-foreground/80 sm:text-base">
                Create an account, connect Gmail, and feel what inbox software
                should have been.
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-11 gap-2 px-8"
              >
                <Link href="/signup">
                  Get started. It&apos;s free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
