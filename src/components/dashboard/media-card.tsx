"use client"

import { Star, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface MediaCardProps {
  title: string
  subtitle?: string | null
  coverUrl?: string | null
  rating?: number | null
  favorite?: boolean
  status?: string | null
  statusLabel?: string
  date?: string | null
  tags?: string[] | null
  metaLines?: string[]
  note?: string | null
  index?: number
  onClick?: () => void
}

export function MediaCard({
  title,
  subtitle,
  coverUrl,
  rating,
  favorite,
  statusLabel,
  date,
  tags,
  metaLines,
  note,
  index = 0,
  onClick,
}: MediaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-zinc-800/40 bg-zinc-900/30 transition-all hover:border-zinc-700/50 hover:bg-zinc-800/30",
        onClick ? "cursor-pointer" : undefined
      )}
      onClick={onClick}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-3xl text-zinc-700">{title[0]}</span>
          </div>
        )}

        {/* Favorite badge */}
        {favorite && (
          <div className="absolute right-2 top-2">
            <Heart className="h-4 w-4 fill-rose-400 text-rose-400 drop-shadow-md" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-medium text-zinc-200">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
            {subtitle}
          </p>
        )}

        {metaLines && metaLines.length > 0 && (
          <div className="mt-2 space-y-1">
            {metaLines.map((line) => (
              <p key={line} className="line-clamp-1 text-[11px] text-zinc-500">
                {line}
              </p>
            ))}
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-zinc-700/50 px-1.5 py-0 text-[10px] text-zinc-500"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {note && (
          <p className="mt-2 line-clamp-2 text-[11px] text-zinc-500">“{note}”</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          {rating && rating > 0 ? (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-zinc-400">
                {rating / 2}
              </span>
            </div>
          ) : null}
          {statusLabel && (
            <Badge
              variant="outline"
              className="border-zinc-700/50 text-[10px] text-zinc-500"
            >
              {statusLabel}
            </Badge>
          )}
          {date && (
            <span className="ml-auto text-[10px] text-zinc-600">{date}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export function EmptyState({ type }: { type: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20"
    >
      <p className="text-lg text-zinc-500">还没有{type}记录</p>
      <p className="mt-2 text-sm text-zinc-600">
        按 <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> 快速添加
      </p>
    </motion.div>
  )
}
