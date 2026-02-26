const RAWG_BASE = "https://api.rawg.io/api"

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

function getApiKey(): string {
  const key = process.env.RAWG_API_KEY
  if (!key) throw new Error("RAWG_API_KEY not configured")
  return key
}

export async function searchGames(query: string): Promise<RAWGGameResult[]> {
  const key = getApiKey()
  const url = `${RAWG_BASE}/games?key=${key}&search=${encodeURIComponent(query)}&page_size=10`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`RAWG search failed: ${res.status}`)
  const data = await res.json()
  return data.results ?? []
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
