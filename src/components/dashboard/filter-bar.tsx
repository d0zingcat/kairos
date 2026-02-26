"use client"

import { useRouter, useSearchParams } from "next/navigation"
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

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          defaultValue={currentSearch}
          placeholder="搜索..."
          className="border-zinc-800 bg-zinc-900/50 pl-9 text-zinc-300 placeholder:text-zinc-600"
          onChange={(e) => {
            const value = e.target.value
            // Debounce: only update after 300ms of no typing
            const timer = setTimeout(() => updateParam("search", value), 300)
            return () => clearTimeout(timer)
          }}
        />
      </div>

      {/* Status filter */}
      {statuses && (
        <Select
          value={currentStatus || "all"}
          onValueChange={(v) => updateParam("status", v)}
        >
          <SelectTrigger className="w-28 border-zinc-800 bg-zinc-900/50 text-zinc-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900">
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
        <SelectTrigger className="w-24 border-zinc-800 bg-zinc-900/50 text-zinc-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-zinc-800 bg-zinc-900">
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
