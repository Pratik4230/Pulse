import { Ratelimit } from "@upstash/ratelimit"

import { getRedis } from "@/lib/redis"
import { RATE_LIMIT_ERROR_CODE } from "@/lib/rate-limit-constants"

export { RATE_LIMIT_ERROR_CODE }

export type RateLimitBucket =
  | "chat-free"
  | "chat-pro"
  | "transcribe"
  | "inbox"
  | "inbox-enrich"
  | "calendar"
  | "mcp"
  | "api-read"
  | "integration-connect"
  | "oauth-callback"
  | "webhook"

type RateLimitSuccess = {
  ok: true
  remaining: number
  reset: number
}

type RateLimitFailure = {
  ok: false
  remaining: number
  reset: number
}

export type RateLimitResult = RateLimitSuccess | RateLimitFailure

const BUCKET_LIMITS: Record<
  RateLimitBucket,
  { requests: number; window: `${number} ${"s" | "m" | "h" | "d"}` }
> = {
  "chat-free": { requests: 15, window: "1 m" },
  "chat-pro": { requests: 40, window: "1 m" },
  transcribe: { requests: 10, window: "1 m" },
  inbox: { requests: 30, window: "1 m" },
  "inbox-enrich": { requests: 10, window: "1 m" },
  calendar: { requests: 30, window: "1 m" },
  mcp: { requests: 40, window: "1 m" },
  "api-read": { requests: 60, window: "1 m" },
  "integration-connect": { requests: 5, window: "10 m" },
  "oauth-callback": { requests: 20, window: "10 m" },
  webhook: { requests: 120, window: "1 m" },
}

const limiterCache = new Map<RateLimitBucket, Ratelimit | null>()

function getLimiter(bucket: RateLimitBucket): Ratelimit | null {
  const cached = limiterCache.get(bucket)
  if (cached !== undefined) {
    return cached
  }

  const redis = getRedis()
  if (!redis) {
    limiterCache.set(bucket, null)
    return null
  }

  const { requests, window } = BUCKET_LIMITS[bucket]
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `pulse:${bucket}`,
    analytics: true,
  })

  limiterCache.set(bucket, limiter)
  return limiter
}

export function isRateLimitConfigured() {
  return Boolean(getRedis())
}

async function runLimiter(
  bucket: RateLimitBucket,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getLimiter(bucket)
  if (!limiter) {
    return { ok: true, remaining: Number.POSITIVE_INFINITY, reset: Date.now() }
  }

  const result = await limiter.limit(identifier)
  if (!result.success) {
    return { ok: false, remaining: result.remaining, reset: result.reset }
  }

  return { ok: true, remaining: result.remaining, reset: result.reset }
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown"
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  )
}

export async function checkUserRateLimit(
  userId: string,
  bucket: RateLimitBucket,
) {
  return runLimiter(bucket, `user:${userId}`)
}

export async function checkIpRateLimit(
  request: Request,
  bucket: RateLimitBucket,
) {
  return runLimiter(bucket, `ip:${getClientIp(request)}`)
}

export async function checkChatRateLimit(userId: string, isPro: boolean) {
  return checkUserRateLimit(userId, isPro ? "chat-pro" : "chat-free")
}

export async function checkTranscribeRateLimit(userId: string) {
  return checkUserRateLimit(userId, "transcribe")
}

export function rateLimitJsonResponse(reset: number) {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((reset - Date.now()) / 1000),
  )

  return Response.json(
    {
      error: "Too many requests. Please wait a moment and try again.",
      code: RATE_LIMIT_ERROR_CODE,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    },
  )
}

export async function userRateLimitResponse(
  userId: string,
  bucket: RateLimitBucket,
) {
  const result = await checkUserRateLimit(userId, bucket)
  if (!result.ok) {
    return rateLimitJsonResponse(result.reset)
  }

  return null
}

export async function ipRateLimitResponse(
  request: Request,
  bucket: RateLimitBucket,
) {
  const result = await checkIpRateLimit(request, bucket)
  if (!result.ok) {
    return rateLimitJsonResponse(result.reset)
  }

  return null
}
