import { describe, it, expect } from "vitest"
import { posterUrl } from "@/lib/api/tmdb"

describe("TMDB API Utils", () => {
    it("should format poster URL correctly", () => {
        const path = "/test.jpg"
        const url = posterUrl(path)
        expect(url).toBe("https://image.tmdb.org/t/p/w500/test.jpg")
    })

    it("should return null for empty path", () => {
        expect(posterUrl(null)).toBeNull()
    })
})
