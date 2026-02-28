import { compare, hash } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { db } from "@/db"
import { users } from "@/db/schema"
import { and, eq } from "drizzle-orm"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
)

const SESSION_COOKIE_NAME = "kairos-session"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

type SessionRole = "admin" | "member"

type SessionPayload = {
  userId: string
  role: SessionRole
}

async function createSessionToken(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET)

  return token
}

export async function createUserSession(userId: string, role: SessionRole): Promise<string> {
  const token = await createSessionToken({ userId, role })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })
  return token
}

async function getSessionPayload(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = typeof payload.userId === "string" ? payload.userId : null
    const role = payload.role === "admin" || payload.role === "member" ? payload.role : null

    if (!userId || !role) {
      return null
    }

    return { userId, role }
  } catch {
    return null
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const session = await getSessionPayload()
  return session?.role === "admin"
}

export async function verifyUserPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash)
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

export async function getCurrentUser() {
  const session = await getSessionPayload()
  if (!session) {
    return null
  }

  let user
  try {
    user = await db.query.users.findFirst({
      where: and(
        eq(users.id, session.userId),
        eq(users.isActive, true)
      ),
    })
  } catch {
    return null
  }

  if (!user) {
    return null
  }

  return user
}

export async function verifySession(): Promise<boolean> {
  const user = await getCurrentUser()
  return Boolean(user)
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
