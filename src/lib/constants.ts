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

export const MEDIA_TYPES: Record<MediaType, Omit<MediaTypeConfig, "label" | "labelPlural">> = {
  book: {
    icon: BookOpen,
    href: "/dashboard/books",
    color: "text-emerald-400",
    searchPrefix: "/book",
    searchTypes: ["book"],
  },
  music: {
    icon: Music,
    href: "/dashboard/music",
    color: "text-violet-400",
    searchPrefix: "/music",
    searchTypes: ["music"],
  },
  watch: {
    icon: Film,
    href: "/dashboard/watches",
    color: "text-amber-400",
    searchPrefix: "/movie",
    searchTypes: ["movie", "tv"],
  },
  game: {
    icon: Gamepad2,
    href: "/dashboard/games",
    color: "text-rose-400",
    searchPrefix: "/game",
    searchTypes: ["game"],
  },
}

export const BOOK_STATUSES = [
  { value: "want_to_read" },
  { value: "reading" },
  { value: "finished" },
  { value: "abandoned" },
] as const

export const WATCH_STATUSES = [
  { value: "want_to_watch" },
  { value: "watching" },
  { value: "finished" },
  { value: "abandoned" },
] as const

export const GAME_STATUSES = [
  { value: "backlog" },
  { value: "playing" },
  { value: "completed" },
  { value: "abandoned" },
  { value: "platinum" },
] as const

export const SORT_OPTIONS = [
  { value: "date" },
  { value: "rating" },
  { value: "title" },
] as const

export const ADMIN_ONLY_PREFIXES = ["/settings", "/api/export"]
