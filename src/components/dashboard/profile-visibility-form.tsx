"use client"

import { useActionState, useState } from "react"
import { Globe, Lock, Users, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleProfileVisibilityAction, togglePlazaVisibilityAction } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/i18n/i18n-provider"

export function ProfileVisibilityForm({
  initialPublicProfile,
  initialPublishToPlaza,
}: {
  initialPublicProfile: boolean
  initialPublishToPlaza: boolean
}) {
  const { t } = useTranslation()
  const [isPublicProfile, setIsPublicProfile] = useState(initialPublicProfile)
  const [publishToPlaza, setPublishToPlaza] = useState(initialPublishToPlaza)
  
  const [profileState, profileAction, profilePending] = useActionState<
    { error?: string; success?: string } | null,
    FormData
  >(toggleProfileVisibilityAction, null)
  
  const [plazaState, plazaAction, plazaPending] = useActionState<
    { error?: string; success?: string } | null,
    FormData
  >(togglePlazaVisibilityAction, null)

  return (
    <div className="space-y-6 rounded-2xl border border-border/60 bg-card/50 p-5">
      <div>
        <form action={plazaAction} className="space-y-4">
          <input type="hidden" name="publishToPlaza" value={String(publishToPlaza)} />

          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-4 w-4 text-sky-300" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t("privacy.plazaTitle")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("privacy.plazaDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setPublishToPlaza(true)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                publishToPlaza
                  ? "border-emerald-500/60 bg-emerald-500/10"
                  : "border-border bg-card/70 hover:bg-accent/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Globe className={cn("h-4 w-4", publishToPlaza ? "text-emerald-300" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-medium", publishToPlaza ? "text-foreground" : "text-foreground/85")}>
                    {t("privacy.plazaPublic")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t("privacy.plazaPublicDesc")}</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPublishToPlaza(false)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                !publishToPlaza
                  ? "border-amber-500/60 bg-amber-500/10"
                  : "border-border bg-card/70 hover:bg-accent/70"
              )}
            >
              <div className="flex items-center gap-3">
                <EyeOff className={cn("h-4 w-4", !publishToPlaza ? "text-amber-300" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-medium", !publishToPlaza ? "text-foreground" : "text-foreground/85")}>
                    {t("privacy.plazaPrivate")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t("privacy.plazaPrivateDesc")}</p>
                </div>
              </div>
            </button>
          </div>

          {plazaState?.error ? <p className="text-sm text-red-400">{plazaState.error}</p> : null}
          {plazaState?.success ? <p className="text-sm text-emerald-400">{plazaState.success}</p> : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={plazaPending}
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
            >
              {plazaPending ? t("privacy.saving") : t("privacy.savePlazaSettings")}
            </Button>
          </div>
        </form>
      </div>

      <div className="border-t border-border/60 pt-4">
        <form action={profileAction} className="space-y-4">
          <input type="hidden" name="isPublicProfile" value={String(isPublicProfile)} />

          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-4 w-4 text-purple-300" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t("privacy.profileTitle")}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("privacy.profileDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIsPublicProfile(true)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                isPublicProfile
                  ? "border-emerald-500/60 bg-emerald-500/10"
                  : "border-border bg-card/70 hover:bg-accent/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Globe className={cn("h-4 w-4", isPublicProfile ? "text-emerald-300" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-medium", isPublicProfile ? "text-foreground" : "text-foreground/85")}>
                    {t("privacy.profilePublic")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t("privacy.profilePublicDesc")}</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPublicProfile(false)}
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                !isPublicProfile
                  ? "border-amber-500/60 bg-amber-500/10"
                  : "border-border bg-card/70 hover:bg-accent/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Lock className={cn("h-4 w-4", !isPublicProfile ? "text-amber-300" : "text-muted-foreground")} />
                <div>
                  <p className={cn("text-sm font-medium", !isPublicProfile ? "text-foreground" : "text-foreground/85")}>
                    {t("privacy.profilePrivate")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t("privacy.profilePrivateDesc")}</p>
                </div>
              </div>
            </button>
          </div>

          {profileState?.error ? <p className="text-sm text-red-400">{profileState.error}</p> : null}
          {profileState?.success ? <p className="text-sm text-emerald-400">{profileState.success}</p> : null}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={profilePending}
              className="bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700"
            >
              {profilePending ? t("privacy.saving") : t("privacy.saveProfileSettings")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
