"use client"

import { useActionState, useState } from "react"
import { Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleProfileVisibilityAction } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"

export function ProfileVisibilityForm({
  initialPublic,
}: {
  initialPublic: boolean
}) {
  const [isPublicProfile, setIsPublicProfile] = useState(initialPublic)
  const [state, formAction, isPending] = useActionState<
    { error?: string; success?: string } | null,
    FormData
  >(toggleProfileVisibilityAction, null)

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-5">
      <input type="hidden" name="isPublicProfile" value={String(isPublicProfile)} />

      <div className="flex items-start gap-3">
        <Globe className="mt-0.5 h-4 w-4 text-sky-300" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">公开广场可见性</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            开启后，你的摘要统计与最近动态会出现在广场页面。
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
              <p className={cn("text-sm font-medium", isPublicProfile ? "text-foreground" : "text-foreground/85")}>公开到广场</p>
              <p className="mt-0.5 text-xs text-muted-foreground">其他人可在广场看到你的摘要动态</p>
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
              <p className={cn("text-sm font-medium", !isPublicProfile ? "text-foreground" : "text-foreground/85")}>仅自己可见</p>
              <p className="mt-0.5 text-xs text-muted-foreground">你的摘要不会出现在广场</p>
            </div>
          </div>
        </button>
      </div>

      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-400">{state.success}</p> : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700"
        >
          {isPending ? "保存中..." : "保存公开设置"}
        </Button>
      </div>
    </form>
  )
}
