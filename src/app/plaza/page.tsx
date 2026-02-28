export const dynamic = "force-dynamic"

import Link from "next/link"
import { Globe2, UserCircle2 } from "lucide-react"
import { getPublicPlazaFeed, getPublicUserSummaries } from "@/lib/actions/plaza"
import { InfiniteFeed } from "@/components/plaza/infinite-feed"
import { verifySession } from "@/lib/auth"

export default async function PlazaPage() {
  const [publicUsers, feedResult, hasSession] = await Promise.all([
    getPublicUserSummaries(),
    getPublicPlazaFeed({ limit: 20 }),
    verifySession(),
  ])

  const initialItems = feedResult.items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
              <Globe2 className="h-3.5 w-3.5 text-sky-300" />
              公开广场 · 只展示用户主动公开的摘要动态
            </div>
            <h1 className="font-mono text-3xl font-bold tracking-tight">Kairos Plaza</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              已公开用户 {publicUsers.length} 人，首屏动态 {initialItems.length} 条
            </p>
          </div>

          <Link
            href={hasSession ? "/dashboard" : "/login?next=%2Fdashboard"}
            className="rounded-lg border border-border bg-card/70 px-3 py-2 text-xs text-foreground transition-colors hover:bg-accent"
          >
            返回我的仪表盘
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <InfiniteFeed
              initialItems={initialItems}
              initialCursor={feedResult.nextCursor}
              initialHasMore={feedResult.hasMore}
              pageSize={20}
            />
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserCircle2 className="h-4 w-4 text-sky-300" />
                公开用户
              </h2>

              <div className="space-y-3">
                {publicUsers.slice(0, 12).map((user) => (
                  <Link
                    key={user.userId}
                    href={`/u/${user.username}`}
                    className="block rounded-xl border border-border bg-card/70 p-3 transition-colors hover:bg-accent/70"
                  >
                    <p className="text-sm font-medium text-foreground">@{user.username}</p>
                    <p className="mt-1 text-xs text-muted-foreground">总记录 {user.total}</p>
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
    </div>
  )
}
