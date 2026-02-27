export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { getMusicList } from "@/lib/actions/entries"
import { FilterBar } from "@/components/dashboard/filter-bar"
import { EmptyState } from "@/components/dashboard/media-card"
import { MusicGrid } from "@/components/dashboard/music-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { Music } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ sort?: string; search?: string }>
}

export default async function MusicPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Music className="h-6 w-6 text-violet-400" />
        <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
          Music
        </h1>
      </div>

      <Suspense fallback={<FilterBarSkeleton />}>
        <FilterBar
          currentSort={params.sort}
          currentSearch={params.search}
        />
      </Suspense>

      <Suspense fallback={<GridSkeleton />}>
        <MusicGridContent sort={params.sort} search={params.search} />
      </Suspense>
    </div>
  )
}

async function MusicGridContent({
  sort,
  search,
}: {
  sort?: string
  search?: string
}) {
  const musicList = await getMusicList({ sort, search })

  if (musicList.length === 0) {
    return <EmptyState type="音乐" />
  }

  return <MusicGrid musicList={musicList} />
}

function FilterBarSkeleton() {
  return <div className="flex gap-3"><Skeleton className="h-9 w-48" /><Skeleton className="h-9 w-24" /></div>
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
