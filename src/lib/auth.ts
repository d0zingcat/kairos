import { compare } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
)

const COOKIE_NAME = "kairos-session"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function normalizeHash(value: string): string {
  const trimmed = value.trim()
  const unquoted = trimmed.replace(/^['"]|['"]$/g, "")
  return unquoted.replace(/\\\$/g, "$")
}

function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value)
}

function extractHashFromDotEnv(): string | null {
  try {
    const content = readFileSync(join(process.cwd(), ".env"), "utf8")
    const line = content
      .split("\n")
      .find((entry) => entry.trim().startsWith("ADMIN_PASSWORD_HASH="))

    if (!line) {
      return null
    }

    const rawValue = line.slice(line.indexOf("=") + 1)
    const normalized = normalizeHash(rawValue)
    return isBcryptHash(normalized) ? normalized : null
  } catch {
    return null
  }
}

function getAdminPasswordHash(): string {
  const fromEnv = process.env.ADMIN_PASSWORD_HASH
  if (fromEnv) {
    const normalized = normalizeHash(fromEnv)
    if (isBcryptHash(normalized)) {
      return normalized
    }
  }

  const fromDotEnv = extractHashFromDotEnv()
  if (fromDotEnv) {
    return fromDotEnv
  }

  throw new Error("ADMIN_PASSWORD_HASH not configured")
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = getAdminPasswordHash()
  return compare(password, hash)
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  return token
}

export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return false

    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
