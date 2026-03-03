import Redis from "ioredis"
import { createLogger } from "./logger"

const logger = createLogger("redis")

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

let redis: Redis | null = null

export function getRedisClient(): Redis | null {
    if (process.env.NODE_ENV === "test") return null

    if (!redis) {
        try {
            redis = new Redis(REDIS_URL, {
                maxRetriesPerRequest: 3,
                retryStrategy(times) {
                    const delay = Math.min(times * 50, 2000)
                    return delay
                },
            })

            redis.on("error", (err) => {
                logger.error("Redis error", { error: err.message })
            })

            redis.on("connect", () => {
                logger.info("Connected to Redis")
            })
        } catch (err) {
            logger.error("Failed to initialize Redis", { error: err instanceof Error ? err.message : String(err) })
            return null
        }
    }

    return redis
}

export async function getCache<T>(key: string): Promise<T | null> {
    const client = getRedisClient()
    if (!client) return null

    try {
        const data = await client.get(key)
        if (!data) return null
        return JSON.parse(data) as T
    } catch (err) {
        logger.warn("Redis get error", { key, error: err instanceof Error ? err.message : String(err) })
        return null
    }
}

export async function setCache(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
    const client = getRedisClient()
    if (!client) return

    try {
        const data = JSON.stringify(value)
        await client.set(key, data, "EX", ttlSeconds)
    } catch (err) {
        logger.warn("Redis set error", { key, error: err instanceof Error ? err.message : String(err) })
    }
}
