"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MEDIA_TYPES } from "@/lib/constants"
import { LayoutDashboard, LogOut, Command, SlidersHorizontal, Globe2 } from "lucide-react"
import { logoutAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { useCommandPalette } from "@/components/command-palette/provider"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { VersionDisplay } from "@/components/version-display"

const baseNavItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/plaza", label: "Plaza", icon: Globe2 },
  { href: MEDIA_TYPES.book.href, label: MEDIA_TYPES.book.labelPlural, icon: MEDIA_TYPES.book.icon },
  { href: MEDIA_TYPES.music.href, label: MEDIA_TYPES.music.labelPlural, icon: MEDIA_TYPES.music.icon },
  { href: MEDIA_TYPES.watch.href, label: MEDIA_TYPES.watch.labelPlural, icon: MEDIA_TYPES.watch.icon },
  { href: MEDIA_TYPES.game.href, label: MEDIA_TYPES.game.labelPlural, icon: MEDIA_TYPES.game.icon },
]

interface DashboardNavProps {
  canEdit: boolean
  hasSession: boolean
}

export function DashboardNav({ canEdit, hasSession }: DashboardNavProps) {
  const pathname = usePathname()
  const { setOpen } = useCommandPalette()
  const navItems = canEdit
    ? [
        ...baseNavItems,
        { href: "/dashboard/settings", label: "Settings", icon: SlidersHorizontal },
      ]
    : baseNavItems

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/70 bg-background/90 backdrop-blur-xl md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <span className="text-sm font-bold text-white">K</span>
            </div>
              <span className="font-mono text-lg font-semibold tracking-tight text-foreground">
                Kairos
              </span>
            </div>
            <ThemeToggle compact />
          </div>

          {/* Quick add */}
          <div className="px-4 pb-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-border bg-muted/40 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setOpen(true)}
              disabled={!canEdit}
            >
              <Command className="h-3.5 w-3.5" />
              <span>{canEdit ? "快速录入" : "只读模式"}</span>
              <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </Button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 space-y-1 px-3 py-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-accent/70"
                      transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                    />
                  )}
                  <item.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout / Version */}
          <div className="border-t border-border/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {hasSession ? "已登录" : "访客模式"}
              </span>
              <VersionDisplay />
            </div>
            {hasSession ? (
              <form action={logoutAction}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground"
                  type="submit"
                >
                  <LogOut className="h-4 w-4" />
                  退出
                </Button>
              </form>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sm text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  登录 / 注册
                </Button>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600">
            <span className="text-xs font-bold text-white">K</span>
          </div>
          <span className="font-mono text-base font-semibold text-foreground">
            Kairos
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle compact />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => setOpen(true)}
            disabled={!canEdit}
          >
            <Command className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
