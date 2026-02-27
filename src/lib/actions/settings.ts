"use server"

import { verifyAdminSession } from "@/lib/auth"
import { setStoredSiteVisibility } from "@/lib/site-settings"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { SiteVisibility } from "@/lib/site-visibility"

function isVisibility(value: string): value is SiteVisibility {
  return value === "public" || value === "private" || value === "password"
}

export async function updateVisibilityAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    redirect("/login")
  }

  const value = String(formData.get("visibility") ?? "")
  if (!isVisibility(value)) {
    return { error: "无效的可见性设置" }
  }

  try {
    await setStoredSiteVisibility(value)
  } catch {
    return { error: "保存失败：请先执行 bun run db:push 同步数据库结构" }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
  revalidatePath("/login")

  return { success: "设置已保存" }
}
