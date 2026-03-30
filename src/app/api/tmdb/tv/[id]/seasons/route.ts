import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getTVDetail, getTVEpisodeGroups, getTVEpisodeGroupDetail } from "@/lib/api/tmdb"

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

  const seriesId = Number(id)
  const [detail, episodeGroups] = await Promise.all([
    getTVDetail(seriesId),
    getTVEpisodeGroups(seriesId).catch(() => [] as Awaited<ReturnType<typeof getTVEpisodeGroups>>),
  ])

  // Prefer community episode groups that represent season organization.
  // Strategy:
  //   1. type=7 (TV) with a season-related name (e.g. "剧集", "Seasons", "Season")
  //   2. type=6 (Production) — sometimes used for season groupings
  //   3. Any type=7 group as fallback
  // Only use when group_count > 1 (otherwise it adds no value over official seasons)
  const SEASON_NAME_RE = /season|剧集|季/i
  const type7Groups = episodeGroups.filter((g) => g.type === 7 && g.group_count > 1)
  const tvEpisodeGroup =
    type7Groups.find((g) => SEASON_NAME_RE.test(g.name)) ??
    episodeGroups.find((g) => g.type === 6 && g.group_count > 1) ??
    type7Groups[0]

  if (tvEpisodeGroup) {
    const groupDetail = await getTVEpisodeGroupDetail(tvEpisodeGroup.id)
    const subGroups = [...groupDetail.groups].sort((a, b) => a.order - b.order)
    const seasons = subGroups.map((group, index) => ({
      id: group.id,
      name: group.name,
      seasonNumber: index + 1,
      episodeCount: group.episodes.length,
    }))
    return NextResponse.json({
      numberOfSeasons: seasons.length,
      seasons,
    })
  }

  // Fall back to official seasons
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