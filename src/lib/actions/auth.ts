"use server"

import {
  verifyAdminPassword,
  verifyViewerPassword,
  createAdminSession,
  createViewerSession,
  destroySession,
} from "@/lib/auth"
import { getStoredSiteVisibility } from "@/lib/site-settings"
import { redirect } from "next/navigation"

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const visibility = await getStoredSiteVisibility()
  const rawPassword = formData.get("password")
  const password = typeof rawPassword === "string" ? rawPassword.trim() : ""

  if (!password) {
    return { error: "请输入密码" }
  }

  try {
    const isAdmin = await verifyAdminPassword(password)
    if (isAdmin) {
      await createAdminSession()
      redirect("/dashboard")
    }

    if (visibility === "password") {
      const isViewer = await verifyViewerPassword(password)
      if (isViewer) {
        await createViewerSession()
        redirect("/dashboard")
      }
    }
  } catch {
    return {
      error:
        visibility === "password"
          ? "登录配置错误：请检查 ADMIN_PASSWORD_HASH / VIEWER_PASSWORD_HASH"
          : "登录配置错误：请检查 ADMIN_PASSWORD_HASH",
    }
  }

  return {
    error:
      visibility === "password"
        ? "访问密码或管理员密码错误"
        : "管理员密码错误",
  }
}

export async function logoutAction() {
  const visibility = await getStoredSiteVisibility()
  await destroySession()
  redirect(visibility === "public" ? "/dashboard" : "/login")
}
