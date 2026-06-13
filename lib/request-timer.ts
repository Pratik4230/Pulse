import { NextResponse } from "next/server"

/**
 * Dev request timing — delete this file and remove `createRequestTimer` from
 * API routes to uninstall.
 *
 * Enabled when NODE_ENV=development and PULSE_TIMING is not "0".
 * Set PULSE_TIMING=0 in .env to silence without removing code.
 */

type TimingStep = {
  name: string
  dur: number
}

export function isRequestTimingEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.PULSE_TIMING !== "0"
  )
}

export function createRequestTimer(route: string) {
  const enabled = isRequestTimingEnabled()
  const startedAt = performance.now()
  const steps: TimingStep[] = []

  async function time<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    if (!enabled) return fn()

    const stepStart = performance.now()
    try {
      return await fn()
    } finally {
      steps.push({
        name,
        dur: Math.round(performance.now() - stepStart),
      })
    }
  }

  function attach(response: NextResponse) {
    if (!enabled) return response

    const total = Math.round(performance.now() - startedAt)
    const serverTiming = [
      ...steps.map((step) => `${step.name};dur=${step.dur}`),
      `total;dur=${total}`,
    ].join(", ")

    response.headers.set("Server-Timing", serverTiming)

    const breakdown = Object.fromEntries(
      steps.map((step) => [step.name, `${step.dur}ms`]),
    )

    console.log(`[pulse:timing] ${route} ${total}ms`, breakdown)

    return response
  }

  function json(data: unknown, init?: ResponseInit) {
    return attach(NextResponse.json(data, init))
  }

  return { time, attach, json }
}

/** Nested server steps (console only). Remove with request-timer.ts. */
export async function timeServerStep<T>(
  label: string,
  fn: () => Promise<T> | T,
): Promise<T> {
  if (!isRequestTimingEnabled()) return fn()

  const stepStart = performance.now()
  try {
    return await fn()
  } finally {
    const dur = Math.round(performance.now() - stepStart)
    console.log(`[pulse:timing]   ${label} ${dur}ms`)
  }
}
