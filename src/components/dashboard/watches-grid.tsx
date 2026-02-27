"use client"

import { useMemo, useState } from "react"
import { WATCH_STATUSES } from "@/lib/constants"
import { MediaCard } from "@/components/dashboard/media-card"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import type { SearchResultItem } from "@/app/api/search/[type]/route"

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
}

export function WatchesGrid({ watchList, canEdit }: WatchesGridProps) {
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)

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

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
          />
        ))}
      </div>

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
