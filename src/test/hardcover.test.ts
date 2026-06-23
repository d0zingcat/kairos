import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  lookupHardcoverBookByIsbn,
  normalizeHardcoverBookResult,
  normalizeIsbn,
  searchHardcoverBooks,
} from "@/lib/api/hardcover"

const originalHardcoverApiToken = process.env.HARDCOVER_API_TOKEN
const originalFetch = globalThis.fetch

beforeEach(() => {
  process.env.HARDCOVER_API_TOKEN = "test-token"
  globalThis.fetch = vi.fn() as unknown as typeof fetch
})

afterEach(() => {
  if (originalHardcoverApiToken === undefined) {
    delete process.env.HARDCOVER_API_TOKEN
  } else {
    process.env.HARDCOVER_API_TOKEN = originalHardcoverApiToken
  }

  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
})

describe("normalizeHardcoverBookResult", () => {
  it("prefers genres and tags for categories", () => {
    const normalized = normalizeHardcoverBookResult({
      id: 42,
      title: "Example Book",
      author_names: ["Ada Lovelace"],
      genres: ["Science Fiction"],
      tags: ["Time Travel"],
    })

    expect(normalized?.categories).toEqual(["Science Fiction", "Time Travel"])
  })

  it("falls back to book category label when genres and tags are missing", () => {
    const normalized = normalizeHardcoverBookResult({
      id: 99,
      title: "Example Novella",
      book_category_id: 2,
    })

    expect(normalized?.categories).toEqual(["Novella"])
  })

  it("filters generic book category labels from Hardcover categories", () => {
    const normalized = normalizeHardcoverBookResult({
      id: 100,
      title: "Example Book",
      tags: ["Book", "Literary Fiction"],
      book_category_id: 1,
    })

    expect(normalized?.categories).toEqual(["Literary Fiction"])
  })
})

describe("normalizeIsbn", () => {
  it("normalizes ISBN-13 values with separators", () => {
    expect(normalizeIsbn("978-7-115-54608-1")).toBe("9787115546081")
  })

  it("keeps a valid ISBN-10 check digit", () => {
    expect(normalizeIsbn("0-8044-2957-X")).toBe("080442957X")
  })

  it("returns null for invalid ISBN values", () => {
    expect(normalizeIsbn("12345")).toBeNull()
  })
})

describe("searchHardcoverBooks", () => {
  it("fetches book details when search results do not include categories", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            search: {
              results: [
                {
                  id: 123,
                  title: "Fallback Categories",
                  author_names: ["Octavia Butler"],
                },
              ],
            },
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            books: [
              {
                id: 123,
                tags: ["Dystopia"],
                book_category_id: 2,
              },
            ],
          },
        }),
      } as Response)

    const results = await searchHardcoverBooks("parable")

    expect(results).toHaveLength(1)
  expect(results[0]?.categories).toEqual(["Dystopia", "Novella"])
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const secondRequest = fetchMock.mock.calls[1]?.[1]
    expect(secondRequest).toBeDefined()
    expect(JSON.parse(String(secondRequest?.body))).toMatchObject({
      variables: { ids: [123] },
    })
  })

  it("does not fetch book details when search results already include categories", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          search: {
            results: [
              {
                id: 321,
                title: "Direct Categories",
                genres: ["Fantasy"],
                tags: ["Epic"],
              },
            ],
          },
        },
      }),
    } as Response)

    const results = await searchHardcoverBooks("stormlight")

    expect(results).toHaveLength(1)
    expect(results[0]?.categories).toEqual(["Fantasy", "Epic"])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("gracefully ignores graphql validation errors from the details lookup", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            search: {
              results: [
                {
                  id: 456,
                  title: "GraphQL Error Case",
                },
              ],
            },
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          errors: [
            {
              message: "field 'genres' not found in type: 'books'",
            },
          ],
        }),
      } as Response)

    const results = await searchHardcoverBooks("error-case")

    expect(results).toHaveLength(1)
    expect(results[0]?.categories).toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe("lookupHardcoverBookByIsbn", () => {
  it("returns a normalized book from an edition lookup", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          editions: [
            {
              id: 777,
              isbn_13: "9787115546081",
              pages: 320,
              image: { url: "https://images.hardcover.app/test-cover.jpg" },
              cached_tags: [{ tag: "Technology" }],
              cached_contributors: [{ author: { name: "阮一峰" } }],
              book: {
                title: "ECMAScript 6 入门",
                subtitle: "第 3 版",
                tags: ["Programming"],
              },
            },
          ],
        },
      }),
    } as Response)

    const result = await lookupHardcoverBookByIsbn("978-7-115-54608-1")

    expect(result).toMatchObject({
      externalId: "777",
      title: "ECMAScript 6 入门",
      subtitle: "第 3 版",
      isbn: "9787115546081",
      pageCount: 320,
      authors: ["阮一峰"],
      categories: ["Technology", "Programming"],
      coverUrl: "https://images.hardcover.app/test-cover.jpg",
    })

    const request = fetchMock.mock.calls[0]?.[1]
    expect(request).toBeDefined()
    expect(JSON.parse(String(request?.body))).toMatchObject({
      variables: { isbn: "9787115546081" },
    })
  })

  it("returns null when no edition matches the ISBN", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          editions: [],
        },
      }),
    } as Response)

    await expect(lookupHardcoverBookByIsbn("9787115546081")).resolves.toBeNull()
  })
})
