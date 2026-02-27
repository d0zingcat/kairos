const HARDCOVER_API_BASE = "https://api.hardcover.app/v1/graphql"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api/hardcover")

interface HardcoverSearchResponse {
  data?: {
    search?: {
      results?:
        | Array<Record<string, unknown>>
        | {
            hits?: Array<{ document?: Record<string, unknown> }>
          }
    }
  }
}

export interface HardcoverBookNormalized {
  externalId: string
  title: string
  subtitle: string | null
  authors: string[]
  categories: string[]
  coverUrl: string | null
  isbn: string | null
  pageCount: number | null
}

interface SearchLogContext {
  traceId?: string
}

function getApiToken(): string | null {
  const token = process.env.HARDCOVER_API_TOKEN?.trim()
  return token ? token : null
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

function toCoverUrl(value: unknown): string | null {
  if (typeof value === "string") return value
  if (!value || typeof value !== "object") return null

  const candidate = (value as Record<string, unknown>).url
  return typeof candidate === "string" ? candidate : null
}

export function normalizeHardcoverBookResult(item: Record<string, unknown>): HardcoverBookNormalized | null {
  const title = typeof item.title === "string" ? item.title : null
  if (!title) return null

  const subtitle = typeof item.subtitle === "string" ? item.subtitle : null
  const authors = toStringArray(item.author_names)
  const tags = toStringArray(item.tags)
  const genres = toStringArray(item.genres)
  const isbns = toStringArray(item.isbns)
  const coverUrl =
    toCoverUrl(item.image) ??
    toCoverUrl(item.cover_image) ??
    (typeof item.image_url === "string" ? item.image_url : null)

  const pageCount =
    typeof item.pages === "number"
      ? item.pages
      : typeof item.page_count === "number"
        ? item.page_count
        : null

  const idRaw = item.id
  const slugRaw = item.slug
  const externalId =
    typeof idRaw === "number" || typeof idRaw === "string"
      ? String(idRaw)
      : typeof slugRaw === "string"
        ? slugRaw
        : title

  return {
    externalId,
    title,
    subtitle,
    authors,
    categories: genres.length > 0 ? genres : tags,
    coverUrl,
    isbn: isbns[0] ?? null,
    pageCount,
  }
}

export async function searchHardcoverBooks(query: string, context?: SearchLogContext): Promise<HardcoverBookNormalized[]> {
  const token = getApiToken()
  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined
  if (!token) {
    logger.debug("hardcover token missing, skipping hardcover search", traceMeta)
    return []
  }

  const graphqlQuery = `query SearchBooks($query: String!, $queryType: String!, $perPage: Int!, $page: Int!) {
    search(query: $query, query_type: $queryType, per_page: $perPage, page: $page) {
      results
    }
  }`

  try {
    const res = await fetch(HARDCOVER_API_BASE, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: token,
        "user-agent": "kairos/0.1.0 (book-search)",
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          query,
          queryType: "Book",
          perPage: 10,
          page: 1,
        },
      }),
    })

    if (!res.ok) {
      logger.warn("hardcover search returned non-200", { status: res.status, query, ...traceMeta })
      return []
    }

    const data = (await res.json()) as HardcoverSearchResponse
    const rawResults = data.data?.search?.results

    const documents = Array.isArray(rawResults)
      ? rawResults
      : Array.isArray(rawResults?.hits)
        ? rawResults.hits
            .map((hit) => (hit && typeof hit.document === "object" ? hit.document : null))
            .filter((item): item is Record<string, unknown> => item !== null)
        : []

    const normalized = documents
      .map((item) => normalizeHardcoverBookResult(item))
      .filter((item): item is HardcoverBookNormalized => item !== null)

    logger.debug("hardcover search completed", {
      query,
      rawCount: documents.length,
      normalizedCount: normalized.length,
      ...traceMeta,
    })

    return normalized
  } catch {
    logger.error("hardcover search failed unexpectedly", { query, ...traceMeta })
    return []
  }
}
