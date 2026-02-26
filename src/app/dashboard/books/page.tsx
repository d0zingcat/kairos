export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { getBooks } from "@/lib/actions/entries"
import { BOOK_STATUSES } from "@/lib/constants"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { MediaCard, EmptyState } from "@/components/dashboard/media-card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ status?: string; sort?: string; search?: string }>
}

export default async function BooksPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-emerald-400" />
        <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
          Books
        </h1>
      </div>

      <Suspense fallback={<FilterBarSkeleton />}>
        <FilterBar
          statuses={BOOK_STATUSES}
          currentStatus={params.status}
          currentSort={params.sort}
          currentSearch={params.search}
        />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <BookGrid
          status={params.status}
          sort={params.sort}
          search={params.search}
        />
      </Suspense>
    </div>
  )
}

async function BookGrid({
  status,
  sort,
  search,
}: {
  status?: string
  sort?: string
  search?: string
}) {
  const books = await getBooks({ status, sort, search })

  if (books.length === 0) {
    return <EmptyState type="书籍" />
  }

  const getStatusLabel = (s: string) =>
    BOOK_STATUSES.find((bs) => bs.value === s)?.label ?? s

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {books.map((book, i) => (
        <MediaCard
          key={book.id}
          title={book.title}
          subtitle={book.authors?.join(", ")}
          coverUrl={book.coverUrl}
          rating={book.rating}
          favorite={book.favorite}
          statusLabel={getStatusLabel(book.status)}
          date={book.finishDate}
          index={i}
        />
      ))}
    </div>
  )
}

function FilterBarSkeleton() {
  return <div className="flex gap-3"><Skeleton className="h-9 w-48" /><Skeleton className="h-9 w-28" /><Skeleton className="h-9 w-24" /></div>
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
