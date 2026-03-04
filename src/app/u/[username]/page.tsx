export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { BookOpen, Film, Gamepad2, Music, UserCircle2 } from "lucide-react"
import { getPublicUserProfile } from "@/lib/actions/plaza"
import { getI18n } from "@/lib/i18n"
import { formatDistanceToNow } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"

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
  const { t, locale } = await getI18n()
  const data = await getPublicUserProfile(username, 50)

  if (!data) {
    notFound()
  }

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-3xl font-bold tracking-tight">@{data.summary.username}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("profile.timeline")}</p>
          </div>

          <Link
            href="/plaza"
            className="rounded-lg border border-border bg-card/70 px-3 py-2 text-xs text-foreground transition-colors hover:bg-accent"
          >
            {t("profile.returnToPlaza")}
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-border/60 bg-card/50 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserCircle2 className="h-4 w-4 text-sky-300" />
            {t("profile.summary")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("profile.totalRecords", { count: data.summary.total })}</p>
          <p className="mt-1 text-sm text-foreground/90">
            📚 {data.summary.books} · 🎵 {data.summary.music} · 🎬 {data.summary.watches} · 🎮 {data.summary.games}
          </p>
        </div>

        <div className="space-y-3">
          {data.feed.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card/50 p-6 text-sm text-muted-foreground">
              {t("profile.noPublicFeed")}
            </div>
          ) : (
            data.feed.map((item) => (
              <div
                key={`${item.mediaType}-${item.id}`}
                className="rounded-2xl border border-border/60 bg-card/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <MediaIcon type={item.mediaType} />
                  <div className="text-sm text-foreground/90">
                    <span className="mx-1 text-muted-foreground">{getMediaAction(item.mediaType)}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
