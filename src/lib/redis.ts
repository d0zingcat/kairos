import Redis from "ioredis"
import { createLogger } from "./logger"

const logger = createLogger("redis")

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

declare global {
    var redis: Redis | undefined
}

export function getRedisClient(): Redis | null {
    if (process.env.NODE_ENV === "test") return null

    if (!global.redis) {
        try {
            const url = new URL(REDIS_URL)
            const redisOptions: import("ioredis").RedisOptions = {
                host: url.hostname,
                port: parseInt(url.port) || 6379,
                maxRetriesPerRequest: 1,
                connectTimeout: 1000,
                commandTimeout: 1000,
                retryStrategy(times: number) {
                    if (times > 1) return null
                    return 50
                },
            }

            if (url.password) {
                redisOptions.password = decodeURIComponent(url.password)
            }

            if (url.pathname && url.pathname !== "/") {
                const db = parseInt(url.pathname.substring(1))
                if (!isNaN(db)) {
                    redisOptions.db = db
                }
            }

            if (url.protocol === "rediss:") {
                redisOptions.tls = {}
            }

            global.redis = new Redis(redisOptions)

            global.redis.on("error", (err) => {
                logger.error("Redis error", { error: err.message })
            })

            global.redis.on("connect", () => {
                logger.info("Connected to Redis")
            })
        } catch (err) {
            logger.error("Failed to initialize Redis", { error: err instanceof Error ? err.message : String(err) })
            return null
        }
    }

    return global.redis
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
