"use client"

import { useMemo, useState } from "react"
import { BOOK_STATUSES } from "@/lib/constants"
import { MediaCard } from "@/components/dashboard/media-card"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import { SelectionToolbar } from "@/components/dashboard/selection-toolbar"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { deleteEntries } from "@/lib/actions/entries"
import type { SearchResultItem } from "@/lib/search-utils"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/components/i18n/i18n-provider"

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
  canEdit: boolean
  status?: string
  sort?: string
  search?: string
}

export function BooksGrid({ books, canEdit, status, sort, search }: BooksGridProps) {
  const router = useRouter()
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null)
  const { t } = useTranslation()

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const openEditor = (book: BookGridItem) => {
    if (!canEdit) return

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
      await deleteEntries("book", selectedIds)
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
        mediaType="book"
        statuses={BOOK_STATUSES}
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
        {books.map((book, i) => (
          <MediaCard
            key={book.id}
            title={book.title}
            subtitle={book.authors?.join(", ")}
            coverUrl={book.coverUrl}
            rating={book.rating}
            favorite={book.favorite}
            statusLabel={t(`bookStatus.${book.status}`)}
            tags={book.tags}
            metaLines={[
              book.authors?.length ? `${t("grid.author")}：${book.authors.join(" / ")}` : "",
              `${t("grid.readingTime")}：${book.startDate ?? "-"} → ${book.finishDate ?? "-"}`,
            ].filter(Boolean)}
            note={book.notes}
            index={i}
            onClick={canEdit ? () => openEditor(book) : undefined}
            selectable={isSelectionMode}
            selected={selectedIds.includes(book.id)}
            onSelect={() => toggleSelection(book.id)}
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
        mediaType="book"
        canEdit={canEdit}
      />
    </>
  )
}
