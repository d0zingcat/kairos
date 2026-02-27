"use client"

import { useMemo, useState } from "react"
import { BOOK_STATUSES } from "@/lib/constants"
import { MediaCard } from "@/components/dashboard/media-card"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import type { SearchResultItem } from "@/app/api/search/[type]/route"

interface BookGridItem {
  id: string
  externalId: string | null
  title: string
  subtitle: string | null
  authors: string[] | null
  coverUrl: string | null
  isbn: string | null
  pageCount: number | null
  status: "want_to_read" | "reading" | "finished" | "abandoned"
  rating: number | null
  startDate: string | null
  finishDate: string | null
  notes: string | null
  favorite: boolean
  tags: string[] | null
}

interface BooksGridProps {
  books: BookGridItem[]
}

export function BooksGrid({ books }: BooksGridProps) {
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)

  const statusMap = useMemo(
    () => new Map(BOOK_STATUSES.map((item) => [item.value, item.label])),
    []
  )

  const openEditor = (book: BookGridItem) => {
    setSelectedItem({
      externalId: book.externalId ?? book.id,
      title: book.title,
      subtitle: book.authors?.join(", ") ?? null,
      coverUrl: book.coverUrl,
      type: "book",
      meta: {
        source: "local",
        localId: book.id,
        subtitle: book.subtitle,
        authors: book.authors ?? [],
        categories: book.tags ?? [],
        isbn: book.isbn,
        pageCount: book.pageCount,
        notes: book.notes,
        startDate: book.startDate,
        finishDate: book.finishDate,
        status: book.status,
        rating: book.rating,
        favorite: book.favorite,
        coverUrl: book.coverUrl,
      },
    })
    setEntryDialogOpen(true)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {books.map((book, i) => (
          <MediaCard
            key={book.id}
            title={book.title}
            subtitle={book.authors?.join(", ")}
            coverUrl={book.coverUrl}
            rating={book.rating}
            favorite={book.favorite}
            statusLabel={statusMap.get(book.status) ?? book.status}
            tags={book.tags}
            metaLines={[
              book.authors?.length ? `作者：${book.authors.join(" / ")}` : "",
              `阅读时间：${book.startDate ?? "-"} → ${book.finishDate ?? "-"}`,
            ].filter(Boolean)}
            note={book.notes}
            index={i}
            onClick={() => openEditor(book)}
          />
        ))}
      </div>

      <EntryDialog
        open={entryDialogOpen}
        onOpenChange={setEntryDialogOpen}
        item={selectedItem}
        mediaType="book"
      />
    </>
  )
}
