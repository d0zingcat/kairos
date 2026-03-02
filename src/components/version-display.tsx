"use client"

import { useEffect, useState } from "react"
import { ExternalLink, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  // Error state
  if (error) {
    return (
      <div
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground"
        role="status"
        aria-label="Version check failed"
      >
        <XCircle className="h-3.5 w-3.5 text-destructive" />
        <span className="font-mono">v{current}</span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${
              hasUpdate
                ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                : "text-muted-foreground"
            }`}
            role="status"
            aria-label={`Version ${current}${hasUpdate ? ", update available" : ""}`}
          >
            {hasUpdate ? (
              <AlertCircle className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            <span className="font-mono">v{current}</span>
            {hasUpdate && (
              <span className="font-medium text-amber-600">有新版本</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs" sideOffset={8}>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium">当前版本</span>
              <span className="font-mono">v{current}</span>
            </div>
            {hasUpdate && releaseUrl && (
              <>
                <div className="flex items-center gap-2 text-amber-600">
                  <span className="font-medium">最新版本</span>
                  <span className="font-mono">v{latest}</span>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  asChild
                  className="h-auto p-0 text-amber-600 hover:text-amber-700"
                >
                  <a href={releaseUrl} target="_blank" rel="noreferrer">
                    查看更新
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
