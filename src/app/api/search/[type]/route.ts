import { NextRequest, NextResponse } from "next/server"
import { searchMovies, searchTV, posterUrl } from "@/lib/api/tmdb"
import { lookupHardcoverBookByIsbn, searchHardcoverBooks } from "@/lib/api/hardcover"
import { searchWereadBooks } from "@/lib/api/weread"
import { searchGames, normalizeGameResult } from "@/lib/api/rawg"
import { searchSpotify, normalizeSpotifyResult } from "@/lib/api/spotify"
import { searchAlbums, searchTracks } from "@/lib/api/musicbrainz"
import { db } from "@/db"
import { books, games, music, watches } from "@/db/schema"
import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { createLogger } from "@/lib/logger"
import { getCurrentUser } from "@/lib/auth"
import { mergeUniqueResults, type SearchResultItem } from "@/lib/search-utils"

const logger = createLogger("api/search")

/**
 * Parse MUSIC_SEARCH_SOURCES environment variable to determine which music APIs to use.
 * Defaults to "spotify,musicbrainz" if not set.
 * Examples: "spotify" (Spotify only), "spotify,musicbrainz" (both)
 */
function getMusicSearchSources(): { spotify: boolean; musicbrainz: boolean } {
  const sources = (process.env.MUSIC_SEARCH_SOURCES ?? "spotify,musicbrainz")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    spotify: sources.includes("spotify"),
    musicbrainz: sources.includes("musicbrainz"),
  }
}

/**
 * Parse BOOK_SEARCH_SOURCES environment variable to determine which book APIs to use.
 * Defaults to "local,weread,hardcover" if not set.
 * Examples: "local,hardcover" (skip WeRead), "local,weread" (skip Hardcover)
 */
