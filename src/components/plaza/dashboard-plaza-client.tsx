"use client"

import Link from "next/link"
import { Globe2, UserCircle2 } from "lucide-react"
import { InfiniteFeed, type PlazaFeedItem } from "@/components/plaza/infinite-feed"
import { useTranslation } from "@/components/i18n/i18n-provider"

interface DashboardPlazaClientProps {
  publicUsers: Array<{
    userId: string
    username: string
    books: number
    music: number
    watches: number
    games: number
    total: number
  }>
  initialItems: PlazaFeedItem[]
  nextCursor: string | null
  hasMore: boolean
}

export function DashboardPlazaClient({
  publicUsers,
  initialItems,
  nextCursor,
  hasMore,
}: DashboardPlazaClientProps) {
  const { t } = useTranslation()

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
            <Globe2 className="h-3.5 w-3.5 text-sky-300" />
            {t("plaza.title")} · {t("plaza.subtitle")}
          </div>
          <h1 className="font-mono text-3xl font-bold tracking-tight">Kairos {t("media.all")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("plaza.summary", { users: publicUsers.length, items: initialItems.length })}
          </p>
        </div>

        <Link
          href="/plaza"
          className="rounded-lg border border-border bg-card/70 px-3 py-2 text-xs text-foreground transition-colors hover:bg-accent"
        >
          {t("plaza.returnToDashboard").replace("我的", "")}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <InfiniteFeed
            initialItems={initialItems}
            initialCursor={nextCursor}
            initialHasMore={hasMore}
            pageSize={20}
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <UserCircle2 className="h-4 w-4 text-sky-300" />
              {t("plaza.publicUsers")}
            </h2>

            <div className="space-y-3">
              {publicUsers.slice(0, 12).map((user) => (
                <Link
                  key={user.userId}
                  href={`/u/${user.username}`}
                  className="block rounded-xl border border-border bg-card/70 p-3 transition-colors hover:bg-accent/70"
                >
                  <p className="text-sm font-medium text-foreground">@{user.username}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t("plaza.totalRecords")} {user.total}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    📚 {user.books} · 🎵 {user.music} · 🎬 {user.watches} · 🎮 {user.games}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}