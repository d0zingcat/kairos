import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import { books, type NewBook } from "./schema"

type GoodreadsRow = Record<string, string>

const REQUIRED_HEADERS = [
  "Book Id",
  "Title",
  "Author",
  "Additional Authors",
  "ISBN",
  "ISBN13",
  "My Rating",
  "Number of Pages",
  "Date Read",
  "Date Added",
  "Bookshelves",
  "Exclusive Shelf",
  "My Review",
  "Private Notes",
]

export type GoodreadsImportSummary = {
  total: number
  inserted: number
  skipped: number
  failed: number
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  const normalized = content.replace(/^\uFEFF/, "")

  let currentRow: string[] = []
  let currentField = ""
  let inQuotes = false

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index]
    const nextChar = normalized[index + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"'
        index += 1
        continue
      }
      inQuotes = !inQuotes
      continue
    }

    if (char === "," && !inQuotes) {
      currentRow = [...currentRow, currentField]
      currentField = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1
      }
      currentRow = [...currentRow, currentField]
      if (currentRow.some((cell) => cell.trim().length > 0)) {
        rows.push(currentRow)
      }
      currentRow = []
      currentField = ""
      continue
    }

    currentField += char
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow = [...currentRow, currentField]
    if (currentRow.some((cell) => cell.trim().length > 0)) {
      rows.push(currentRow)
    }
  }

  return rows
}

function decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  }

  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&([a-zA-Z]+);/g, (full, key: string) => named[key] ?? full)
}

function cleanCell(value: string): string {
  const trimmed = value.trim()
  const excelQuoted = trimmed.match(/^=\"(.*)\"$/)
  const unwrapped = excelQuoted ? excelQuoted[1] : trimmed

  if (unwrapped === '""') {
    return ""
  }

  return decodeHtmlEntities(unwrapped)
}

function parseDate(value: string): string | null {
  const normalized = cleanCell(value)
  if (!normalized) {
    return null
  }

  const match = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!match) {
    return null
  }

  const [, year, month, day] = match
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

function parseIntOrNull(value: string): number | null {
  const normalized = cleanCell(value)
  if (!normalized) {
    return null
  }

  const parsed = Number.parseInt(normalized, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function parseAuthors(primary: string, additional: string): string[] | null {
  const first = cleanCell(primary)
  const others = cleanCell(additional)
    .split(",")
    .map((author) => author.trim())
    .filter(Boolean)

  const all = [first, ...others]
    .map((author) => author.trim())
    .filter(Boolean)

  const deduped = Array.from(new Set(all))
  return deduped.length > 0 ? deduped : null
}

function parseTags(bookshelves: string, exclusiveShelf: string): string[] | null {
  const shelfTags = cleanCell(bookshelves)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)

  const exclusive = cleanCell(exclusiveShelf)
  const systemShelves = new Set(["read", "to-read", "currently-reading"])
  const merged = systemShelves.has(exclusive) || !exclusive
    ? shelfTags
    : [...shelfTags, exclusive]

  const deduped = Array.from(new Set(merged))
  return deduped.length > 0 ? deduped : null
}

function mapStatus(exclusiveShelf: string): NewBook["status"] {
  const value = cleanCell(exclusiveShelf)
  if (value === "read") return "finished"
  if (value === "currently-reading") return "reading"
  if (value === "to-read") return "want_to_read"
  return "want_to_read"
}

function mapRating(myRating: string): number | null {
  const rating = parseIntOrNull(myRating)
  if (!rating || rating <= 0) {
    return null
  }
  return Math.max(1, Math.min(10, rating * 2))
}

function mapNotes(review: string, privateNotes: string): string | null {
  const normalizedReview = cleanCell(review).replace(/<br\s*\/?>/gi, "\n").trim()
  const normalizedPrivate = cleanCell(privateNotes).replace(/<br\s*\/?>/gi, "\n").trim()

  if (normalizedReview && normalizedPrivate) {
    return `${normalizedReview}\n\n${normalizedPrivate}`
  }
  if (normalizedReview) return normalizedReview
  if (normalizedPrivate) return normalizedPrivate
  return null
}

function csvRowsToObjects(rows: string[][]): GoodreadsRow[] {
  if (rows.length === 0) {
    return []
  }

  const [headers, ...body] = rows
  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header))

  if (missing.length > 0) {
    throw new Error(`CSV 缺少必要列: ${missing.join(", ")}`)
  }

  return body
    .map((row) => headers.reduce<GoodreadsRow>((accumulator, header, index) => ({
      ...accumulator,
      [header]: row[index] ?? "",
    }), {}))
    .filter((row) => cleanCell(row["Title"]).length > 0)
}

function mapRowToBook(row: GoodreadsRow): NewBook {
  const finishDate = parseDate(row["Date Read"])
  const addedDate = parseDate(row["Date Added"])
  const status = mapStatus(row["Exclusive Shelf"])

  const externalId = cleanCell(row["Book Id"])
  const isbn13 = cleanCell(row["ISBN13"])
  const isbn10 = cleanCell(row["ISBN"])

  return {
    externalId: externalId || null,
    title: cleanCell(row["Title"]),
    authors: parseAuthors(row["Author"], row["Additional Authors"]),
    isbn: isbn13 || isbn10 || null,
    pageCount: parseIntOrNull(row["Number of Pages"]),
    status,
    rating: mapRating(row["My Rating"]),
    startDate: status === "reading" ? addedDate : null,
    finishDate,
    notes: mapNotes(row["My Review"], row["Private Notes"]),
    favorite: false,
    tags: parseTags(row["Bookshelves"], row["Exclusive Shelf"]),
  }
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

function buildTitleAuthorKey(title: string, authors: string[] | null): string {
  const normalizedTitle = normalize(title)
  const normalizedAuthors = (authors ?? [])
    .map((author) => normalize(author))
    .filter(Boolean)
    .sort()
    .join("|")

  return `${normalizedTitle}::${normalizedAuthors}`
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export async function importGoodreadsCsv(
  database: PostgresJsDatabase<Record<string, unknown>>,
  csvContent: string,
  options?: { clear?: boolean }
): Promise<GoodreadsImportSummary> {
  const rows = parseCsv(csvContent)
  const objects = csvRowsToObjects(rows)
  const mapped = objects.map(mapRowToBook)

  if (mapped.length === 0) {
    return { total: 0, inserted: 0, skipped: 0, failed: 0 }
  }

  if (options?.clear) {
    await database.delete(books)
  }

  const existingRows = await database
    .select({ externalId: books.externalId, title: books.title, authors: books.authors })
    .from(books)

  const existingExternalIds = new Set(
    existingRows
      .map((row) => row.externalId)
      .filter((value): value is string => Boolean(value))
  )

  const existingTitleAuthorKeys = new Set(
    existingRows.map((row) => buildTitleAuthorKey(row.title, row.authors ?? null))
  )

  const toInsert = mapped.filter((item) => {
    const titleAuthorKey = buildTitleAuthorKey(item.title, item.authors ?? null)

    if (item.externalId && existingExternalIds.has(item.externalId)) {
      return false
    }
    if (existingTitleAuthorKeys.has(titleAuthorKey)) {
      return false
    }

    if (item.externalId) {
      existingExternalIds.add(item.externalId)
    }
    existingTitleAuthorKeys.add(titleAuthorKey)
    return true
  })

  const chunks = chunk(toInsert, 200)
  for (const currentChunk of chunks) {
    await database.insert(books).values(currentChunk)
  }

  return {
    total: mapped.length,
    inserted: toInsert.length,
    skipped: mapped.length - toInsert.length,
    failed: 0,
  }
}
