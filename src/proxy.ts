import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
)

const PUBLIC_PATHS = ["/", "/login", "/api/auth/login"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    PUBLIC_PATHS.some((path) => pathname === path) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("kairos-session")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}