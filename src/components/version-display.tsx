"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, ArrowUpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface VersionInfo {
  current: string
  latest: string
  hasUpdate: boolean
  releaseUrl: string | null
  publishedAt: string | null
  error?: string
}

export function VersionDisplay() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        setVersionInfo(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setVersionInfo({
          current: "unknown",
          latest: "unknown",
          hasUpdate: false,
          releaseUrl: null,
          publishedAt: null,
          error: err instanceof Error ? err.message : "Failed to check version",
        })
        setIsLoading(false)
      })
  }, [])

  if (isLoading || !versionInfo) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span>检查版本...</span>
      </div>
    )
  }

  const { current, latest, hasUpdate, releaseUrl, error } = versionInfo

  // Error state - only show for actual errors (not 404)
  if (error && error !== "GITHUB_REPO not configured") {
    return (
      <div
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground"
        role="status"
        aria-label="Version check failed"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="font-mono">v{current}</span>
      </div>
    )
  }

  // Config error - hide version display
  if (error === "GITHUB_REPO not configured") {
    return (
      <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground">
        <span className="font-mono">v{current}</span>
      </div>
    )
  }

  // Has update - show yellow/amber indicator with upgrade prompt
  if (hasUpdate && releaseUrl) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={releaseUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20"
              role="status"
              aria-label={`New version ${latest} available`}
            >
              <ArrowUpCircle className="h-3.5 w-3.5" />
              <span className="font-mono">v{current}</span>
              <ArrowUpCircle className="h-3 w-3" />
            </a>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs" sideOffset={8}>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-amber-600">
                <ArrowUpCircle className="h-3.5 w-3.5" />
                <span className="font-medium">发现新版本</span>
              </div>
              <div className="flex items-center justify-between">
                <span>当前</span>
                <span className="font-mono">v{current}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>最新</span>
                <span className="font-mono">v{latest}</span>
              </div>
              <div className="pt-1 text-muted-foreground">
                点击前往 GitHub 查看更新
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // No update - show normal version with check icon
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors"
            role="status"
            aria-label={`Current version ${current} is up to date`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-mono">v{current}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs" sideOffset={8}>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium">当前版本</span>
              <span className="font-mono">v{current}</span>
            </div>
            <div className="pt-1 text-green-600">
              <CheckCircle2 className="inline h-3 w-3 mr-1" />
              已是最新版本
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
