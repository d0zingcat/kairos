import { describe, it, expect } from "vitest"
import { mergeUniqueResults, type SearchResultItem } from "@/lib/search-utils"

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
    })
})
