"use client"

import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { MEDIA_TYPES, type MediaType } from "@/lib/constants"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface TimelineItem {
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
}

export function RecentTimeline({ items }: RecentTimelineProps) {
  if (items.length === 0) {
    return (
      <div>
        <h2 className="mb-4 font-mono text-lg font-semibold text-zinc-100">
          最近活动
        </h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16">
          <p className="text-sm text-zinc-500">还没有记录</p>
          <p className="mt-1 text-xs text-zinc-600">
            按 ⌘K 开始录入
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 font-mono text-lg font-semibold text-zinc-100">
        最近活动
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
              className="group flex items-center gap-3 rounded-lg border border-zinc-800/40 bg-zinc-900/30 p-3 transition-colors hover:bg-zinc-800/30"
            >
              {cover ? (
                <img
                  src={cover}
                  alt={item.title}
                  className="h-12 w-9 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-9 items-center justify-center rounded bg-zinc-800">
                  <config.icon className="h-4 w-4 text-zinc-600" />
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {item.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={`shrink-0 border-none text-[10px] ${config.color}`}
                  >
                    {config.label}
                  </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  {item.rating && item.rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-zinc-400">
                        {item.rating / 2}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-zinc-600">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: zhCN,
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
