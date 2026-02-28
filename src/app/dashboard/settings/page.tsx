export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoredSiteVisibility } from "@/lib/site-settings"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { GoodreadsImportCard } from "@/components/dashboard/goodreads-import-card"
import { ProfileVisibilityForm } from "@/components/dashboard/profile-visibility-form"
import { ShieldCheck } from "lucide-react"

export default async function SettingsPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/login")
  }

  const isAdmin = currentUser.role === "admin"

  const visibility = isAdmin ? await getStoredSiteVisibility() : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-amber-400" />
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
            设置
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            你的公开可见性与系统配置
          </p>
        </div>
      </div>

      <ProfileVisibilityForm initialPublic={currentUser.isPublicProfile} />
      <GoodreadsImportCard />

      {isAdmin && visibility ? (
        <>
          <SettingsForm initialVisibility={visibility} />
        </>
      ) : null}
    </div>
  )
}
