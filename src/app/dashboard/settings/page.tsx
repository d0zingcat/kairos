export const dynamic = "force-dynamic"

import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { GoodreadsImportCard } from "@/components/dashboard/goodreads-import-card"
import { ProfileVisibilityForm } from "@/components/dashboard/profile-visibility-form"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Download, ScrollText } from "lucide-react"
import { getI18n } from "@/lib/i18n"

export default async function SettingsPage() {
  const { t } = await getI18n()
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/login?next=%2Fdashboard%2Fsettings")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-amber-400" />
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
            {t("nav.settings")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("settings.description")}
          </p>
        </div>
      </div>

      <ProfileVisibilityForm 
        initialPublicProfile={currentUser.isPublicProfile} 
        initialPublishToPlaza={currentUser.publishToPlaza ?? false} 
      />
      <GoodreadsImportCard />

      <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-sm font-medium">{t("nav.changelog")}</h2>
        </div>
        <Button asChild variant="outline" className="w-full border-border/60 hover:bg-accent/50">
          <Link href="/dashboard/changelog">{t("settings.openChangelog")}</Link>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">{t("settings.changelogDesc")}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Download className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-sm font-medium">{t("settings.dataManagement")}</h2>
        </div>
        <Button asChild variant="outline" className="w-full border-border/60 hover:bg-accent/50">
          <a href="/api/export">{t("settings.exportJson")}</a>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">{t("settings.exportDesc")}</p>
      </div>
    </div>
  )
}
