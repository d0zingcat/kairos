"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback, useRef, useTransition } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import { SORT_OPTIONS } from "@/lib/constants"

interface FilterBarProps {
  statuses?: readonly { value: string; label: string }[]
  currentStatus?: string
  currentSort?: string
  currentSearch?: string
}

export function FilterBar({
  statuses,
  currentStatus,
  currentSort,
  currentSearch,
}: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize with currentSearch from URL
  const [searchValue, setSearchValue] = useState(currentSearch || "")

  // Memoize updateParam to avoid recreating on every render
  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`?${params.toString()}`)
      })
    },
    [searchParams, router]
  )

  // Debounced search update
  const triggerSearch = useCallback((value: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      if (value) {
        updateParam("search", value)
      }
      debounceTimerRef.current = null
    }, 300)
  }, [updateParam])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    triggerSearch(value)
  }, [triggerSearch])

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        // Clear debounce timer to prevent duplicate search
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
          debounceTimerRef.current = null
        }
        updateParam("search", searchValue)
      }
    },
    [searchValue, updateParam]
  )

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          placeholder="搜索..."
          className="border-border bg-card/60 pl-9 text-foreground placeholder:text-muted-foreground"
          disabled={isPending}
        />
      </div>

      {/* Status filter */}
      {statuses && (
        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => updateParam("status", v)}
        >
          <SelectTrigger className="w-28 border-border bg-card/60 text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-popover">
            <SelectItem value="all">全部</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Sort */}
      <Select
        value={currentSort || "date"}
        onValueChange={(v) => updateParam("sort", v)}
      >
        <SelectTrigger className="w-24 border-border bg-card/60 text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-border bg-popover">
          {SORT_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
