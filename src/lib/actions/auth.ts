"use server"

import {
  createUserSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyUserPassword,
} from "@/lib/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { count, eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const rawUsername = formData.get("username")
  const username = typeof rawUsername === "string" ? rawUsername.trim().toLowerCase() : ""
  const rawPassword = formData.get("password")
  const password = typeof rawPassword === "string" ? rawPassword.trim() : ""
  const rawNext = formData.get("next")
  const nextPath = typeof rawNext === "string" ? rawNext.trim() : ""
  const redirectPath = nextPath.startsWith("/") && !nextPath.startsWith("//")
    ? nextPath
    : "/dashboard"

  if (!username || !password) {
    return { error: "请输入用户名和密码" }
  }

  let user
  try {
    user = await db.query.users.findFirst({
      where: eq(users.username, username),
    })
  } catch {
    return { error: "登录失败：数据库初始化中或连接异常，请稍后重试" }
  }

  if (!user || !user.isActive) {
    return { error: "用户名或密码错误" }
  }

  const isValid = await verifyUserPassword(password, user.passwordHash)
  if (!isValid) {
    return { error: "用户名或密码错误" }
  }

  await createUserSession(user.id, user.role)
  redirect(redirectPath)
}

// 预留用户名列表（保留给官方、管理员等）
const RESERVED_USERNAMES = [
  "admin",
  "official",
  "system",
  "root",
  "user",
  "users",
  "help",
  "support",
  "contact",
  "about",
  "privacy",
  "terms",
  "api",
  "dev",
  "developer",
  "test",
  "demo",
  "bot",
  "robots",
  "status",
  "announcements",
  "news",
  "moderator",
  "mod",
  "superuser",
  "staff",
  "team",
  "kairos",
]

export async function registerAction(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const rawUsername = formData.get("username")
  const username = typeof rawUsername === "string" ? rawUsername.trim().toLowerCase() : ""
  const rawPassword = formData.get("password")
  const password = typeof rawPassword === "string" ? rawPassword.trim() : ""
  const rawConfirmPassword = formData.get("confirmPassword")
  const confirmPassword = typeof rawConfirmPassword === "string" ? rawConfirmPassword.trim() : ""

  if (username.length < 3 || username.length > 32) {
    return { error: "用户名长度需在 3-32 之间" }
  }
  if (!/^[a-z0-9_\-.]+$/.test(username)) {
    return { error: "用户名仅支持小写字母、数字、_-." }
  }
  if (RESERVED_USERNAMES.includes(username)) {
    return { error: "该用户名为预留用户名，不可使用" }
  }
  if (password.length < 8) {
    return { error: "密码至少 8 位" }
  }
  if (password !== confirmPassword) {
    return { error: "两次输入的密码不一致" }
  }

  let existing
  try {
    existing = await db.query.users.findFirst({ where: eq(users.username, username) })
  } catch {
    return { error: "注册失败：数据库初始化中或连接异常，请稍后重试" }
  }
  if (existing) {
    return { error: "用户名已存在" }
  }

  let existingUsers = 0
  try {
    const [countRow] = await db
      .select({ value: count() })
      .from(users)
    existingUsers = countRow?.value ?? 0
  } catch {
    return { error: "注册失败：数据库初始化中或连接异常，请稍后重试" }
  }

  const passwordHash = await hashPassword(password)
  const role = existingUsers === 0 ? "admin" : "member"
  let created
  try {
    const [row] = await db.insert(users).values({
      username,
      passwordHash,
      role,
      isPublicProfile: false,
      isActive: true,
    }).returning()
    created = row
  } catch {
    return { error: "注册失败：请稍后重试" }
  }

  await createUserSession(created.id, created.role)
  redirect("/dashboard")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}

export async function toggleProfileVisibilityAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const value = String(formData.get("isPublicProfile") ?? "false")
  const isPublicProfile = value === "true"

  await db
    .update(users)
    .set({ isPublicProfile })
    .where(eq(users.id, user.id))

  revalidatePath("/dashboard/settings")
  revalidatePath("/plaza")
  revalidatePath(`/u/${user.username}`)

  return { success: isPublicProfile ? "已公开个人主页" : "已设为私密" }
}

export async function togglePlazaVisibilityAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }

  const value = String(formData.get("publishToPlaza") ?? "false")
  const publishToPlaza = value === "true"

  await db
    .update(users)
    .set({ publishToPlaza })
    .where(eq(users.id, user.id))

  revalidatePath("/dashboard/settings")
  revalidatePath("/plaza")

  return { success: publishToPlaza ? "已发布到广场" : "已取消广场发布" }
}
