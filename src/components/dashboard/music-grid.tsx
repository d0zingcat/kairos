"use client"

import { useState } from "react"
import { MediaCard } from "@/components/dashboard/media-card"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import type { SearchResultItem } from "@/app/api/search/[type]/route"

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
}

export function MusicGrid({ musicList }: MusicGridProps) {
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)

  const openEditor = (item: MusicGridItem) => {
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

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
            onClick={() => openEditor(m)}
          />
        ))}
      </div>

      <EntryDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        item={selectedItem}
        mediaType="music"
      />
    </>
  )
}
