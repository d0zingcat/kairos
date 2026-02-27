import { compare } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
)

const ADMIN_COOKIE_NAME = "kairos-admin-session"
const VIEWER_COOKIE_NAME = "kairos-viewer-session"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function normalizeHash(value: string): string {
  const trimmed = value.trim()
  const unquoted = trimmed.replace(/^['"]|['"]$/g, "")
  return unquoted.replace(/\\\$/g, "$")
}

function isBcryptHash(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value)
}

function extractHashFromDotEnv(key: string): string | null {
  try {
    const content = readFileSync(join(process.cwd(), ".env"), "utf8")
    const line = content
      .split("\n")
      .find((entry) => entry.trim().startsWith(`${key}=`))

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
  // In development, prefer reading the latest .env content to avoid
  // stale process.env values when runtime was not fully restarted.
  if (process.env.NODE_ENV !== "production") {
    const fromDotEnv = extractHashFromDotEnv("ADMIN_PASSWORD_HASH")
    if (fromDotEnv) {
      return fromDotEnv
    }
  }

  const fromEnv = process.env.ADMIN_PASSWORD_HASH
  if (fromEnv) {
    const normalized = normalizeHash(fromEnv)
    if (isBcryptHash(normalized)) {
      return normalized
    }
  }

  const fromDotEnv = extractHashFromDotEnv("ADMIN_PASSWORD_HASH")
  if (fromDotEnv) {
    return fromDotEnv
  }

  throw new Error("ADMIN_PASSWORD_HASH not configured")
}

function getViewerPasswordHash(): string {
  if (process.env.NODE_ENV !== "production") {
    const fromDotEnv = extractHashFromDotEnv("VIEWER_PASSWORD_HASH")
    if (fromDotEnv) {
      return fromDotEnv
    }
  }

  const fromEnv = process.env.VIEWER_PASSWORD_HASH
  if (fromEnv) {
    const normalized = normalizeHash(fromEnv)
    if (isBcryptHash(normalized)) {
      return normalized
    }
  }

  const fromDotEnv = extractHashFromDotEnv("VIEWER_PASSWORD_HASH")
  if (fromDotEnv) {
    return fromDotEnv
  }

  // Fallback to admin password when viewer password is not configured.
  return getAdminPasswordHash()
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = getAdminPasswordHash()
  return compare(password, hash)
}

export async function verifyViewerPassword(password: string): Promise<boolean> {
  const hash = getViewerPasswordHash()
  return compare(password, hash)
}

async function createSessionToken(role: "admin" | "viewer"): Promise<string> {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET)

  return token
}

export async function createAdminSession(): Promise<string> {
  const token = await createSessionToken("admin")
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
  cookieStore.delete(VIEWER_COOKIE_NAME)
  return token
}

export async function createViewerSession(): Promise<string> {
  const token = await createSessionToken("viewer")
  const cookieStore = await cookies()
  cookieStore.set(VIEWER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  return token
}

async function verifyRoleSession(cookieName: string, role: "admin" | "viewer"): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName)?.value
    if (!token) return false

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.role === role
  } catch {
    return false
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  return verifyRoleSession(ADMIN_COOKIE_NAME, "admin")
}

export async function verifyViewerSession(): Promise<boolean> {
  return verifyRoleSession(VIEWER_COOKIE_NAME, "viewer")
}

export async function verifySession(): Promise<boolean> {
  return verifyAdminSession()
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
  cookieStore.delete(VIEWER_COOKIE_NAME)
}
