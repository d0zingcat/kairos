"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import QRCode from "qrcode"
import { formatDistanceToNow } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { Globe2, Share2, Sparkles, Star } from "lucide-react"
import { useTranslation } from "@/components/i18n/i18n-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MEDIA_TYPES, type MediaType } from "@/lib/constants"
import { createLogger } from "@/lib/logger"
import { buildPublicProfilePath, buildPublicProfileUrl, type ShareProfileUser } from "@/lib/share"

const logger = createLogger("dashboard/recent-share-dialog")

type ShareTimelineItem = {
  id: string
  title: string
  mediaType: MediaType
  rating: number | null
  notes: string | null
  coverUrl?: string | null
  posterUrl?: string | null
  createdAt: Date
}

interface RecentShareDialogProps {
  item: ShareTimelineItem
  shareUser: ShareProfileUser
}

export function RecentShareDialog({ item, shareUser }: RecentShareDialogProps) {
  const { t, locale } = useTranslation()
  const [open, setOpen] = useState(false)
  const [qrSvg, setQrSvg] = useState<string | null>(null)

  const dateLocale = locale === "zh" ? zhCN : enUS
  const cover = item.coverUrl || item.posterUrl
  const config = MEDIA_TYPES[item.mediaType]
  const profilePath = buildPublicProfilePath(shareUser.username)

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false
    const origin = window.location.origin
    const target = buildPublicProfileUrl(origin, shareUser.username)

    QRCode.toString(target, {
      color: {
        dark: "#09090b",
        light: "#0000",
      },
      errorCorrectionLevel: "M",
      margin: 1,
      type: "svg",
      width: 180,
    })
      .then((svg: string) => {
        if (!cancelled) {
          setQrSvg(svg)
        }
      })
      .catch((error: unknown) => {
        logger.error("failed to generate QR code", {
          error: error instanceof Error ? error.message : String(error),
          username: shareUser.username,
        })

        if (!cancelled) {
          setQrSvg(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, shareUser.username])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-3.5 w-3.5" />
          {t("dashboard.share")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/60 bg-background p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-6 pt-6 pb-4">
          <DialogTitle className="font-mono text-xl tracking-tight">
            {t("dashboard.shareLatestTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("dashboard.shareLatestDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-[22rem]">
            <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl shadow-zinc-950/30">
              <div className="relative aspect-[9/16] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,244,245,0.18),_transparent_34%),linear-gradient(165deg,_rgba(24,24,27,0.98),_rgba(9,9,11,1)_62%)]" />
                <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-emerald-400/12 blur-3xl" />
                <div className="absolute bottom-20 left-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

                <div className="relative flex h-full flex-col p-5 text-zinc-50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-400">
                        Kairos
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-200">
                        {t("dashboard.shareCardLabel")}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-200">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={item.title}
                        width={512}
                        height={512}
                        unoptimized
                        className="aspect-[4/5] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center bg-white/5">
                        <config.icon className="h-14 w-14 text-zinc-500" />
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-2xl font-semibold tracking-tight text-white">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-400">
                          @{shareUser.username}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 border-none text-[10px] ${config.color}`}
                      >
                        {t(`media.${item.mediaType}`)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      {item.rating && item.rating > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-amber-100">
                          <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                          {item.rating / 2}
                        </span>
                      ) : null}
                      <span>
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </span>
                    </div>

                    {item.notes ? (
                      <p className="line-clamp-4 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-zinc-200">
                        {item.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-auto rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                      <Globe2 className="h-3.5 w-3.5" />
                      {t("dashboard.shareQrTitle")}
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="rounded-2xl bg-white p-2 shadow-lg shadow-black/20">
                        {qrSvg ? (
                          <div
                            aria-label={t("dashboard.shareQrTitle")}
                            className="h-28 w-28"
                            dangerouslySetInnerHTML={{ __html: qrSvg }}
                          />
                        ) : (
                          <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-zinc-100 text-xs text-zinc-500">
                            QR
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-100">
                          {t("dashboard.shareQrHint")}
                        </p>
                        <p className="mt-1 break-all text-xs leading-5 text-zinc-400">
                          {profilePath}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-4 max-w-sm text-center text-sm text-muted-foreground">
            {t("dashboard.shareScreenshotHint")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
