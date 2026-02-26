import { BookOpen, Music, Film, Gamepad2, type LucideIcon } from "lucide-react"

export type MediaType = "book" | "music" | "watch" | "game"

export interface MediaTypeConfig {
  label: string
  labelPlural: string
  icon: LucideIcon
  href: string
  color: string
  searchPrefix: string
  searchTypes: string[]
}

export const MEDIA_TYPES: Record<MediaType, MediaTypeConfig> = {
  book: {
    label: "书",
    labelPlural: "Books",
    icon: BookOpen,
    href: "/dashboard/books",
    color: "text-emerald-400",
    searchPrefix: "/book",
    searchTypes: ["book"],
  },
  music: {
    label: "音乐",
    labelPlural: "Music",
    icon: Music,
    href: "/dashboard/music",
    color: "text-violet-400",
    searchPrefix: "/music",
    searchTypes: ["music"],
  },
  watch: {
    label: "影视",
    labelPlural: "Watch",
    icon: Film,
    href: "/dashboard/watches",
    color: "text-amber-400",
    searchPrefix: "/movie",
    searchTypes: ["movie", "tv"],
  },
  game: {
    label: "游戏",
    labelPlural: "Games",
    icon: Gamepad2,
    href: "/dashboard/games",
    color: "text-rose-400",
    searchPrefix: "/game",
    searchTypes: ["game"],
  },
}

export const BOOK_STATUSES = [
  { value: "want_to_read", label: "想读" },
  { value: "reading", label: "在读" },
  { value: "finished", label: "已读" },
  { value: "abandoned", label: "弃读" },
] as const

export const WATCH_STATUSES = [
  { value: "want_to_watch", label: "想看" },
  { value: "watching", label: "在看" },
  { value: "finished", label: "已看" },
  { value: "abandoned", label: "弃看" },
] as const

export const GAME_STATUSES = [
  { value: "backlog", label: "待玩" },
  { value: "playing", label: "在玩" },
  { value: "completed", label: "通关" },
  { value: "abandoned", label: "弃坑" },
  { value: "platinum", label: "白金" },
] as const

export const SORT_OPTIONS = [
  { value: "date", label: "最新" },
  { value: "rating", label: "评分" },
  { value: "title", label: "标题" },
] as const
