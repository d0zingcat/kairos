import { NextRequest, NextResponse } from "next/server"
import { searchMovies, searchTV, posterUrl } from "@/lib/api/tmdb"
import { searchBooks, normalizeBookResult } from "@/lib/api/google-books"
import { searchGames, normalizeGameResult } from "@/lib/api/rawg"
import { searchAlbums, searchTracks } from "@/lib/api/musicbrainz"

export interface SearchResultItem {
  externalId: string
  title: string
  subtitle: string | null
  coverUrl: string | null
  type: string
  meta: Record<string, unknown>
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  const query = request.nextUrl.searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    let results: SearchResultItem[] = []

    switch (type) {
      case "book": {
        const books = await searchBooks(query)
        results = books.map((b) => {
          const normalized = normalizeBookResult(b)
          return {
            externalId: normalized.externalId,
            title: normalized.title,
            subtitle: normalized.authors.join(", ") || null,
            coverUrl: normalized.coverUrl,
            type: "book",
            meta: normalized,
          }
        })
        break
      }

      case "movie": {
        const movies = await searchMovies(query)
        results = movies.map((m) => ({
          externalId: String(m.id),
          title: m.title ?? m.name ?? "",
          subtitle: m.release_date?.slice(0, 4) ?? null,
          coverUrl: posterUrl(m.poster_path, "w200"),
          type: "movie",
          meta: { genre_ids: m.genre_ids, overview: m.overview },
        }))
        break
      }

      case "tv": {
        const shows = await searchTV(query)
        results = shows.map((s) => ({
          externalId: String(s.id),
          title: s.name ?? s.title ?? "",
          subtitle: s.first_air_date?.slice(0, 4) ?? null,
          coverUrl: posterUrl(s.poster_path, "w200"),
          type: "tv",
          meta: { genre_ids: s.genre_ids, overview: s.overview },
        }))
        break
      }

      case "game": {
        const games = await searchGames(query)
        results = games.map((g) => {
          const normalized = normalizeGameResult(g)
          return {
            externalId: normalized.externalId,
            title: normalized.title,
            subtitle: normalized.platforms.slice(0, 3).join(", ") || null,
            coverUrl: normalized.coverUrl,
            type: "game",
            meta: normalized,
          }
        })
        break
      }

      case "music": {
        const [albums, tracks] = await Promise.all([
          searchAlbums(query).catch(() => []),
          searchTracks(query).catch(() => []),
        ])
        const combined = [...albums, ...tracks].slice(0, 10)
        results = combined.map((m) => ({
          externalId: m.id,
          title: m.title,
          subtitle: m.artist,
          coverUrl: m.coverUrl,
          type: "music",
          meta: { musicType: m.type, releaseDate: m.releaseDate },
        }))
        break
      }

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json({ results })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
