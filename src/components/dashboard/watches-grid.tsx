"use client"

import { useMemo, useState } from "react"
import { WATCH_STATUSES } from "@/lib/constants"
import { MediaCard } from "@/components/dashboard/media-card"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import { SelectionToolbar } from "@/components/dashboard/selection-toolbar"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { deleteEntries } from "@/lib/actions/entries"
import type { SearchResultItem } from "@/app/api/search/[type]/route"
import { useRouter } from "next/navigation"

interface WatchGridItem {
  id: string
  externalId: string | null
  type: "movie" | "tv"
  title: string
  posterUrl: string | null
  director: string | null
  genre: string[] | null
  runtime: number | null
  rating: number | null
  watchDate: string | null
  seasonNumber: number | null
  episodeNumber: number | null
  status: "want_to_watch" | "watching" | "finished" | "abandoned"
  favorite: boolean
  notes: string | null
  tags: string[] | null
}

interface WatchesGridProps {
  watchList: WatchGridItem[]
  canEdit: boolean
  status?: string
  sort?: string
  search?: string
}

export function WatchesGrid({ watchList, canEdit, status, sort, search }: WatchesGridProps) {
  const router = useRouter()
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const statusMap = useMemo(
    () => new Map(WATCH_STATUSES.map((item) => [item.value, item.label])),
    []
  )

  const openEditor = (item: WatchGridItem) => {
    if (!canEdit) return

    setSelectedItem({
      externalId: item.externalId ?? item.id,
      title: item.title,
      subtitle: item.director,
      coverUrl: item.posterUrl,
      type: item.type,
      meta: {
        source: "local",
        localId: item.id,
        type: item.type,
        director: item.director,
        posterUrl: item.posterUrl,
        genre: item.genre ?? [],
        runtime: item.runtime,
        seasonNumber: item.seasonNumber,
        episodeNumber: item.episodeNumber,
        status: item.status,
        tags: item.tags ?? [],
        watchDate: item.watchDate,
        rating: item.rating,
        favorite: item.favorite,
        notes: item.notes,
        externalId: item.externalId,
      },
    })
    setEntryDialogOpen(true)
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDelete = async () => {
    if (!canEdit || selectedIds.length === 0) return
    if (!confirm(`确定要彻底删除已选择的 ${selectedIds.length} 个项目吗？`)) return

    setIsDeleting(true)
    try {
      await deleteEntries("watch", selectedIds)
      setSelectedIds([])
      setIsSelectionMode(false)
      router.refresh()
    } catch (error) {
      console.error("Bulk delete failed:", error)
      alert("批量删除失败")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <FilterBar
        statuses={WATCH_STATUSES}
        currentStatus={status}
        currentSort={sort}
        currentSearch={search}
        canEdit={canEdit}
        isSelectionMode={isSelectionMode}
        onToggleSelectionMode={() => {
          setIsSelectionMode(!isSelectionMode)
          if (isSelectionMode) setSelectedIds([])
        }}
      />

      <div className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {watchList.map((w, i) => (
          <MediaCard
            key={w.id}
            title={w.title}
            subtitle={w.director}
            coverUrl={w.posterUrl}
            rating={w.rating}
            favorite={w.favorite}
            statusLabel={statusMap.get(w.status) ?? w.status}
            tags={w.tags}
            note={w.notes}
            date={w.watchDate}
            index={i}
            onClick={canEdit ? () => openEditor(w) : undefined}
            selectable={isSelectionMode}
            selected={selectedIds.includes(w.id)}
            onSelect={() => toggleSelection(w.id)}
          />
        ))}
      </div>

      <SelectionToolbar
        selectedCount={selectedIds.length}
        onClear={() => {
          setSelectedIds([])
          setIsSelectionMode(false)
        }}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <EntryDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        item={selectedItem}
        mediaType="watch"
        canEdit={canEdit}
      />
    </>
  )
}
