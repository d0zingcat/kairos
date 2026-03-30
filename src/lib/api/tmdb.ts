import { createLogger } from "@/lib/logger"
import { getCache, setCache } from "@/lib/redis"

const TMDB_BASE = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p"

const logger = createLogger("api/tmdb")

export interface TMDBSearchResult {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
  overview: string
  media_type?: string
  genre_ids: number[]
}

export interface TMDBDetail {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  overview: string
  runtime?: number
  episode_run_time?: number[]
  number_of_seasons?: number
  seasons?: {
    id: number
    name: string
    season_number: number
    episode_count?: number
    poster_path: string | null
  }[]
  genres: { id: number; name: string }[]
  release_date?: string
  first_air_date?: string
  credits?: {
    crew: { job: string; name: string }[]
  }
}

interface SearchLogContext {
  traceId?: string
}

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY
  if (!key) throw new Error("TMDB_API_KEY not configured")
  return key
}

export function posterUrl(path: string | null, size = "w500"): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export async function searchMovies(query: string, context?: SearchLogContext): Promise<TMDBSearchResult[]> {
  const cacheKey = `tmdb:search:movie:${query}`
  const cached = await getCache<TMDBSearchResult[]>(cacheKey)
  if (cached) {
    logger.debug("movie search cache hit", { query })
    return cached
  }

  const key = getApiKey()
  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined
  const url = `${TMDB_BASE}/search/movie?api_key=${key}&query=${encodeURIComponent(query)}&language=zh-CN&include_adult=false`

  logger.debugApi("request", url, undefined, traceMeta)

  const res = await fetch(url)

  if (!res.ok) {
    logger.warn("movie search returned non-200", { query, status: res.status, ...traceMeta })
    throw new Error(`TMDB search failed: ${res.status}`)
  }

  const data = await res.json()
  logger.debugApi("response", url, data, traceMeta)

  const results = (data.results ?? []).slice(0, 10)
  logger.debug("movie search completed", { query, count: results.length, ...traceMeta })

  await setCache(cacheKey, results, 86400) // Cache for 1 day
  return results
}

export async function searchTV(query: string, context?: SearchLogContext): Promise<TMDBSearchResult[]> {
  const cacheKey = `tmdb:search:tv:${query}`
  const cached = await getCache<TMDBSearchResult[]>(cacheKey)
  if (cached) {
    logger.debug("tv search cache hit", { query })
    return cached
  }

  const key = getApiKey()
  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined
  const url = `${TMDB_BASE}/search/tv?api_key=${key}&query=${encodeURIComponent(query)}&language=zh-CN`

  logger.debugApi("request", url, undefined, traceMeta)

  const res = await fetch(url)

  if (!res.ok) {
    logger.warn("tv search returned non-200", { query, status: res.status, ...traceMeta })
    throw new Error(`TMDB TV search failed: ${res.status}`)
  }

  const data = await res.json()
  logger.debugApi("response", url, data, traceMeta)

  const results = (data.results ?? []).slice(0, 10)
  logger.debug("tv search completed", { query, count: results.length, ...traceMeta })

  await setCache(cacheKey, results, 86400) // Cache for 1 day
  return results
}

export async function getMovieDetail(id: number): Promise<TMDBDetail> {
  const cacheKey = `tmdb:detail:movie:${id}`
  const cached = await getCache<TMDBDetail>(cacheKey)
  if (cached) return cached

  const key = getApiKey()
  const url = `${TMDB_BASE}/movie/${id}?api_key=${key}&language=zh-CN&append_to_response=credits`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB movie detail failed: ${res.status}`)
  const data = await res.json()
  await setCache(cacheKey, data, 86400 * 7) // Cache for 7 days
  return data
}

export async function getTVDetail(id: number): Promise<TMDBDetail> {
  const cacheKey = `tmdb:detail:tv:${id}`
  const cached = await getCache<TMDBDetail>(cacheKey)
  if (cached) return cached

  const key = getApiKey()
  const url = `${TMDB_BASE}/tv/${id}?api_key=${key}&language=zh-CN&append_to_response=credits`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB TV detail failed: ${res.status}`)
  const data = await res.json()
  await setCache(cacheKey, data, 86400 * 7) // Cache for 7 days
  return data
}

export interface TMDBEpisodeGroupSummary {
  id: string
  name: string
  type: number
  episode_count: number
  group_count: number
}

export interface TMDBEpisodeGroupDetail {
  id: string
  name: string
  type: number
  groups: {
    id: string
    name: string
    order: number
    locked: boolean
    episodes: { id: number; episode_number: number; season_number: number; order: number }[]
  }[]
}

export async function getTVEpisodeGroups(seriesId: number): Promise<TMDBEpisodeGroupSummary[]> {
  const cacheKey = `tmdb:episode_groups:${seriesId}`
  const cached = await getCache<TMDBEpisodeGroupSummary[]>(cacheKey)
  if (cached) return cached

  const key = getApiKey()
  const url = `${TMDB_BASE}/tv/${seriesId}/episode_groups?api_key=${key}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB episode groups failed: ${res.status}`)
  const data = await res.json()
  const results: TMDBEpisodeGroupSummary[] = data.results ?? []
  await setCache(cacheKey, results, 3600) // 1 hour
  return results
}

export async function getTVEpisodeGroupDetail(groupId: string): Promise<TMDBEpisodeGroupDetail> {
  const cacheKey = `tmdb:episode_group_detail:${groupId}`
  const cached = await getCache<TMDBEpisodeGroupDetail>(cacheKey)
  if (cached) return cached

  const key = getApiKey()
  const url = `${TMDB_BASE}/tv/episode_group/${groupId}?api_key=${key}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`TMDB episode group detail failed: ${res.status}`)
  const data = await res.json()
  await setCache(cacheKey, data, 86400) // 1 day
  return data
}
