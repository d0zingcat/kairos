import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

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
