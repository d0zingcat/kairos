"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SiteVisibility } from "@/lib/site-visibility"
import { updateVisibilityAction } from "@/lib/actions/settings"
import { Globe, Lock, Shield, Download } from "lucide-react"

const OPTIONS: Array<{
  value: SiteVisibility
  title: string
  description: string
  icon: typeof Globe
}> = [
    {
      value: "public",
      title: "公开",
      description: "任何人都可浏览，只有管理员可编辑。",
      icon: Globe,
    },
    {
      value: "private",
      title: "私有",
      description: "只有管理员可以访问与编辑。",
      icon: Shield,
    },
    {
      value: "password",
      title: "密码保护",
      description: "输入访问密码后可浏览，管理员密码可编辑。",
      icon: Lock,
    },
  ]

export function SettingsForm({
  initialVisibility,
}: {
  initialVisibility: SiteVisibility
}) {
  const [visibility, setVisibility] = useState<SiteVisibility>(initialVisibility)
  const [state, formAction, isPending] = useActionState(updateVisibilityAction, null)

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
          密码保护模式使用 `VIEWER_PASSWORD_HASH`（未配置时回退管理员密码）。
        </p>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
        >
          {isPending ? "保存中..." : "保存设置"}
        </Button>
      </div>

      <div className="pt-4 border-t border-border/40">
        <h3 className="text-sm font-medium mb-3">数据管理</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.href = "/api/export"}
          className="w-full flex items-center justify-center gap-2 border-border/60 hover:bg-accent/50 group"
        >
          <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span>导出为 JSON 备份</span>
        </Button>
        <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
          导出的文件包含您的所有书、影、音、游记录及评价，可用于本地备份或未来的数据迁移。
        </p>
      </div>
    </form>
  )
}
