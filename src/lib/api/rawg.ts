import { createLogger } from "@/lib/logger"

const RAWG_BASE = "https://api.rawg.io/api"

const logger = createLogger("api/rawg")

export interface RAWGGameResult {
  id: number
  slug: string
  name: string
  background_image: string | null
  released: string | null
  metacritic: number | null
  genres: { id: number; name: string }[]
  platforms: { platform: { id: number; name: string } }[]
}

export interface RAWGGameDetail extends RAWGGameResult {
  description_raw: string
  developers: { id: number; name: string }[]
  publishers: { id: number; name: string }[]
  playtime: number
}

interface SearchLogContext {
  traceId?: string
}

function getApiKey(): string {
  const key = process.env.RAWG_API_KEY
  if (!key) throw new Error("RAWG_API_KEY not configured")
  return key
}

export async function searchGames(query: string, context?: SearchLogContext): Promise<RAWGGameResult[]> {
  const key = getApiKey()
  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined
  const url = `${RAWG_BASE}/games?key=${key}&search=${encodeURIComponent(query)}&page_size=10`
  const res = await fetch(url)
  if (!res.ok) {
    logger.warn("game search returned non-200", { query, status: res.status, ...traceMeta })
    throw new Error(`RAWG search failed: ${res.status}`)
  }
  const data = await res.json()
  const results = data.results ?? []
  logger.debug("game search completed", { query, count: results.length, ...traceMeta })
  return results
}

export async function getGameDetail(id: number): Promise<RAWGGameDetail> {
  const key = getApiKey()
  const url = `${RAWG_BASE}/games/${id}?key=${key}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`RAWG detail failed: ${res.status}`)
  return res.json()
}

export function normalizeGameResult(item: RAWGGameResult) {
  return {
    externalId: String(item.id),
    title: item.name,
    coverUrl: item.background_image,
    platforms: item.platforms?.map((p) => p.platform.name) ?? [],
    genre: item.genres?.map((g) => g.name) ?? [],
  }
}
