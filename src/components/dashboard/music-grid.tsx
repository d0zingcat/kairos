"use client"

import { useState } from "react"
import { MediaCard } from "@/components/dashboard/media-card"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import { SelectionToolbar } from "@/components/dashboard/selection-toolbar"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { deleteEntries } from "@/lib/actions/entries"
import type { SearchResultItem } from "@/app/api/search/[type]/route"
import { useRouter } from "next/navigation"

interface MusicGridItem {
  id: string
  externalId: string | null
  type: "track" | "album"
  title: string
  artist: string | null
  albumTitle: string | null
  coverUrl: string | null
  genre: string[] | null
  rating: number | null
  listenDate: string | null
  favorite: boolean
  notes: string | null
  tags: string[] | null
}

interface MusicGridProps {
  musicList: MusicGridItem[]
  canEdit: boolean
  search?: string
  sort?: string
}

export function MusicGrid({ musicList, canEdit, search, sort }: MusicGridProps) {
  const router = useRouter()
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const openEditor = (item: MusicGridItem) => {
    if (!canEdit) return

    setSelectedItem({
      externalId: item.externalId ?? item.id,
      title: item.title,
      subtitle: item.artist,
      coverUrl: item.coverUrl,
      type: "music",
      meta: {
        source: "local",
        localId: item.id,
        musicType: item.type,
        artist: item.artist,
        albumTitle: item.albumTitle,
        genre: item.genre ?? [],
        tags: item.tags ?? [],
        coverUrl: item.coverUrl,
        externalId: item.externalId,
        listenDate: item.listenDate,
        rating: item.rating,
        favorite: item.favorite,
        notes: item.notes,
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
      await deleteEntries("music", selectedIds)
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
        {musicList.map((m, i) => (
          <MediaCard
            key={m.id}
            title={m.title}
            subtitle={m.artist}
            coverUrl={m.coverUrl}
            rating={m.rating}
            favorite={m.favorite}
            tags={m.tags}
            note={m.notes}
            date={m.listenDate}
            index={i}
            onClick={canEdit ? () => openEditor(m) : undefined}
            selectable={isSelectionMode}
            selected={selectedIds.includes(m.id)}
            onSelect={() => toggleSelection(m.id)}
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
        mediaType="music"
        canEdit={canEdit}
      />
    </>
  )
}
