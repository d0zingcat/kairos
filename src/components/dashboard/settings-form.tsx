"use client"

import { useActionState, useState } from "react"
import { useTranslation } from "@/components/i18n/i18n-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SiteVisibility } from "@/lib/site-visibility"
import { updateVisibilityAction } from "@/lib/actions/settings"
import { Globe, Lock, Shield, Download } from "lucide-react"

export function SettingsForm({
  initialVisibility,
}: {
  initialVisibility: SiteVisibility
}) {
  const { t } = useTranslation()
  const [visibility, setVisibility] = useState<SiteVisibility>(initialVisibility)
  const [state, formAction, isPending] = useActionState(updateVisibilityAction, null)

  const OPTIONS: Array<{
    value: SiteVisibility
    title: string
    description: string
    icon: typeof Globe
  }> = [
      {
        value: "public",
        title: t("settings.public"),
        description: t("settings.publicDesc"),
        icon: Globe,
      },
      {
        value: "private",
        title: t("settings.private"),
        description: t("settings.privateDesc"),
        icon: Shield,
      },
      {
        value: "password",
        title: t("settings.passwordProtected"),
        description: t("settings.passwordProtectedDesc"),
        icon: Lock,
      },
    ]

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border/60 bg-card/50 p-5">
      <input type="hidden" name="visibility" value={visibility} />

      <div className="space-y-3">
        {OPTIONS.map((option) => {
          const selected = visibility === option.value
          const Icon = option.icon
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setVisibility(option.value)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                selected
                  ? "border-amber-500/60 bg-amber-500/10"
                  : "border-border bg-card/70 hover:bg-accent/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", selected ? "text-amber-300" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-medium", selected ? "text-foreground" : "text-foreground/85")}>
                    {option.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {t("settings.passwordNote")}
        </p>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
        >
          {isPending ? t("settings.saving") : t("settings.saveSettings")}
        </Button>
      </div>

      <div className="pt-4 border-t border-border/40">
        <h3 className="text-sm font-medium mb-3">{t("settings.dataManagement")}</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.href = "/api/export"}
          className="w-full flex items-center justify-center gap-2 border-border/60 hover:bg-accent/50 group"
        >
          <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>{t("settings.exportJson")}</span>
        </Button>
        <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
          {t("settings.exportDesc")}
        </p>
      </div>
    </form>
  )
}
