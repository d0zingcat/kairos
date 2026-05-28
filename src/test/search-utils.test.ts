import { describe, expect, it } from "vitest"
import { mergeUniqueResults, type SearchResultItem } from "@/lib/search-utils"

function book(overrides: Partial<SearchResultItem> & { source: string }): SearchResultItem {
  return {
    externalId: overrides.externalId ?? overrides.source,
    title: overrides.title ?? "Example Book",
    subtitle: overrides.subtitle ?? "Ada Lovelace",
    coverUrl: overrides.coverUrl ?? null,
    type: "book",
    meta: {
      source: overrides.source,
      ...(overrides.meta ?? {}),
    },
  }
}

describe("Search Utils", () => {
  describe("mergeUniqueResults", () => {
    it("should remove exact duplicates", () => {
      const items: SearchResultItem[] = [
        { externalId: "1", title: "Inception", subtitle: "2010", type: "movie", coverUrl: null, meta: {} },
        { externalId: "1", title: "Inception", subtitle: "2010", type: "movie", coverUrl: null, meta: {} },
      ]
      const merged = mergeUniqueResults(items)
      expect(merged).toHaveLength(1)
    })

    it("should handle duplicates with different casing", () => {
      const items: SearchResultItem[] = [
        { externalId: "1", title: "Inception", subtitle: "2010", type: "movie", coverUrl: null, meta: {} },
        { externalId: "2", title: "INCEPTION", subtitle: "2010", type: "movie", coverUrl: null, meta: {} },
      ]
      const merged = mergeUniqueResults(items)
      expect(merged).toHaveLength(1)
    })

    it("should allow items with different types but same title", () => {
      const items: SearchResultItem[] = [
        { externalId: "1", title: "Inception", subtitle: "2010", type: "movie", coverUrl: null, meta: {} },
        { externalId: "2", title: "Inception", subtitle: "2010", type: "book", coverUrl: null, meta: {} },
      ]
      const merged = mergeUniqueResults(items)
      expect(merged).toHaveLength(2)
    })

    it("should handle null/missing subtitles gracefully", () => {
      const items: SearchResultItem[] = [
        { externalId: "1", title: "Inception", subtitle: null, type: "movie", coverUrl: null, meta: {} },
        { externalId: "2", title: "Inception", subtitle: null, type: "movie", coverUrl: null, meta: {} },
      ]
      const merged = mergeUniqueResults(items)
      expect(merged).toHaveLength(1)
    })

    it("should deduplicate books by isbn before title", () => {
      const items: SearchResultItem[] = [
        { externalId: "1", title: "Three-Body", subtitle: "Liu Cixin", type: "book", coverUrl: null, meta: { isbn: "9780765377067" } },
        { externalId: "2", title: "The Three-Body Problem", subtitle: "Cixin Liu", type: "book", coverUrl: "https://covers.example/three-body.jpg", meta: { isbn: "9780765377067" } },
      ]

      const merged = mergeUniqueResults(items)

      expect(merged).toHaveLength(1)
      expect(merged[0]?.externalId).toBe("2")
    })

    it("keeps local results when a remote duplicate has a cover", () => {
      const results = mergeUniqueResults([
        book({ source: "local", externalId: "local-1", coverUrl: null }),
        book({ source: "weread", externalId: "weread:1", coverUrl: "https://res.weread.qq.com/cover.jpg" }),
      ])

      expect(results).toHaveLength(1)
      expect(results[0]?.meta.source).toBe("local")
      expect(results[0]?.externalId).toBe("local-1")
    })

    it("still prefers a covered remote result over an uncovered remote duplicate", () => {
      const results = mergeUniqueResults([
        book({ source: "hardcover", externalId: "hardcover-1", coverUrl: null }),
        book({ source: "weread", externalId: "weread:1", coverUrl: "https://res.weread.qq.com/cover.jpg" }),
      ])

      expect(results).toHaveLength(1)
      expect(results[0]?.meta.source).toBe("weread")
    })
  })
})
