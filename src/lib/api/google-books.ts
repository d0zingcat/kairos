const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1"

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

function getApiKey(): string {
  const key = process.env.GOOGLE_BOOKS_API_KEY
  if (!key) throw new Error("GOOGLE_BOOKS_API_KEY not configured")
  return key
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

export async function searchBooks(query: string): Promise<GoogleBookResult[]> {
  const key = getApiKey()
  const url = `${GOOGLE_BOOKS_BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${key}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Google Books search failed: ${res.status}`)
  const data = await res.json()
  return data.items ?? []
}

export async function getBookDetail(id: string): Promise<GoogleBookResult> {
  const key = getApiKey()
  const url = `${GOOGLE_BOOKS_BASE}/volumes/${id}?key=${key}`
  const res = await fetch(url)
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
    coverUrl: coverUrl(v.imageLinks),
    isbn: extractIsbn(v.industryIdentifiers),
    pageCount: v.pageCount ?? null,
  }
}
