export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { getBooks } from "@/lib/actions/entries"
import { BOOK_STATUSES } from "@/lib/constants"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { EmptyState } from "@/components/dashboard/media-card"
import { BooksGrid } from "@/components/dashboard/books-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { getI18n } from "@/lib/i18n"

interface PageProps {
  searchParams: Promise<{ status?: string; sort?: string; search?: string }>
}

export default async function BooksPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { t } = await getI18n()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-emerald-400" />
        <h1 className="font-mono text-2xl font-bold tracking-tight text-foreground">
          {t("media.book")}
        </h1>
      </div>

      <Suspense fallback={<GridSkeleton />}>
        <BookGrid status={params.status} sort={params.sort} search={params.search} />
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
  const canEdit = await getCurrentUser() !== null
  const books = await getBooks({ status, sort, search })

  if (books.length === 0) {
    return <EmptyState type="book" />
  }

  return (
    <BooksGrid books={books} canEdit={canEdit} status={status} sort={sort} search={search} />
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