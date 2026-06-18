"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FREE_PLAN_FEATURES,
  getFreeDisplayPrice,
  getProDisplayPrice,
  PRO_PLAN_FEATURES,
} from "@/lib/billing/pricing"
import { cn } from "@/lib/utils"

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

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-warm-muted" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function PricingSection() {
  const proPrice = getProDisplayPrice()
  const freePrice = getFreeDisplayPrice()

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <FadeIn>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Simple pricing
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Inbox free. Pay for unlimited AI.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Keyboard inbox, calendar, and real-time sync are free forever. Upgrade
            when you want unlimited Pulse AI and voice in your language.
          </p>
        </div>
      </FadeIn>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <FadeIn>
          <div className="shadow-elevated h-full rounded-3xl border border-border/70 bg-card/80 p-8">
            <h3 className="text-xl font-semibold">Free</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start without a card
            </p>
            <p className="mt-6 text-4xl font-semibold tracking-tight">{freePrice}</p>
            <FeatureList items={FREE_PLAN_FEATURES} />
            <Button asChild className="mt-8 w-full" variant="outline">
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div
            className={cn(
              "shadow-elevated-lg h-full rounded-3xl border border-warm-muted/35 p-8",
              "bg-linear-to-br from-warm/10 via-card to-accent/20",
            )}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Pro</h3>
              <Badge>Popular</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Unlimited Pulse AI + voice
            </p>
            <p className="mt-6 text-4xl font-semibold tracking-tight">
              {proPrice.formatted}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / mo
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Billed in USD · UPI and cards accepted at checkout
            </p>
            <FeatureList items={PRO_PLAN_FEATURES} />
            <Button asChild className="mt-8 w-full">
              <Link href="/signup">Start free, upgrade anytime</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
