"use server"

import { verifyPassword, createSession, destroySession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const rawPassword = formData.get("password")
  const password = typeof rawPassword === "string" ? rawPassword.trim() : ""

  if (!password) {
    return { error: "请输入密码" }
  }

  let valid = false
  try {
    valid = await verifyPassword(password)
  } catch {
    return { error: "登录配置错误：请检查 ADMIN_PASSWORD_HASH" }
  }

  if (!valid) {
    return { error: "密码错误" }
  }

  await createSession()
  redirect("/dashboard")
}

export async function logoutAction() {
  await destroySession()
  redirect("/login")
}
