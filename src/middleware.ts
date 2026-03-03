import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getRedisClient } from "@/lib/redis"

// Rate limit configuration
const RATELIMIT_WINDOW = 60 // 1 minute
const MAX_REQUESTS = 30     // 30 requests per minute

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Only apply rate limiting to API routes, specifically search
    if (pathname.startsWith("/api/search")) {
        try {
            const redis = await getRedisClient()
            if (!redis) {
                // If Redis is not available, we skip rate limiting to avoid blocking the app
                return NextResponse.next()
            }

            // Get IP address for rate limiting
            const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                request.headers.get("x-real-ip") ||
                "127.0.0.1"

            const key = `ratelimit:${ip}:${pathname}`
            const current = await redis.get(key)

            if (current && parseInt(current) >= MAX_REQUESTS) {
                return new NextResponse(
                    JSON.stringify({ error: "Too many requests. Please try again later." }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "Retry-After": String(RATELIMIT_WINDOW)
                        }
                    }
                )
            }

            // Increment request count
            const multi = redis.multi()
            multi.incr(key)
            if (!current) {
                multi.expire(key, RATELIMIT_WINDOW)
            }
            await multi.exec()

        } catch (error) {
            console.error("Middleware rate limit error:", error)
        }
    }

    return NextResponse.next()
}

// Ensure middleware only runs on relevant paths
export const config = {
    matcher: "/api/:path*",
}
