import { createLogger } from "@/lib/logger"

const MUSICBRAINZ_BASE = "https://musicbrainz.org/ws/2"
const LASTFM_BASE = "https://ws.audioscrobbler.com/2.0"
const COVER_ART_BASE = "https://coverartarchive.org"

const logger = createLogger("api/musicbrainz")

export interface MusicSearchResult {
  id: string
  title: string
  artist: string
  type: "track" | "album"
  coverUrl: string | null
  releaseDate: string | null
}

interface MBReleaseGroup {
  id: string
  title: string
  "primary-type"?: string
  "first-release-date"?: string
  "artist-credit": { name: string; artist: { id: string; name: string } }[]
}

interface MBRecording {
  id: string
  title: string
  "first-release-date"?: string
  "artist-credit": { name: string; artist: { id: string; name: string } }[]
  releases?: { id: string; title: string }[]
}

interface SearchLogContext {
  traceId?: string
}

function getLastfmKey(): string {
  const key = process.env.LASTFM_API_KEY
  if (!key) throw new Error("LASTFM_API_KEY not configured")
  return key
}

async function fetchWithUA(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "User-Agent": "Kairos/1.0 (personal-tracker)",
      Accept: "application/json",
    },
  })
}

export async function searchAlbums(query: string, context?: SearchLogContext): Promise<MusicSearchResult[]> {
  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined
  const url = `${MUSICBRAINZ_BASE}/release-group/?query=${encodeURIComponent(query)}&type=album&limit=10&fmt=json`
  const res = await fetchWithUA(url)
  if (!res.ok) {
    logger.warn("album search returned non-200", { query, status: res.status, ...traceMeta })
    throw new Error(`MusicBrainz search failed: ${res.status}`)
  }
  const data = await res.json()

  const groups: MBReleaseGroup[] = data["release-groups"] ?? []
  const results = await Promise.all(
    groups.map(async (rg) => ({
      id: rg.id,
      title: rg.title,
      artist: rg["artist-credit"]?.[0]?.name ?? "Unknown",
      type: "album" as const,
      coverUrl: await getCoverArt(rg.id),
      releaseDate: rg["first-release-date"] ?? null,
    }))
  )

  logger.debug("album search completed", { query, count: results.length, ...traceMeta })
  return results
}

export async function searchTracks(query: string, context?: SearchLogContext): Promise<MusicSearchResult[]> {
  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined
  const url = `${MUSICBRAINZ_BASE}/recording/?query=${encodeURIComponent(query)}&limit=10&fmt=json`
  const res = await fetchWithUA(url)
  if (!res.ok) {
    logger.warn("track search returned non-200", { query, status: res.status, ...traceMeta })
    throw new Error(`MusicBrainz recording search failed: ${res.status}`)
  }
  const data = await res.json()

  const recordings: MBRecording[] = data.recordings ?? []
  const results = await Promise.all(
    recordings.map(async (rec) => {
      const releaseId = rec.releases?.[0]?.id
      return {
        id: rec.id,
        title: rec.title,
        artist: rec["artist-credit"]?.[0]?.name ?? "Unknown",
        type: "track" as const,
        coverUrl: releaseId ? await getCoverArtByRelease(releaseId) : null,
        releaseDate: rec["first-release-date"] ?? null,
      }
    })
  )

  logger.debug("track search completed", { query, count: results.length, ...traceMeta })
  return results
}

async function getCoverArt(releaseGroupId: string): Promise<string | null> {
  try {
    const res = await fetch(`${COVER_ART_BASE}/release-group/${releaseGroupId}`, {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return await getLastfmCover(releaseGroupId)
    const data = await res.json()
    const front = data.images?.find((img: { front: boolean }) => img.front)
    return front?.thumbnails?.["500"] ?? front?.image ?? null
  } catch {
    return null
  }
}

async function getCoverArtByRelease(releaseId: string): Promise<string | null> {
  try {
    const res = await fetch(`${COVER_ART_BASE}/release/${releaseId}`, {
      headers: { Accept: "application/json" },
    })
    if (!res.ok) return null
    const data = await res.json()
    const front = data.images?.find((img: { front: boolean }) => img.front)
    return front?.thumbnails?.["500"] ?? front?.image ?? null
  } catch {
    return null
  }
}

async function getLastfmCover(releaseGroupId: string): Promise<string | null> {
  try {
    const key = getLastfmKey()
    // Fetch release-group info from MusicBrainz to get artist + album name
    const mbRes = await fetchWithUA(
      `${MUSICBRAINZ_BASE}/release-group/${releaseGroupId}?inc=artist-credits&fmt=json`
    )
    if (!mbRes.ok) return null
    const mbData = await mbRes.json()

    const artist = mbData["artist-credit"]?.[0]?.name
    const album = mbData.title
    if (!artist || !album) return null

    const lfmUrl = `${LASTFM_BASE}/?method=album.getinfo&api_key=${key}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&format=json`
    const lfmRes = await fetch(lfmUrl)
    if (!lfmRes.ok) return null
    const lfmData = await lfmRes.json()

    const images = lfmData.album?.image ?? []
    const extralarge = images.find((i: { size: string }) => i.size === "extralarge")
    const large = images.find((i: { size: string }) => i.size === "large")
    const url = extralarge?.["#text"] || large?.["#text"] || null
    return url && url.length > 0 ? url : null
  } catch {
    return null
  }
}
