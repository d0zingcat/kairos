export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/auth"
import { getStoredSiteVisibility } from "@/lib/site-settings"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { ShieldCheck } from "lucide-react"

export default async function SettingsPage() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    redirect("/login")
  }

  const visibility = await getStoredSiteVisibility()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-amber-400" />
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
            管理设置
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            配置站点访问模式（公开 / 私有 / 密码保护）
          </p>
        </div>
      </div>

      <SettingsForm initialVisibility={visibility} />
    </div>
  )
}
