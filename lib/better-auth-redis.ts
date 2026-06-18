import type { SecondaryStorage } from "better-auth"

import { getRedis } from "@/lib/redis"

const KEY_PREFIX = "pulse:auth:"

export const betterAuthRedisStorage: SecondaryStorage = {
  async get(key) {
    const redis = getRedis()
    if (!redis) {
      return null
    }

    try {
      const value = await redis.get(`${KEY_PREFIX}${key}`)
      if (value === null || value === undefined) {
        return null
      }

      if (typeof value === "string") {
        return value
      }

      return JSON.stringify(value)
    } catch {
      return null
    }
  },

  async set(key, value, ttl) {
    const redis = getRedis()
    if (!redis) {
      return
    }

    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value)

    if (ttl) {
      await redis.set(`${KEY_PREFIX}${key}`, stringValue, { ex: ttl })
      return
    }

    await redis.set(`${KEY_PREFIX}${key}`, stringValue)
  },

  async delete(key) {
    const redis = getRedis()
    if (!redis) {
      return
    }

    await redis.del(`${KEY_PREFIX}${key}`)
  },
}
