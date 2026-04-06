"use client"

import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { useTranslation } from "@/components/i18n/i18n-provider"
import { enUS, zhCN } from "date-fns/locale"
import { MEDIA_TYPES, type MediaType } from "@/lib/constants"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RecentShareDialog } from "@/components/dashboard/recent-share-dialog"
import { canShareRecentActivity, type ShareProfileUser } from "@/lib/share"

export interface TimelineItem {
  id: string
  title: string
  mediaType: MediaType
  rating: number | null
  notes: string | null
  coverUrl?: string | null
  posterUrl?: string | null
  createdAt: Date
}

interface RecentTimelineProps {
  items: TimelineItem[]
  shareUser?: ShareProfileUser | null
}

export function RecentTimeline({ items, shareUser = null }: RecentTimelineProps) {
  const { t, locale } = useTranslation()
  const dateLocale = locale === "zh" ? zhCN : enUS

  if (items.length === 0) {
    return (
      <div>
        <h2 className="mb-4 font-mono text-lg font-semibold text-foreground">
          {t("dashboard.recentActivity")}
        </h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("dashboard.startEntry")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 font-mono text-lg font-semibold text-foreground">
        {t("dashboard.recentActivity")}
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => {
          const config = MEDIA_TYPES[item.mediaType]
          const cover = item.coverUrl || item.posterUrl
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card/60 p-3 transition-colors hover:bg-accent/70"
            >
              {cover ? (
                <Image
                  src={cover}
                  alt={item.title}
                  width={36}
                  height={48}
                  unoptimized
                  className="h-12 w-9 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-9 items-center justify-center rounded bg-muted">
                  <config.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground/90">
                      {item.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={`shrink-0 border-none text-[10px] ${config.color}`}
                    >
                      {t(`media.${item.mediaType}`)}
                    </Badge>
                  </div>
                  {i === 0 && shareUser && canShareRecentActivity(shareUser) ? (
                    <RecentShareDialog item={item} shareUser={shareUser} />
                  ) : null}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  {item.rating && item.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-muted-foreground">
                        {item.rating / 2}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
