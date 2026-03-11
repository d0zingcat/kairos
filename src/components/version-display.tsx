"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, ArrowUpCircle, AlertCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useI18n } from "@/components/i18n/i18n-provider"

interface VersionInfo {
  current: string
  latest: string
  hasUpdate: boolean
  status?: "up-to-date" | "update-available" | "unknown"
  releaseUrl: string | null
  publishedAt: string | null
  error?: string
}

export function VersionDisplay() {
  const { t } = useI18n()
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/version", { cache: "no-store" })
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
        <span>{t("version.checking")}</span>
      </div>
    )
  }

  const { current, latest, hasUpdate, releaseUrl, error, status } = versionInfo

  if (error && error !== "GITHUB_REPO not configured") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground"
              role="status"
              aria-label="Version check failed"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="font-mono">v{current}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs" sideOffset={8}>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="font-medium">{t("version.unableToCheck")}</span>
              </div>
              <div className="text-muted-foreground">{error}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

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
                <span className="font-medium">{t("version.foundNew")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("version.current")}</span>
                <span className="font-mono">v{current}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("version.latest")}</span>
                <span className="font-mono">v{latest}</span>
              </div>
              <div className="pt-1 text-muted-foreground">
                {t("version.goToGithub")}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (status === "unknown") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors"
              role="status"
              aria-label={`Current version ${current} could not be verified`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="font-mono">v{current}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs" sideOffset={8}>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="font-medium">{t("version.unableToCheck")}</span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

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
              <span className="font-medium">{t("version.currentVersion")}</span>
              <span className="font-mono">v{current}</span>
            </div>
            <div className="pt-1 text-green-600">
              <CheckCircle2 className="inline h-3 w-3 mr-1" />
              {t("version.upToDate")}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
