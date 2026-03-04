"use client"

import Link from "next/link"
import { BookOpen, Music, Film, Gamepad2, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useTranslation } from "@/components/i18n/i18n-provider"

export default function Home() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="fixed right-4 top-4 z-40">
        <ThemeToggle />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <span className="text-3xl font-bold text-white">K</span>
          </div>

          <h1 className="font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Kairos
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{t("metadata.description")}</p>
          <p className="mt-1 text-sm text-muted-foreground">καιρός — Greek for &quot;the right moment&quot;</p>

          <div className="mt-10 flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex flex-col items-center gap-1.5">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <span className="text-xs">{t("home.book")}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Music className="h-5 w-5 text-violet-500" />
              <span className="text-xs">{t("home.music")}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Film className="h-5 w-5 text-amber-500" />
              <span className="text-xs">{t("home.movie")}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Gamepad2 className="h-5 w-5 text-rose-500" />
              <span className="text-xs">{t("home.game")}</span>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-amber-500/30"
            >
              {t("home.enterDashboard")}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/plaza"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {t("home.viewPlaza")}
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>Built with Next.js, Tailwind CSS &amp; shadcn/ui</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_AUTHOR || "d0zingcat"}. All rights reserved.</p>
      </footer>
    </div>
  )
}