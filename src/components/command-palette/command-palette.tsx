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

type SearchMode = MediaType | null

function detectPrefix(input: string): { mode: SearchMode; query: string } {
  const lowerInput = input.toLowerCase()
  if (lowerInput.startsWith("/book ")) return { mode: "book", query: input.slice(6) }
  if (lowerInput.startsWith("/music ")) return { mode: "music", query: input.slice(7) }
  if (lowerInput.startsWith("/movie ")) return { mode: "watch", query: input.slice(7) }
  if (lowerInput.startsWith("/tv ")) return { mode: "watch", query: input.slice(4) }
  if (lowerInput.startsWith("/game ")) return { mode: "game", query: input.slice(6) }
  return { mode: null, query: input }
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [input, setInput] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { mode, query } = detectPrefix(input)

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

    if (!mode || query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const searchType =
          mode === "watch"
            ? input.toLowerCase().startsWith("/tv ")
              ? "tv"
              : "movie"
            : mode
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
  }, [mode, query, input])

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
    setResults([])
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <>
      <CommandDialog open={open} onOpenChange={handleClose}>
        <CommandInput
          placeholder="输入 /book, /music, /movie, /tv, /game 后搜索..."
          value={input}
          onValueChange={setInput}
        />
        <CommandList>
          {!mode && (
            <CommandGroup heading="快捷指令">
              <CommandItem onSelect={() => setInput("/book ")}>
                <MEDIA_TYPES.book.icon className="mr-2 h-4 w-4" />
                <span>搜索书籍</span>
                <kbd className="ml-auto text-xs text-zinc-500">/book</kbd>
              </CommandItem>
              <CommandItem onSelect={() => setInput("/music ")}>
                <MEDIA_TYPES.music.icon className="mr-2 h-4 w-4" />
                <span>搜索音乐</span>
                <kbd className="ml-auto text-xs text-zinc-500">/music</kbd>
              </CommandItem>
              <CommandItem onSelect={() => setInput("/movie ")}>
                <MEDIA_TYPES.watch.icon className="mr-2 h-4 w-4" />
                <span>搜索电影</span>
                <kbd className="ml-auto text-xs text-zinc-500">/movie</kbd>
              </CommandItem>
              <CommandItem onSelect={() => setInput("/tv ")}>
                <MEDIA_TYPES.watch.icon className="mr-2 h-4 w-4" />
                <span>搜索电视剧</span>
                <kbd className="ml-auto text-xs text-zinc-500">/tv</kbd>
              </CommandItem>
              <CommandItem onSelect={() => setInput("/game ")}>
                <MEDIA_TYPES.game.icon className="mr-2 h-4 w-4" />
                <span>搜索游戏</span>
                <kbd className="ml-auto text-xs text-zinc-500">/game</kbd>
              </CommandItem>
            </CommandGroup>
          )}

          {mode && query.length >= 2 && (
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
        mediaType={mode}
      />
    </>
  )
}
