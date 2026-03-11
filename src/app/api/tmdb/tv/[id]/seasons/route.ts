import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getTVDetail } from "@/lib/api/tmdb"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid TV series id" }, { status: 400 })
  }

  const detail = await getTVDetail(Number(id))
  const seasons = (detail.seasons ?? [])
    .filter((season) => season.season_number > 0)
    .map((season) => ({
      id: season.id,
      name: season.name,
      seasonNumber: season.season_number,
      episodeCount: season.episode_count ?? null,
    }))

  return NextResponse.json({
    numberOfSeasons: detail.number_of_seasons ?? seasons.length,
    seasons,
  })
}