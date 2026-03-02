import { createLogger } from "@/lib/logger"

const SPOTIFY_BASE = "https://api.spotify.com/v1"
const SPOTIFY_TOKEN_BASE = "https://accounts.spotify.com/api/token"

const logger = createLogger("api/spotify")

export interface SpotifySearchResult {
  id: string
  name: string
  artist: string
  type: "track" | "album"
  coverUrl: string | null
  releaseDate: string | null
}

interface SearchLogContext {
  traceId?: string
}

interface SpotifyToken {
  token: string
  expiresAt: number
}

let cachedToken: SpotifyToken | null = null

function getCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim()
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    return null
  }
  return { clientId, clientSecret }
}

async function getAccessToken(): Promise<string | null> {
  const creds = getCredentials()
  if (!creds) {
    logger.debug("spotify credentials missing, skipping")
    return null
  }

  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  try {
    logger.debugApi("request", SPOTIFY_TOKEN_BASE, {
      grant_type: "client_credentials",
      client_id: creds.clientId,
    })

    const res = await fetch(SPOTIFY_TOKEN_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    })

    if (!res.ok) {
      logger.warn("spotify token request failed", { status: res.status })
      return null
    }

    const data = await res.json()
    const token = data.access_token
    const expiresIn = data.expires_in || 3600

    cachedToken = {
      token,
      expiresAt: Date.now() + (expiresIn - 60) * 1000, // Refresh 60s early
    }

    logger.debugApi("response", SPOTIFY_TOKEN_BASE, { access_token: token, expires_in: expiresIn })
    logger.debug("spotify token obtained", { expiresIn })

    return token
  } catch (error) {
    logger.error("spotify token request failed", { error: error instanceof Error ? error.message : "unknown" })
    return null
  }
}

export async function searchSpotify(
  query: string,
  context?: SearchLogContext
): Promise<SpotifySearchResult[]> {
  const token = await getAccessToken()
  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined

  if (!token) {
    logger.debug("spotify token not available, skipping search", traceMeta)
    return []
  }

  const url = `${SPOTIFY_BASE}/search?q=${encodeURIComponent(query)}&type=album,track&limit=10&market=from_token`

  logger.debugApi("request", url, undefined, traceMeta)

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    logger.warn("spotify search returned non-200", { query, status: res.status, ...traceMeta })
    return []
  }

  const data = await res.json()
  logger.debugApi("response", url, data, traceMeta)

  const results: SpotifySearchResult[] = []

  // Process albums
  const albums = data.albums?.items ?? []
  for (const album of albums.slice(0, 5)) {
    results.push({
      id: album.id,
      name: album.name,
      artist: album.artists?.[0]?.name ?? "Unknown",
      type: "album" as const,
      coverUrl: album.images?.[0]?.url ?? null,
      releaseDate: album.release_date ?? null,
    })
  }

  // Process tracks
  const tracks = data.tracks?.items ?? []
  for (const track of tracks.slice(0, 5)) {
    results.push({
      id: track.id,
      name: track.name,
      artist: track.artists?.[0]?.name ?? "Unknown",
      type: "track" as const,
      coverUrl: track.album?.images?.[0]?.url ?? null,
      releaseDate: track.album?.release_date ?? null,
    })
  }

  logger.debug("spotify search completed", { query, count: results.length, ...traceMeta })
  return results
}

export function normalizeSpotifyResult(item: SpotifySearchResult) {
  return {
    externalId: item.id,
    title: item.name,
    artist: item.artist,
    type: item.type,
    coverUrl: item.coverUrl,
    releaseDate: item.releaseDate,
  }
}