function getBookSearchSources(): { local: boolean; weread: boolean; hardcover: boolean } {
  const sources = (process.env.BOOK_SEARCH_SOURCES ?? "local,weread,hardcover")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    local: sources.includes("local"),
    weread: sources.includes("weread"),
    hardcover: sources.includes("hardcover"),
  }
}


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const traceId = request.headers.get("x-trace-id") || crypto.randomUUID()
  const { type } = await params
  const query = request.nextUrl.searchParams.get("q")?.trim()
  const mode = request.nextUrl.searchParams.get("mode")?.trim()

  const withTrace = (payload: Record<string, unknown>) => ({
    ...payload,
    traceId,
  })

  const jsonWithTrace = (payload: Record<string, unknown>) =>
    NextResponse.json(payload, {
      headers: {
        "x-trace-id": traceId,
      },
    })

  if (!query || query.length < 2) {
    return jsonWithTrace({ results: [] })
  }

  logger.debug("search request received", withTrace({ type, query, mode }))

  try {
    let results: SearchResultItem[] = []

    switch (type) {
      case "book": {
        const bookSources = getBookSearchSources()

        if (mode === "isbn") {
          const hardcoverBook = await lookupHardcoverBookByIsbn(query, { traceId }).catch((error) => {
            logger.warn("hardcover isbn lookup failed", {
              query,
              error: error instanceof Error ? error.message : "unknown",
              traceId,
            })
            return null
          })

          results = hardcoverBook
            ? [{
                externalId: hardcoverBook.externalId,
                title: hardcoverBook.title,
                subtitle: hardcoverBook.authors.join(", ") || null,
                coverUrl: hardcoverBook.coverUrl,
                type: "book",
                meta: {
                  source: "hardcover",
                  searchMode: "isbn",
                  subtitle: hardcoverBook.subtitle,
                  authors: hardcoverBook.authors,
                  categories: hardcoverBook.categories,
                  isbn: hardcoverBook.isbn,
                  pageCount: hardcoverBook.pageCount,
                  coverUrl: hardcoverBook.coverUrl,
                  externalId: hardcoverBook.externalId,
                },
              }]
            : []

          logger.debug("book isbn lookup completed", {
            query,
            resultCount: results.length,
            traceId,
          })
          break
        }

        const localBooks = bookSources.local
          ? await db.query.books.findMany({
              where: and(
                eq(books.userId, currentUser.id),
                or(
                  ilike(books.title, `%${query}%`),
                  ilike(books.subtitle, `%${query}%`),
                  sql`array_to_string(${books.authors}, ',') ilike ${`%${query}%`}`,
                  sql`array_to_string(${books.tags}, ',') ilike ${`%${query}%`}`
                )
              ),
              orderBy: [desc(books.updatedAt)],
              limit: 10,
            })
          : []

        const localResults: SearchResultItem[] = localBooks.map((book) => ({
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
            externalId: book.externalId,
          },
        }))

        const [wereadBooks, hardcoverBooks] = await Promise.all([
          bookSources.weread
            ? searchWereadBooks(query, { traceId }).catch((error) => {
                logger.warn("weread search failed", {
                  query,
                  error: error instanceof Error ? error.message : "unknown",
                  traceId,
                })
                return []
              })
            : Promise.resolve([]),
          bookSources.hardcover
            ? searchHardcoverBooks(query, { traceId }).catch((error) => {
                logger.warn("hardcover search failed", {
                  query,
                  error: error instanceof Error ? error.message : "unknown",
                  traceId,
                })
                return []
              })
            : Promise.resolve([]),
        ])

        const wereadResults = wereadBooks.map((book) => ({
          externalId: `weread:${book.externalId}`,
          title: book.title,
          subtitle: book.authors.join(", ") || null,
          coverUrl: book.coverUrl,
          type: "book",
          meta: {
            source: "weread",
            subtitle: book.publisher,
            authors: book.authors,
            categories: book.categories,
            isbn: null,
            pageCount: null,
            coverUrl: book.coverUrl,
            externalId: `weread:${book.externalId}`,
            wereadBookId: book.externalId,
            wereadUrl: book.readUrl,
            intro: book.intro,
            publisher: book.publisher,
            rating: book.rating,
            ratingCount: book.ratingCount,
            ratingLabel: book.ratingLabel,
            readingCount: book.readingCount,
            soldout: book.soldout,
            price: book.price,
            searchIdx: book.searchIdx,
          },
        }))

        const hardcoverResults = hardcoverBooks.map((book) => ({
          externalId: book.externalId,
          title: book.title,
          subtitle: book.authors.join(", ") || null,
          coverUrl: book.coverUrl,
          type: "book",
          meta: {
            source: "hardcover",
            subtitle: book.subtitle,
            authors: book.authors,
            categories: book.categories,
            isbn: book.isbn,
            pageCount: book.pageCount,
            coverUrl: book.coverUrl,
            externalId: book.externalId,
          },
        }))

        results = mergeUniqueResults([
          ...localResults,
          ...wereadResults,
          ...hardcoverResults,
        ])
        logger.debug("book search completed", {
          query,
          sources: bookSources,
          localCount: localResults.length,
          wereadCount: wereadResults.length,
          hardcoverCount: hardcoverResults.length,
          mergedCount: results.length,
          traceId,
        })
        break
      }

      case "movie": {
        const localMovies = await db.query.watches.findMany({
          where: and(eq(watches.userId, currentUser.id), eq(watches.type, "movie"), ilike(watches.title, `%${query}%`)),
          orderBy: [desc(watches.updatedAt)],
          limit: 10,
        })

        const localResults: SearchResultItem[] = localMovies.map((movie) => ({
          externalId: movie.externalId ?? movie.id,
          title: movie.title,
          subtitle: movie.director ?? null,
          coverUrl: movie.posterUrl,
          type: "movie",
          meta: {
            source: "local",
            localId: movie.id,
            genre: movie.genre ?? [],
            status: movie.status,
            watchDate: movie.watchDate,
            rating: movie.rating,
            favorite: movie.favorite,
            notes: movie.notes,
            type: movie.type,
            director: movie.director,
            posterUrl: movie.posterUrl,
            runtime: movie.runtime,
            seasonNumber: movie.seasonNumber,
            episodeNumber: movie.episodeNumber,
            tags: movie.tags ?? [],
            externalId: movie.externalId,
          },
        }))

        const movies = await searchMovies(query, { traceId }).catch((error) => {
          logger.warn("movie search failed", {
            query,
            error: error instanceof Error ? error.message : "unknown",
            traceId,
          })
          return []
        })
        const remoteResults = movies.map((m) => ({
          externalId: String(m.id),
          title: m.title ?? m.name ?? "",
          subtitle: m.release_date?.slice(0, 4) ?? null,
          coverUrl: posterUrl(m.poster_path, "w200"),
          type: "movie",
          meta: { genre_ids: m.genre_ids, overview: m.overview },
        }))

        results = mergeUniqueResults([...localResults, ...remoteResults])
        break
      }

      case "tv": {
        const localShows = await db.query.watches.findMany({
          where: and(eq(watches.userId, currentUser.id), eq(watches.type, "tv"), ilike(watches.title, `%${query}%`)),
          orderBy: [desc(watches.updatedAt)],
          limit: 10,
        })

        const localResults: SearchResultItem[] = localShows.map((show) => ({
          externalId: show.externalId ?? show.id,
          title: show.title,
          subtitle: show.director ?? null,
          coverUrl: show.posterUrl,
          type: "tv",
          meta: {
            source: "local",
            localId: show.id,
            genre: show.genre ?? [],
            status: show.status,
            watchDate: show.watchDate,
            rating: show.rating,
            favorite: show.favorite,
            notes: show.notes,
            type: show.type,
            director: show.director,
            posterUrl: show.posterUrl,
            runtime: show.runtime,
            seasonNumber: show.seasonNumber,
            episodeNumber: show.episodeNumber,
            tags: show.tags ?? [],
            externalId: show.externalId,
          },
        }))

        const shows = await searchTV(query, { traceId }).catch((error) => {
          logger.warn("tv search failed", {
            query,
            error: error instanceof Error ? error.message : "unknown",
            traceId,
          })
          return []
        })
        const remoteResults = shows.map((s) => ({
          externalId: String(s.id),
          title: s.name ?? s.title ?? "",
          subtitle: s.first_air_date?.slice(0, 4) ?? null,
          coverUrl: posterUrl(s.poster_path, "w200"),
          type: "tv",
          meta: { genre_ids: s.genre_ids, overview: s.overview },
        }))

        results = mergeUniqueResults([...localResults, ...remoteResults])
        break
      }

      case "game": {
        const localGames = await db.query.games.findMany({
          where: and(
            eq(games.userId, currentUser.id),
            or(
              ilike(games.title, `%${query}%`),
              ilike(games.developer, `%${query}%`),
              sql`array_to_string(${games.platforms}, ',') ilike ${`%${query}%`}`,
              sql`array_to_string(${games.genre}, ',') ilike ${`%${query}%`}`,
              sql`array_to_string(${games.tags}, ',') ilike ${`%${query}%`}`
            )
          ),
          orderBy: [desc(games.updatedAt)],
          limit: 10,
        })

        const localResults: SearchResultItem[] = localGames.map((game) => ({
          externalId: game.externalId ?? game.id,
          title: game.title,
          subtitle: game.platforms?.slice(0, 3).join(", ") ?? null,
          coverUrl: game.coverUrl,
          type: "game",
          meta: {
            source: "local",
            localId: game.id,
            platforms: game.platforms ?? [],
            genre: game.genre ?? [],
            developer: game.developer,
            status: game.status,
            startDate: game.startDate,
            finishDate: game.finishDate,
            playTimeMinutes: game.playTimeMinutes,
            rating: game.rating,
            favorite: game.favorite,
            notes: game.notes,
            coverUrl: game.coverUrl,
            tags: game.tags ?? [],
            externalId: game.externalId,
          },
        }))

        const remoteGames = await searchGames(query, { traceId }).catch((error) => {
          logger.warn("game search failed", {
            query,
            error: error instanceof Error ? error.message : "unknown",
            traceId,
          })
          return []
        })
        const remoteResults = remoteGames.map((g) => {
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

        results = mergeUniqueResults([...localResults, ...remoteResults])
        break
      }

      case "music": {
        const localMusic = await db.query.music.findMany({
          where: and(
            eq(music.userId, currentUser.id),
            or(
              ilike(music.title, `%${query}%`),
              ilike(music.artist, `%${query}%`),
              ilike(music.albumTitle, `%${query}%`),
              sql`array_to_string(${music.genre}, ',') ilike ${`%${query}%`}`,
              sql`array_to_string(${music.tags}, ',') ilike ${`%${query}%`}`
            )
          ),
          orderBy: [desc(music.updatedAt)],
          limit: 10,
        })

        const localResults: SearchResultItem[] = localMusic.map((item) => ({
          externalId: item.externalId ?? item.id,
          title: item.title,
          subtitle: item.artist ?? null,
          coverUrl: item.coverUrl,
          type: "music",
          meta: {
            source: "local",
            localId: item.id,
            musicType: item.type,
            releaseDate: null,
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
        }))

        const sources = getMusicSearchSources()
        logger.debug("music search sources", { sources, traceId })

        // Try Spotify if enabled
        let spotifyResults: SearchResultItem[] = []
        if (sources.spotify) {
          try {
            const spotifyItems = await searchSpotify(query, { traceId })
            spotifyResults = spotifyItems.map((m) => {
              const normalized = normalizeSpotifyResult(m)
              return {
                externalId: normalized.externalId,
                title: normalized.title,
                subtitle: normalized.artist,
                coverUrl: normalized.coverUrl,
                type: "music",
                meta: {
                  musicType: normalized.type,
                  releaseDate: normalized.releaseDate,
                  source: "spotify",
                },
              }
            })
            logger.debug("spotify search completed", { query, count: spotifyResults.length, traceId })
          } catch (error) {
            logger.warn("spotify search failed", {
              query,
              error: error instanceof Error ? error.message : "unknown",
              traceId,
            })
          }
        }

        // Also query MusicBrainz if enabled
        let musicbrainzResults: SearchResultItem[] = []
        if (sources.musicbrainz) {
          try {
            const [albums, tracks] = await Promise.all([
              searchAlbums(query, { traceId }).catch((error) => {
                logger.warn("music album search failed", {
                  query,
                  error: error instanceof Error ? error.message : "unknown",
                  traceId,
                })
                return []
              }),
              searchTracks(query, { traceId }).catch((error) => {
                logger.warn("music track search failed", {
                  query,
                  error: error instanceof Error ? error.message : "unknown",
                  traceId,
                })
                return []
              }),
            ])
            const combined = [...albums, ...tracks].slice(0, 10)
            musicbrainzResults = combined.map((m) => ({
              externalId: m.id,
              title: m.title,
              subtitle: m.artist,
              coverUrl: m.coverUrl,
              type: "music",
              meta: { musicType: m.type, releaseDate: m.releaseDate, source: "musicbrainz" },
            }))
            logger.debug("musicbrainz search completed", { query, count: musicbrainzResults.length, traceId })
          } catch (error) {
            logger.warn("musicbrainz search failed", {
              query,
              error: error instanceof Error ? error.message : "unknown",
              traceId,
            })
          }
        }

        results = mergeUniqueResults([...localResults, ...spotifyResults, ...musicbrainzResults])
        break
      }

      default:
        return NextResponse.json({ error: "Invalid type" }, {
          status: 400,
          headers: {
            "x-trace-id": traceId,
          },
        })
    }

    logger.debug("search response sent", withTrace({ type, query, resultCount: results.length }))
    return jsonWithTrace({ results })
  } catch {
    logger.error("search route failed unexpectedly", withTrace({ type, query }))
    return jsonWithTrace({ results: [] })
  }
}
