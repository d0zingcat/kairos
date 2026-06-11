import { getI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type SiteAttributionProps = {
  className?: string
}

export async function SiteAttribution({ className }: SiteAttributionProps) {
  const { t } = await getI18n()

  return (
    <div className={cn("space-y-1 text-xs text-muted-foreground", className)}>
      <p>{t("home.tmdbAttribution")}</p>
      <p>{t("home.dataSources")}</p>
    </div>
  )
}
