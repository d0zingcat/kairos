"use client"

import { useCallback, useEffect, useState, useRef } from "react"
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
import type { SearchResultItem } from "@/app/api/search/[type]/route"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SearchType = "book" | "music" | "movie" | "tv" | "game" | null

const SEARCH_TYPE_LABEL: Record<Exclude<SearchType, null>, string> = {
  book: "书籍",
  music: "音乐",
  movie: "电影",
  tv: "电视剧",
  game: "游戏",
}

function parseSlashCommand(value: string): { searchType: SearchType; query: string } {
  const lowerInput = value.toLowerCase()
  if (lowerInput.startsWith("/book ")) return { searchType: "book", query: value.slice(6) }
  if (lowerInput.startsWith("/music ")) return { searchType: "music", query: value.slice(7) }
  if (lowerInput.startsWith("/movie ")) return { searchType: "movie", query: value.slice(7) }
  if (lowerInput.startsWith("/tv ")) return { searchType: "tv", query: value.slice(4) }
  if (lowerInput.startsWith("/game ")) return { searchType: "game", query: value.slice(6) }
  return { searchType: null, query: value }
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [searchType, setSearchType] = useState<SearchType>(null)
  const [input, setInput] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const query = input.trim()

  const handleInputChange = useCallback((value: string) => {
    const parsed = parseSlashCommand(value)
    if (parsed.searchType) {
      setSearchType(parsed.searchType)
      setInput(parsed.query)
      return
    }
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
        const res = await fetch(
          `/api/search/${searchType}?q=${encodeURIComponent(query)}`
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
  }, [searchType, query])

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
      : searchType

  return (
    <>
      <CommandDialog open={open} onOpenChange={handleClose}>
        <CommandInput
          placeholder={
            searchType
              ? `搜索${searchType}...`
              : "输入 /book, /music, /movie, /tv, /game 后搜索..."
          }
          value={input}
          onValueChange={handleInputChange}
        />
        {searchType && (
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-zinc-200">
                当前模式：{SEARCH_TYPE_LABEL[searchType]}
              </span>
              <span>输入关键词后开始搜索</span>
            </div>
            <button
              type="button"
              onClick={handleClearSearchType}
              className="text-zinc-500 transition-colors hover:text-zinc-200"
            >
              清除模式
            </button>
          </div>
        )}
        <CommandList>
          {!searchType && (
            <CommandGroup heading="快捷指令">
              <CommandItem onSelect={() => setSearchType("book")}>
                <MEDIA_TYPES.book.icon className="mr-2 h-4 w-4" />
                <span>搜索书籍</span>
                <kbd className="ml-auto text-xs text-zinc-500">/book</kbd>
              </CommandItem>
              <CommandItem onSelect={() => setSearchType("music")}>
                <MEDIA_TYPES.music.icon className="mr-2 h-4 w-4" />
                <span>搜索音乐</span>
                <kbd className="ml-auto text-xs text-zinc-500">/music</kbd>
              </CommandItem>
              <CommandItem onSelect={() => setSearchType("movie")}>
                <MEDIA_TYPES.watch.icon className="mr-2 h-4 w-4" />
                <span>搜索电影</span>
                <kbd className="ml-auto text-xs text-zinc-500">/movie</kbd>
              </CommandItem>
              <CommandItem onSelect={() => setSearchType("tv")}>
                <MEDIA_TYPES.watch.icon className="mr-2 h-4 w-4" />
                <span>搜索电视剧</span>
                <kbd className="ml-auto text-xs text-zinc-500">/tv</kbd>
              </CommandItem>
              <CommandItem onSelect={() => setSearchType("game")}>
                <MEDIA_TYPES.game.icon className="mr-2 h-4 w-4" />
                <span>搜索游戏</span>
                <kbd className="ml-auto text-xs text-zinc-500">/game</kbd>
              </CommandItem>
            </CommandGroup>
          )}

          {searchType && query.length >= 2 && (
            <>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                </div>
              )}
              {!loading && results.length === 0 && (
                <CommandEmpty>未找到结果</CommandEmpty>
              )}
              {!loading && results.length > 0 && (
                <CommandGroup heading="搜索结果">
                  {results.map((item) => (
                    <CommandItem
                      key={item.externalId}
                      value={`${item.title}-${item.externalId}`}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3 py-2"
                    >
                      {item.coverUrl ? (
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="h-10 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-8 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-500">
                          ?
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-zinc-500">
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
