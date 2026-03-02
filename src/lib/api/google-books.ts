const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api/google-books")

export interface GoogleBookResult {
  id: string
  volumeInfo: {
    title: string
    subtitle?: string
    authors?: string[]
    publishedDate?: string
    description?: string
    industryIdentifiers?: { type: string; identifier: string }[]
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
  }
}

interface SearchLogContext {
  traceId?: string
}

function getApiKey(): string | null {
  const key = process.env.GOOGLE_BOOKS_API_KEY?.trim()
  return key ? key : null
}

function coverUrl(imageLinks?: GoogleBookResult["volumeInfo"]["imageLinks"]): string | null {
  if (!imageLinks) return null
  const url = imageLinks.thumbnail || imageLinks.smallThumbnail || null
  // Google Books returns http, upgrade to https
  return url?.replace("http://", "https://") ?? null
}

function extractIsbn(identifiers?: { type: string; identifier: string }[]): string | null {
  if (!identifiers) return null
  const isbn13 = identifiers.find((i) => i.type === "ISBN_13")
  const isbn10 = identifiers.find((i) => i.type === "ISBN_10")
  return isbn13?.identifier ?? isbn10?.identifier ?? null
}

export async function searchBooks(query: string, context?: SearchLogContext): Promise<GoogleBookResult[]> {
  const key = getApiKey()
  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined

  const searchWithQuery = async (q: string): Promise<GoogleBookResult[]> => {
    const url = new URL(`${GOOGLE_BOOKS_BASE}/volumes`)
    url.searchParams.set("q", q)
    url.searchParams.set("maxResults", "10")
    if (key) {
      url.searchParams.set("key", key)
    }

    logger.debugApi("request", url.toString(), undefined, traceMeta)

    try {
      const res = await fetch(url.toString())

      if (!res.ok) {
        logger.warn("google books returned non-200", { status: res.status, query: q, ...traceMeta })
        return []
      }

      const data = await res.json()
      logger.debugApi("response", url.toString(), data, traceMeta)

      return data.items ?? []
    } catch (error) {
      logger.warn("google books request failed", { query: q, error: error instanceof Error ? error.message : "unknown", ...traceMeta })
      return []
    }
  }

  const primary = await searchWithQuery(query)
  if (primary.length > 0) {
    logger.debug("google books primary search hit", { query, count: primary.length, ...traceMeta })
    return primary
  }

  logger.info("google books primary empty, using intitle fallback", { query, ...traceMeta })
  return searchWithQuery(`intitle:${query}`)
}

export async function getBookDetail(id: string): Promise<GoogleBookResult> {
  const key = getApiKey()
  const url = new URL(`${GOOGLE_BOOKS_BASE}/volumes/${id}`)
  if (key) {
    url.searchParams.set("key", key)
  }

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Google Books detail failed: ${res.status}`)
  return res.json()
}

export function normalizeBookResult(item: GoogleBookResult) {
  const v = item.volumeInfo
  return {
    externalId: item.id,
    title: v.title,
    subtitle: v.subtitle ?? null,
    authors: v.authors ?? [],
    categories: v.categories ?? [],
    coverUrl: coverUrl(v.imageLinks),
    isbn: extractIsbn(v.industryIdentifiers),
    pageCount: v.pageCount ?? null,
  }
}
