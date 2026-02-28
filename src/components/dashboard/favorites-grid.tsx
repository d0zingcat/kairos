"use client"

import Image from "next/image"
import { type MediaType, MEDIA_TYPES } from "@/lib/constants"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"

interface FavoriteItem {
  id: string
  title: string
  mediaType: MediaType
  coverUrl?: string | null
  posterUrl?: string | null
}

interface FavoritesGridProps {
  items: FavoriteItem[]
}

export function FavoritesGrid({ items }: FavoritesGridProps) {
  if (items.length === 0) {
    return (
      <div>
        <h2 className="mb-4 font-mono text-lg font-semibold text-foreground">
          收藏
        </h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
          <Heart className="mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">还没有收藏</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 font-mono text-lg font-semibold text-foreground">
        收藏
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => {
          const cover = item.coverUrl || item.posterUrl
          const config = MEDIA_TYPES[item.mediaType]
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-muted"
            >
              {cover ? (
                <Image
                  src={cover}
                  alt={item.title}
                  fill
                  unoptimized
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <config.icon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-[10px] font-medium text-white">
                  {item.title}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
