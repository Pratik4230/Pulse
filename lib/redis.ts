import { Redis } from "@upstash/redis"

let cachedRedis: Redis | null | undefined

export function isRedisConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  )
}

export function getRedis(): Redis | null {
  if (cachedRedis !== undefined) {
    return cachedRedis
  }

  if (!isRedisConfigured()) {
    cachedRedis = null
    return null
  }

  cachedRedis = Redis.fromEnv()
  return cachedRedis
}
