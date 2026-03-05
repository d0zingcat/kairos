"use client"

import { useI18n } from "@/components/i18n/i18n-provider"

export function DashboardHeader() {
  const { t } = useI18n()

  return (
    <div>
      <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
        {t("dashboard.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("dashboard.subtitle")}
      </p>
    </div>
  )
}
