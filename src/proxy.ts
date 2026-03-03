import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { getRedisClient } from "@/lib/redis"

// Rate limit configuration
const RATELIMIT_WINDOW = 60 // 1 minute
const MAX_REQUESTS = 30     // 30 requests per minute

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
)

const SESSION_COOKIE_NAME = "kairos-session"
const ADMIN_ONLY_PREFIXES: string[] = []

async function hasRoleSession(token: string | undefined, role: "admin" | "member") {
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.role === role
  } catch {
    return false
  }
}

function deny(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("next", request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Rate limiting for search API
  if (pathname.startsWith("/api/search")) {
    try {
      const redis = await getRedisClient()
      if (redis) {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
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
                "Retry-After": String(RATELIMIT_WINDOW),
              },
            }
          )
        }

        const multi = redis.multi()
        multi.incr(key)
        if (!current) {
          multi.expire(key, RATELIMIT_WINDOW)
        }
        await multi.exec()
      }
    } catch (error) {
      console.error("Rate limit error:", error)
    }
  }

  const adminToken = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const isAdmin = await hasRoleSession(adminToken, "admin")

  if (ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix)) && !isAdmin) {
    return deny(request)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
