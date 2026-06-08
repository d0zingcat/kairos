const HARDCOVER_API_BASE = "https://api.hardcover.app/v1/graphql"
import { createLogger } from "@/lib/logger"

const logger = createLogger("api/hardcover")

const HARDCOVER_BOOK_CATEGORY_LABELS: Record<number, string> = {
  1: "Book",
  2: "Novella",
  3: "Short Story",
  4: "Graphic Novel",
  5: "Fan Fiction",
  6: "Research Paper",
  7: "Poetry",
  8: "Collection",
  9: "Web Novel",
  10: "Light Novel",
}

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

interface HardcoverBooksDetailsResponse {
  data?: {
    books?: Array<Record<string, unknown>>
  }
  errors?: Array<{
    message?: string
  }>
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

function extractHardcoverNumericId(item: Record<string, unknown>): number | null {
  const id = item.id

  if (typeof id === "number" && Number.isInteger(id)) {
    return id
  }

  if (typeof id === "string") {
    const parsed = Number(id)
    return Number.isInteger(parsed) ? parsed : null
  }

  return null
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim())).map((value) => value.trim())))
}

function extractHardcoverCategories(item: Record<string, unknown>): string[] {
  const genres = toStringArray(item.genres)
  const tags = toStringArray(item.tags)
  const bookCategoryId = typeof item.book_category_id === "number"
    ? item.book_category_id
    : typeof item.book_category_id === "string"
      ? Number(item.book_category_id)
      : null

  const bookCategoryLabel =
    typeof bookCategoryId === "number" && Number.isInteger(bookCategoryId)
      ? HARDCOVER_BOOK_CATEGORY_LABELS[bookCategoryId] ?? null
      : null

  return uniqueStrings([...genres, ...tags, bookCategoryLabel])
}

async function fetchHardcoverBookCategories(
  bookIds: number[],
  context?: SearchLogContext,
): Promise<Map<string, string[]>> {
  const token = getApiToken()
  if (!token || bookIds.length === 0) {
    return new Map()
  }

  const requestBody = {
    query: `query GetBookCategories($ids: [Int!]!) {
      books(where: { id: { _in: $ids } }) {
        id
        tags
        book_category_id
      }
    }`,
    variables: { ids: bookIds },
  }

  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined
  logger.debugApi("request", HARDCOVER_API_BASE, requestBody, traceMeta)

  try {
    const res = await fetch(HARDCOVER_API_BASE, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: token,
        "user-agent": "kairos/0.1.0 (book-search)",
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      logger.warn("hardcover details lookup returned non-200", { status: res.status, bookIds, ...traceMeta })
      return new Map()
    }

    const data = (await res.json()) as HardcoverBooksDetailsResponse
    logger.debugApi("response", HARDCOVER_API_BASE, data, traceMeta)

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      logger.warn("hardcover details lookup returned graphql errors", {
        bookIds,
        errors: data.errors.map((error) => error.message ?? "unknown"),
        ...traceMeta,
      })
      return new Map()
    }

    const books = Array.isArray(data.data?.books) ? data.data.books : []

    return new Map(
      books
        .map((book) => {
          const id = extractHardcoverNumericId(book)
          if (id === null) return null
          return [String(id), extractHardcoverCategories(book)] as const
        })
        .filter((entry): entry is readonly [string, string[]] => entry !== null),
    )
  } catch (error) {
    logger.warn("hardcover details lookup failed", {
      bookIds,
      error: error instanceof Error ? error.message : "unknown",
      ...traceMeta,
    })
    return new Map()
  }
}

export function normalizeHardcoverBookResult(item: Record<string, unknown>): HardcoverBookNormalized | null {
  const title = typeof item.title === "string" ? item.title : null
  if (!title) return null

  const subtitle = typeof item.subtitle === "string" ? item.subtitle : null
  const authors = toStringArray(item.author_names)
  const categories = extractHardcoverCategories(item)
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
    categories,
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

  const requestBody = {
    query: graphqlQuery,
    variables: {
      query,
      queryType: "Book",
      perPage: 10,
      page: 1,
    },
  }

  logger.debugApi("request", HARDCOVER_API_BASE, requestBody, traceMeta)

  try {
    const res = await fetch(HARDCOVER_API_BASE, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: token,
        "user-agent": "kairos/0.1.0 (book-search)",
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      logger.warn("hardcover search returned non-200", { status: res.status, query, ...traceMeta })
      return []
    }

    const data = (await res.json()) as HardcoverSearchResponse
    logger.debugApi("response", HARDCOVER_API_BASE, data, traceMeta)

    const rawResults = data.data?.search?.results

    const documents = Array.isArray(rawResults)
      ? rawResults
      : Array.isArray(rawResults?.hits)
        ? rawResults.hits
            .map((hit) => (hit && typeof hit.document === "object" ? hit.document : null))
            .filter((item): item is Record<string, unknown> => item !== null)
        : []

    const normalizedEntries = documents
      .map((item) => {
        const normalized = normalizeHardcoverBookResult(item)
        if (!normalized) {
          return null
        }

        return { item, normalized }
      })
      .filter((entry): entry is { item: Record<string, unknown>; normalized: HardcoverBookNormalized } => entry !== null)

    const missingCategoryIds = Array.from(
      new Set(
        normalizedEntries
          .filter((entry) => entry.normalized.categories.length === 0)
          .map((entry) => extractHardcoverNumericId(entry.item))
          .filter((id): id is number => id !== null),
      ),
    )

    const fetchedCategories = await fetchHardcoverBookCategories(missingCategoryIds, context)

    const normalized = normalizedEntries.map(({ normalized }) => {
      if (normalized.categories.length > 0) {
        return normalized
      }

      const categories = fetchedCategories.get(normalized.externalId)
      return categories && categories.length > 0
        ? { ...normalized, categories }
        : normalized
    })

    logger.debug("hardcover search completed", {
      query,
      rawCount: documents.length,
      normalizedCount: normalized.length,
      ...traceMeta,
    })

    return normalized
  } catch (error) {
    logger.error("hardcover search failed unexpectedly", { query, error: error instanceof Error ? error.message : "unknown", ...traceMeta })
    return []
  }
}
