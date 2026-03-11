import { describe, expect, it } from "vitest"
import { formatPlazaWatchSeasonLabel } from "@/lib/plaza-feed"

describe("formatPlazaWatchSeasonLabel", () => {
  it("formats TV seasons in English", () => {
    expect(formatPlazaWatchSeasonLabel("en", "tv", 2)).toBe("Season 2")
  })

  it("formats TV seasons in Chinese", () => {
    expect(formatPlazaWatchSeasonLabel("zh", "tv", 3)).toBe("第 3 季")
  })

  it("omits season info for movies or missing seasons", () => {
    expect(formatPlazaWatchSeasonLabel("en", "movie", 1)).toBeNull()
    expect(formatPlazaWatchSeasonLabel("en", "tv", null)).toBeNull()
    expect(formatPlazaWatchSeasonLabel("en", "tv", 0)).toBeNull()
  })
})