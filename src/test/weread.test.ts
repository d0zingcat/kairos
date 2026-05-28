import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  normalizeWereadSearchResult,
  searchWereadBooks,
} from "@/lib/api/weread"

const originalWereadApiKey = process.env.WEREAD_API_KEY
const originalFetch = globalThis.fetch

beforeEach(() => {
  process.env.WEREAD_API_KEY = "wrk-test-token"
  globalThis.fetch = vi.fn() as unknown as typeof fetch
})

afterEach(() => {
  if (originalWereadApiKey === undefined) {
    delete process.env.WEREAD_API_KEY
  } else {
    process.env.WEREAD_API_KEY = originalWereadApiKey
  }

  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
})

describe("normalizeWereadSearchResult", () => {
  it("normalizes book search entries from a search group", () => {
    const normalized = normalizeWereadSearchResult({
      searchIdx: 7,
      readingCount: 120000,
      newRating: 92,
      newRatingCount: 3200,
      newRatingDetail: { title: "神作" },
      bookInfo: {
        bookId: "3300045871",
        title: "三体",
        author: "刘慈欣",
        cover: "https://res.weread.qq.com/test.jpg",
        intro: "文化大革命如火如荼进行的同时...",
        publisher: "重庆出版社",
        category: "科幻",
        price: 1999,
        soldout: 0,
      },
    })

    expect(normalized).toMatchObject({
      externalId: "3300045871",
      title: "三体",
      authors: ["刘慈欣"],
      categories: ["科幻"],
      coverUrl: "https://res.weread.qq.com/test.jpg",
      intro: "文化大革命如火如荼进行的同时...",
      publisher: "重庆出版社",
      rating: 92,
      ratingCount: 3200,
      ratingLabel: "神作",
      readingCount: 120000,
      soldout: false,
      price: 1999,
      searchIdx: 7,
      readUrl: "weread://reading?bId=3300045871",
    })
  })

  it("returns null for malformed search entries", () => {
    expect(normalizeWereadSearchResult({ bookInfo: { title: "Missing ID" } })).toBeNull()
  })
})

describe("searchWereadBooks", () => {
  it("sends a flat gateway request and returns normalized ebook results", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          sid: "search-session",
          hasMore: 0,
          results: [
            {
              title: "电子书",
              scope: 10,
              books: [
                {
                  searchIdx: 1,
                  readingCount: 1234,
                  newRating: 88,
                  bookInfo: {
                    bookId: "123",
                    title: "活着",
                    author: "余华",
                    cover: "https://res.weread.qq.com/cover.jpg",
                    category: "文学",
                  },
                },
              ],
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          sid: "all-search-session",
          hasMore: 0,
          results: [],
        }),
      } as Response)

    const results = await searchWereadBooks("活着", { traceId: "trace-1" })

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      externalId: "123",
      title: "活着",
      authors: ["余华"],
      categories: ["文学"],
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://i.weread.qq.com/api/agent/gateway")
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: {
        authorization: "Bearer wrk-test-token",
        "content-type": "application/json",
      },
    })
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      api_name: "/store/search",
      keyword: "活着",
      scope: 10,
      skill_version: "1.0.3",
    })
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      api_name: "/store/search",
      keyword: "活着",
      scope: 0,
      skill_version: "1.0.3",
    })
  })

  it("supplements ebook search with all-scope results for pending WeRead books", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          sid: "ebook-search-session",
          hasMore: 0,
          results: [
            {
              title: "电子书",
              scope: 17,
              books: [
                {
                  searchIdx: 1,
                  bookInfo: {
                    bookId: "45369856",
                    title: "学习学习：快速变强四步法",
                    author: "王专",
                  },
                },
              ],
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          sid: "all-search-session",
          hasMore: 0,
          results: [
            {
              title: "待上架",
              scope: 3,
              books: [
                {
                  searchIdx: 1,
                  bookInfo: {
                    bookId: "3003653967",
                    title: "学习究竟是什么 得到App超过11万人都在学 万维钢通才丛书",
                    author: "万维钢 得到出品",
                  },
                },
              ],
            },
          ],
        }),
      } as Response)

    const results = await searchWereadBooks("学习究竟是什么")

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          externalId: "3003653967",
          title: "学习究竟是什么 得到App超过11万人都在学 万维钢通才丛书",
          authors: ["万维钢 得到出品"],
        }),
      ]),
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({
      api_name: "/store/search",
      keyword: "学习究竟是什么",
      scope: 0,
    })
  })

  it("skips search when WEREAD_API_KEY is not configured", async () => {
    delete process.env.WEREAD_API_KEY

    const results = await searchWereadBooks("三体")

    expect(results).toEqual([])
    expect(fetch).not.toHaveBeenCalled()
  })

  it("returns an empty list when the gateway reports an error", async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          errcode: 1,
          errmsg: "invalid api key",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          errcode: 1,
          errmsg: "invalid api key",
        }),
      } as Response)

    await expect(searchWereadBooks("三体")).resolves.toEqual([])
  })
})
