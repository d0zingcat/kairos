import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  normalizeHardcoverBookResult,
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
