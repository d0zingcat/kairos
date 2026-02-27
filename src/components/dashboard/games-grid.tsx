"use client"

import { useMemo, useState } from "react"
import { GAME_STATUSES } from "@/lib/constants"
import { MediaCard } from "@/components/dashboard/media-card"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import type { SearchResultItem } from "@/app/api/search/[type]/route"

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
}

export function GamesGrid({ gameList, canEdit }: GamesGridProps) {
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)

  const statusMap = useMemo(
    () => new Map(GAME_STATUSES.map((item) => [item.value, item.label])),
    []
  )

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

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {gameList.map((g, i) => (
          <MediaCard
            key={g.id}
            title={g.title}
            subtitle={g.developer}
            coverUrl={g.coverUrl}
            rating={g.rating}
            favorite={g.favorite}
            statusLabel={statusMap.get(g.status) ?? g.status}
            tags={g.tags}
            note={g.notes}
            date={g.finishDate}
            index={i}
            onClick={canEdit ? () => openEditor(g) : undefined}
          />
        ))}
      </div>

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
