export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpen, Film, Gamepad2, Music, UserCircle2 } from "lucide-react"
import { getPublicUserProfile } from "@/lib/actions/plaza"

function formatRelativeTime(input: Date) {
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

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await getPublicUserProfile(username, 50)

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight">@{data.summary.username}</h1>
            <p className="mt-2 text-sm text-zinc-500">公开时间线摘要</p>
          </div>

          <Link
            href="/plaza"
            className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            返回广场
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <UserCircle2 className="h-4 w-4 text-sky-300" />
            摘要统计
          </h2>
          <p className="text-xs text-zinc-500">总记录 {data.summary.total}</p>
          <p className="mt-1 text-sm text-zinc-300">
            📚 {data.summary.books} · 🎵 {data.summary.music} · 🎬 {data.summary.watches} · 🎮 {data.summary.games}
          </p>
        </div>

        <div className="space-y-3">
          {data.feed.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 text-sm text-zinc-500">
              暂无公开动态。
            </div>
          ) : (
            data.feed.map((item) => (
              <div
                key={`${item.mediaType}-${item.id}`}
                className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4"
              >
                <div className="flex items-center gap-3">
                  <MediaIcon type={item.mediaType} />
                  <div className="text-sm text-zinc-200">
                    <span className="mx-1 text-zinc-500">{mediaLabel(item.mediaType)}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500">{formatRelativeTime(item.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
