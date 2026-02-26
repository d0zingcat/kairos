"use server"

import { verifyPassword, createSession, destroySession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const password = formData.get("password") as string

  if (!password) {
    return { error: "请输入密码" }
  }

  const valid = await verifyPassword(password)

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
