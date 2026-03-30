"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { MEDIA_TYPES, type MediaType } from "@/lib/constants"
import { Loader2 } from "lucide-react"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import { useI18n } from "@/components/i18n/i18n-provider"
import type { SearchResultItem } from "@/lib/search-utils"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SearchType = "book" | "music" | "movie" | "tv" | "game" | "isbn" | null

const CATEGORY_OPTIONS: { type: Exclude<SearchType, null>; labelKey: string }[] = [
  { type: "book", labelKey: "search.searchBook" },
  { type: "isbn", labelKey: "search.searchIsbn" },
  { type: "music", labelKey: "search.searchMusic" },
  { type: "movie", labelKey: "search.searchMovie" },
  { type: "tv", labelKey: "search.searchTv" },
  { type: "game", labelKey: "search.searchGame" },
]

function getSearchTypeLabel(type: SearchType, t: (key: string) => string): string {
  switch (type) {
    case "book": return t("search.book")
    case "isbn": return t("search.isbn")
    case "music": return t("search.music")
    case "movie": return t("search.movie")
    case "tv": return t("search.tv")
    case "game": return t("search.game")
    default: return ""
  }
}

function parseSlashCommand(value: string): { searchType: SearchType; query: string } {
  const lowerInput = value.toLowerCase()
  if (lowerInput === "/book" || lowerInput.startsWith("/book ")) return { searchType: "book", query: value.slice(5).trimStart() }
  if (lowerInput === "/isbn" || lowerInput.startsWith("/isbn ")) return { searchType: "isbn", query: value.slice(5).trimStart() }
  if (lowerInput === "/music" || lowerInput.startsWith("/music ")) return { searchType: "music", query: value.slice(6).trimStart() }
  if (lowerInput === "/movie" || lowerInput.startsWith("/movie ")) return { searchType: "movie", query: value.slice(6).trimStart() }
  if (lowerInput === "/tv" || lowerInput.startsWith("/tv ")) return { searchType: "tv", query: value.slice(3).trimStart() }
  if (lowerInput === "/game" || lowerInput.startsWith("/game ")) return { searchType: "game", query: value.slice(5).trimStart() }
  return { searchType: null, query: value }
}


export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { t } = useI18n()
  const [searchType, setSearchType] = useState<SearchType>(null)
  const [input, setInput] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const query = input.trim()
  const isIsbnSearch = searchType === "isbn"

  const handleInputChange = useCallback((value: string) => {
    setSearchType(null)
    setResults([])
    setInput(value)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
      // Cmd+1/2/3/4 navigation
      if (e.metaKey || e.ctrlKey) {
        const routes: Record<string, string> = {
          "1": "/dashboard/books",
          "2": "/dashboard/music",
          "3": "/dashboard/watches",
          "4": "/dashboard/games",
        }
        if (routes[e.key]) {
          e.preventDefault()
          router.push(routes[e.key])
          onOpenChange(false)
        }
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange, router])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!searchType || query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const searchPath = isIsbnSearch ? "/api/search/book" : `/api/search/${searchType}`
        const searchParams = new URLSearchParams({ q: query })
        if (isIsbnSearch) {
          searchParams.set("mode", "isbn")
        }
        const res = await fetch(
          `${searchPath}?${searchParams.toString()}`
        )
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [isIsbnSearch, query, searchType])

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      setSelectedItem(item)
      setEntryDialogOpen(true)
      onOpenChange(false)
    },
    [onOpenChange]
  )

  const handleClose = useCallback(() => {
    setInput("")
    setSearchType(null)
    setResults([])
    onOpenChange(false)
  }, [onOpenChange])

  const handleClearSearchType = useCallback(() => {
    setSearchType(null)
    setResults([])
    setLoading(false)
  }, [])

  const activeMediaType: MediaType | null =
    searchType === "movie" || searchType === "tv"
      ? "watch"
      : searchType === "isbn"
        ? "book"
      : searchType

  return (
    <>
      <CommandDialog open={open} onOpenChange={handleClose}>
        <CommandInput
          placeholder={t("search.searchTip")}
          value={input}
          onValueChange={handleInputChange}
        />
        <CommandList>
          {!searchType && (
            <CommandGroup heading={t("search.selectCategory")}>
              {CATEGORY_OPTIONS.map((opt) => {
                const Icon = opt.type === "music"
                  ? MEDIA_TYPES.music.icon
                  : opt.type === "game"
                    ? MEDIA_TYPES.game.icon
                    : opt.type === "movie" || opt.type === "tv"
                      ? MEDIA_TYPES.watch.icon
                      : MEDIA_TYPES.book.icon
                return (
                  <CommandItem key={opt.type} onSelect={() => setSearchType(opt.type)}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{t(opt.labelKey)}</span>
                    {query && (
                      <span className="ml-2 max-w-[160px] truncate text-xs text-muted-foreground">「{query}」</span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          {searchType && query.length >= 2 && (
            <>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loading && results.length === 0 && (
                <CommandEmpty>{isIsbnSearch ? t("search.noIsbnResults") : t("search.noResults")}</CommandEmpty>
              )}
              {!loading && results.length > 0 && (
                <CommandGroup heading={t("search.searchType", { type: getSearchTypeLabel(searchType, t) })}>
                  {results.map((item) => (
                    <CommandItem
                      key={item.externalId}
                      value={`${item.title}-${item.externalId}`}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3 py-2"
                    >
                      {item.coverUrl ? (
                        <Image
                          src={item.coverUrl}
                          alt={item.title}
                          width={32}
                          height={40}
                          unoptimized
                          className="h-10 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-8 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                          ?
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>

      <EntryDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        item={selectedItem}
        mediaType={activeMediaType}
      />
    </>
  )
}
