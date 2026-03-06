export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getStoredSiteVisibility } from "@/lib/site-settings"
import { SettingsForm } from "@/components/dashboard/settings-form"
import { GoodreadsImportCard } from "@/components/dashboard/goodreads-import-card"
import { ProfileVisibilityForm } from "@/components/dashboard/profile-visibility-form"
import { VersionDisplay } from "@/components/version-display"
import { ShieldCheck, Github } from "lucide-react"
import { getI18n } from "@/lib/i18n"

export default async function SettingsPage() {
  const { t } = await getI18n()
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/login?next=%2Fdashboard%2Fsettings")
  }

  const isAdmin = currentUser.role === "admin"

  const visibility = isAdmin ? await getStoredSiteVisibility() : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-amber-400" />
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {t("nav.settings")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("visibility.description")}
          </p>
        </div>
      </div>

      {/* Version & GitHub Link Section */}
      <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-sm font-medium">{t("settings.versionTitle")}</h2>
          </div>
          <VersionDisplay />
        </div>
        <p className="text-xs text-muted-foreground">
          {t("settings.versionDesc")}
        </p>
      </div>

      <ProfileVisibilityForm 
        initialPublicProfile={currentUser.isPublicProfile} 
        initialPublishToPlaza={currentUser.publishToPlaza ?? false} 
      />
      <GoodreadsImportCard />

      {isAdmin && visibility ? (
        <>
          <SettingsForm initialVisibility={visibility} />
        </>
      ) : null}
    </div>
  )
}
