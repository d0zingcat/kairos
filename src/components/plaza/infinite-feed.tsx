"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { BookOpen, Film, Gamepad2, Loader2, Music } from "lucide-react"

type PlazaFeedItem = {
  id: string
  userId: string
  username: string
  mediaType: "book" | "music" | "watch" | "game"
  title: string
  createdAt: string
}

function formatRelativeTime(input: string) {
  const now = Date.now()
  const target = new Date(input).getTime()
  const diffMs = target - now
  const minutes = Math.round(diffMs / (1000 * 60))
  const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" })

  if (Math.abs(minutes) < 60) {
    return rtf.format(minutes, "minute")
  }

  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) {
    return rtf.format(hours, "hour")
  }

  const days = Math.round(hours / 24)
  return rtf.format(days, "day")
}

function mediaLabel(type: "book" | "music" | "watch" | "game") {
  if (type === "book") return "读了"
  if (type === "music") return "听了"
  if (type === "watch") return "看了"
  return "玩了"
}

function MediaIcon({ type }: { type: "book" | "music" | "watch" | "game" }) {
  if (type === "book") return <BookOpen className="h-4 w-4 text-emerald-400" />
  if (type === "music") return <Music className="h-4 w-4 text-violet-400" />
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
  const [items, setItems] = useState<PlazaFeedItem[]>(initialItems)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recovered, setRecovered] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

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
      setError("加载失败，请稍后重试")
      setRecovered(false)
    } finally {
      setIsLoading(false)
    }
  }, [cursor, error, hasMore, isLoading, pageSize])

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
        还没有公开动态，先去记录你的第一条时间线吧。
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
            <MediaIcon type={item.mediaType} />
            <div className="text-sm text-foreground/90">
              <Link href={`/u/${item.username}`} className="font-medium text-sky-500 hover:text-sky-400">
                @{item.username}
              </Link>
              <span className="mx-1 text-muted-foreground">{mediaLabel(item.mediaType)}</span>
              <span className="font-medium">{item.title}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
        </div>
      ))}

      <div ref={sentinelRef} className="h-8" />

      {isLoading ? (
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          加载更多中...
        </p>
      ) : null}

      {recovered ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50">
          <p
            role="status"
            aria-live="polite"
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 shadow-lg backdrop-blur"
          >
            已恢复加载
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
            点击重试
          </button>
        </div>
      ) : null}
      {!hasMore && !isLoading ? <p className="text-center text-xs text-muted-foreground">没有更多动态了</p> : null}
    </div>
  )
}
