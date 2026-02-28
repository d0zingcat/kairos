import Link from "next/link"
import { BookOpen, Music, Film, Gamepad2, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          {/* Logo */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
            <span className="text-3xl font-bold text-white">K</span>
          </div>

          <h1 className="font-mono text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl">
            Kairos
          </h1>
          <p className="mt-3 text-lg text-zinc-400">
            记录生命中的每个瞬间
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            καιρός — 希腊语「恰当的时刻」
          </p>

          {/* Categories */}
          <div className="mt-10 flex items-center justify-center gap-6 text-zinc-600">
            <div className="flex flex-col items-center gap-1.5">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <span className="text-xs">书</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Music className="h-5 w-5 text-violet-500" />
              <span className="text-xs">音乐</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Film className="h-5 w-5 text-amber-500" />
              <span className="text-xs">影视</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Gamepad2 className="h-5 w-5 text-rose-500" />
              <span className="text-xs">游戏</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-amber-500/30"
            >
              进入仪表盘
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/plaza"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              查看广场
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-700">
        Built with Next.js, Tailwind CSS &amp; shadcn/ui
      </footer>
    </div>
  )
}
