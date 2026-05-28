import { createLogger } from "@/lib/logger"

const WEREAD_API_BASE = "https://i.weread.qq.com/api/agent/gateway"
const WEREAD_SKILL_VERSION = "1.0.3"

const logger = createLogger("api/weread")

interface SearchLogContext {
  traceId?: string
}

interface WereadGatewayErrorResponse {
  errcode?: number
  errmsg?: string
  upgrade_info?: {
    message?: string
  }
}

interface WereadSearchResponse extends WereadGatewayErrorResponse {
  sid?: string
  hasMore?: number
  results?: Array<{
    title?: string
    scope?: number
    books?: Array<Record<string, unknown>>
  }>
}

export interface WereadBookNormalized {
  externalId: string
  title: string
  authors: string[]
  categories: string[]
  coverUrl: string | null
  intro: string | null
  publisher: string | null
  rating: number | null
  ratingCount: number | null
  ratingLabel: string | null
  readingCount: number | null
  soldout: boolean
  price: number | null
  searchIdx: number | null
  readUrl: string
}

function getApiKey(): string | null {
  const key = process.env.WEREAD_API_KEY?.trim()
  return key ? key : null
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => Boolean(value && value.trim()))
        .map((value) => value.trim()),
    ),
  )
}

export function normalizeWereadSearchResult(item: Record<string, unknown>): WereadBookNormalized | null {
  const bookInfo = toRecord(item.bookInfo)
  if (!bookInfo) return null

  const bookId = stringValue(bookInfo.bookId)
  const title = stringValue(bookInfo.title)
  if (!bookId || !title) return null

  const author = stringValue(bookInfo.author)
  const category = stringValue(bookInfo.category)
  const ratingDetail = toRecord(item.newRatingDetail)
  const soldoutValue = numberValue(bookInfo.soldout)

  return {
    externalId: bookId,
    title,
    authors: uniqueStrings([author]),
    categories: uniqueStrings([category]),
    coverUrl: stringValue(bookInfo.cover),
    intro: stringValue(bookInfo.intro),
    publisher: stringValue(bookInfo.publisher),
    rating: numberValue(item.newRating),
    ratingCount: numberValue(item.newRatingCount),
    ratingLabel: ratingDetail ? stringValue(ratingDetail.title) : null,
    readingCount: numberValue(item.readingCount),
    soldout: soldoutValue === 1,
    price: numberValue(bookInfo.price),
    searchIdx: numberValue(item.searchIdx),
    readUrl: `weread://reading?bId=${bookId}`,
  }
}

export async function searchWereadBooks(
  query: string,
  context?: SearchLogContext,
): Promise<WereadBookNormalized[]> {
  const apiKey = getApiKey()
  const traceMeta = context?.traceId ? { traceId: context.traceId } : undefined
  if (!apiKey) {
    logger.debug("weread api key missing, skipping weread search", traceMeta)
    return []
  }

  const requestBody = {
    api_name: "/store/search",
    keyword: query,
    scope: 10,
    skill_version: WEREAD_SKILL_VERSION,
  }

  logger.debugApi("request", WEREAD_API_BASE, requestBody, traceMeta)

  try {
    const res = await fetch(WEREAD_API_BASE, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      logger.warn("weread search returned non-200", { status: res.status, query, ...traceMeta })
      return []
    }

    const data = (await res.json()) as WereadSearchResponse
    logger.debugApi("response", WEREAD_API_BASE, data, traceMeta)

    if (data.upgrade_info?.message) {
      logger.warn("weread skill upgrade requested", {
        message: data.upgrade_info.message,
        ...traceMeta,
      })
      return []
    }

    if (typeof data.errcode === "number" && data.errcode !== 0) {
      logger.warn("weread search returned gateway error", {
        errcode: data.errcode,
        errmsg: data.errmsg,
        query,
        ...traceMeta,
      })
      return []
    }

    const groups = Array.isArray(data.results) ? data.results : []
    const ebookGroup = groups.find((group) => group.scope === 10) ?? groups[0]
    const books = Array.isArray(ebookGroup?.books) ? ebookGroup.books : []
    const normalized = books
      .map((book) => normalizeWereadSearchResult(book))
      .filter((book): book is WereadBookNormalized => book !== null)

    logger.debug("weread search completed", {
      query,
      rawCount: books.length,
      normalizedCount: normalized.length,
      ...traceMeta,
    })

    return normalized
  } catch (error) {
    logger.error("weread search failed unexpectedly", {
      query,
      error: error instanceof Error ? error.message : "unknown",
      ...traceMeta,
    })
    return []
  }
}
