"use client"

import Image from "next/image"
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
        "group relative overflow-hidden rounded-xl border border-border/50 bg-card/60 transition-all hover:bg-accent/70",
        onClick ? "cursor-pointer" : undefined
      )}
      onClick={onClick}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={index < 4}
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-card">
            <span className="text-3xl text-muted-foreground">{title[0]}</span>
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
        <h3 className="line-clamp-1 text-sm font-medium text-foreground/90">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}

        {metaLines && metaLines.length > 0 && (
          <div className="mt-2 space-y-1">
            {metaLines.map((line) => (
              <p key={line} className="line-clamp-1 text-[11px] text-muted-foreground">
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
                className="border-border/70 px-1.5 py-0 text-[10px] text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {note && (
          <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">“{note}”</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          {rating && rating > 0 ? (
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-muted-foreground">
                {rating / 2}
              </span>
            </div>
          ) : null}
          {statusLabel && (
            <Badge
              variant="outline"
              className="border-border/70 text-[10px] text-muted-foreground"
            >
              {statusLabel}
            </Badge>
          )}
          {date && (
            <span className="ml-auto text-[10px] text-muted-foreground">{date}</span>
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
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20"
    >
      <p className="text-lg text-muted-foreground">还没有{type}记录</p>
      <p className="mt-2 text-sm text-muted-foreground">
        按 <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> 快速添加
      </p>
    </motion.div>
  )
}
