"use client"

import { useMemo, useState } from "react"
import { GAME_STATUSES } from "@/lib/constants"
import { MediaCard } from "@/components/dashboard/media-card"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import { SelectionToolbar } from "@/components/dashboard/selection-toolbar"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { deleteEntries } from "@/lib/actions/entries"
import type { SearchResultItem } from "@/lib/search-utils"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/components/i18n/i18n-provider"

interface GameGridItem {
  id: string
  externalId: string | null
  title: string
  coverUrl: string | null
  platforms: string[] | null
  genre: string[] | null
  developer: string | null
  rating: number | null
  startDate: string | null
  finishDate: string | null
  playTimeMinutes: number | null
  status: "backlog" | "playing" | "completed" | "abandoned" | "platinum"
  favorite: boolean
  notes: string | null
  tags: string[] | null
}

interface GamesGridProps {
  gameList: GameGridItem[]
  canEdit: boolean
  status?: string
  sort?: string
  search?: string
}

export function GamesGrid({ gameList, canEdit, status, sort, search }: GamesGridProps) {
  const router = useRouter()
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)
  const { t } = useTranslation()

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const openEditor = (item: GameGridItem) => {
    if (!canEdit) return

    setSelectedItem({
      externalId: item.externalId ?? item.id,
      title: item.title,
      subtitle: item.developer,
      coverUrl: item.coverUrl,
      type: "game",
      meta: {
        source: "local",
        localId: item.id,
        platforms: item.platforms ?? [],
        genre: item.genre ?? [],
        developer: item.developer,
        status: item.status,
        startDate: item.startDate,
        finishDate: item.finishDate,
        playTimeMinutes: item.playTimeMinutes,
        tags: item.tags ?? [],
        coverUrl: item.coverUrl,
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
    if (!confirm(t("grid.confirmDelete", { count: selectedIds.length }))) return

    setIsDeleting(true)
    try {
      await deleteEntries("game", selectedIds)
      setSelectedIds([])
      setIsSelectionMode(false)
      router.refresh()
    } catch (error) {
      console.error("Bulk delete failed:", error)
      alert(t("grid.deleteFailed"))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <FilterBar
        mediaType="game"
        statuses={GAME_STATUSES}
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
        {gameList.map((g, i) => (
          <MediaCard
            key={g.id}
            title={g.title}
            subtitle={g.developer}
            coverUrl={g.coverUrl}
            rating={g.rating}
            favorite={g.favorite}
            statusLabel={t(`gameStatus.${g.status}`)}
            tags={g.tags}
            note={g.notes}
            date={g.finishDate}
            index={i}
            onClick={canEdit ? () => openEditor(g) : undefined}
            selectable={isSelectionMode}
            selected={selectedIds.includes(g.id)}
            onSelect={() => toggleSelection(g.id)}
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
        mediaType="game"
        canEdit={canEdit}
      />
    </>
  )
}
