"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { BookOpen, Film, Gamepad2, Loader2, Disc, Disc3 } from "lucide-react"
import { useTranslation } from "@/components/i18n/i18n-provider"
import { formatDistanceToNow } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { formatPlazaWatchSeasonLabel } from "@/lib/plaza-feed"

export type PlazaFeedItem = {
  id: string
  userId: string
  username: string
  mediaType: "book" | "music" | "watch" | "game"
  title: string
  notes?: string | null
  musicType?: "track" | "album"
  watchType?: "movie" | "tv"
  seasonNumber?: number | null
  createdAt: string
}

function MediaIcon({ type, musicType }: { type: "book" | "music" | "watch" | "game", musicType?: "track" | "album" }) {
  if (type === "book") return <BookOpen className="h-4 w-4 text-emerald-400" />
  if (type === "music") {
    if (musicType === "track") return <Disc3 className="h-4 w-4 text-violet-400" />
    return <Disc className="h-4 w-4 text-violet-400" />
  }
  if (type === "watch") return <Film className="h-4 w-4 text-amber-400" />
  return <Gamepad2 className="h-4 w-4 text-rose-400" />
}

export function InfiniteFeed({
  initialItems,
  initialCursor,
  initialHasMore,
  pageSize = 20,
}: {
  initialItems: PlazaFeedItem[]
  initialCursor: string | null
  initialHasMore: boolean
  pageSize?: number
}) {
  const { t, locale } = useTranslation()
  const [items, setItems] = useState<PlazaFeedItem[]>(initialItems)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recovered, setRecovered] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const dateLocale = locale === "zh" ? zhCN : enUS

  const getMediaAction = (type: string) => {
    switch (type) {
      case "book": return t("feed.read")
      case "music": return t("feed.listened")
      case "watch": return t("feed.watched")
      case "game": return t("feed.played")
      default: return ""
    }
  }

  const getWatchSeasonLabel = (item: PlazaFeedItem) =>
    formatPlazaWatchSeasonLabel(locale, item.watchType, item.seasonNumber)

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) {
      return
    }

    const hadError = Boolean(error)
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ limit: String(pageSize) })
      if (cursor) {
        params.set("cursor", cursor)
      }

      const response = await fetch(`/api/plaza/feed?${params.toString()}`)
      if (!response.ok) {
        throw new Error("load failed")
      }

      const payload = await response.json() as {
        items: PlazaFeedItem[]
        nextCursor: string | null
        hasMore: boolean
      }

      setItems((prev) => [...prev, ...payload.items])
      setCursor(payload.nextCursor)
      setHasMore(payload.hasMore)
      setRecovered(hadError)
    } catch {
      setError(t("feed.loadFailed"))
      setRecovered(false)
    } finally {
      setIsLoading(false)
    }
  }, [cursor, error, hasMore, isLoading, pageSize, t])

  useEffect(() => {
    if (!recovered) {
      return
    }

    const timer = window.setTimeout(() => {
      setRecovered(false)
    }, 2000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [recovered])

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) {
      return
    }

    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting) {
          void loadMore()
        }
      },
      { rootMargin: "200px" }
    )

    observerRef.current.observe(sentinelRef.current)

    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [hasMore, loadMore])

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/50 p-6 text-sm text-muted-foreground">
        {t("feed.noPublicFeed")}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={`${item.mediaType}-${item.id}-${item.createdAt}`}
          className="rounded-2xl border border-border/60 bg-card/50 p-4"
        >
          <div className="flex items-center gap-3">
            <MediaIcon type={item.mediaType} musicType={item.musicType} />
            <div className="text-sm text-foreground/90">
              <Link href={`/u/${item.username}`} className="font-medium text-sky-500 hover:text-sky-400">
                @{item.username}
              </Link>
              <span className="mx-1 text-muted-foreground">{getMediaAction(item.mediaType)}</span>
              <span className="font-medium">{item.title}</span>
              {getWatchSeasonLabel(item) ? (
                <span className="ml-2 text-xs text-muted-foreground">· {getWatchSeasonLabel(item)}</span>
              ) : null}
            </div>
          </div>
          {item.notes ? (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">“{item.notes}”</p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
              locale: dateLocale,
            })}
          </p>
        </div>
      ))}

      <div ref={sentinelRef} className="h-8" />

      {isLoading ? (
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t("feed.loadingMore")}
        </p>
      ) : null}

      {recovered ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50">
          <p
            role="status"
            aria-live="polite"
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 shadow-lg backdrop-blur"
          >
            {t("feed.resumed")}
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={isLoading || !hasMore}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : null}
      {!hasMore && !isLoading ? <p className="text-center text-xs text-muted-foreground">{t("feed.noMoreFeed")}</p> : null}
    </div>
  )
}
