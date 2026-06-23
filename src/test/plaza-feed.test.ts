import { describe, expect, it } from "vitest"
import { formatPlazaMediaActionKey, formatPlazaWatchSeasonLabel } from "@/lib/plaza-feed"

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

describe("formatPlazaMediaActionKey", () => {
  it("uses book status labels instead of a fixed read action", () => {
    expect(formatPlazaMediaActionKey({ mediaType: "book", status: "want_to_read" })).toBe("bookStatus.want_to_read")
    expect(formatPlazaMediaActionKey({ mediaType: "book", status: "reading" })).toBe("bookStatus.reading")
    expect(formatPlazaMediaActionKey({ mediaType: "book", status: "finished" })).toBe("bookStatus.finished")
  })

  it("uses watch status labels instead of a fixed watched action", () => {
    expect(formatPlazaMediaActionKey({ mediaType: "watch", status: "want_to_watch" })).toBe("watchStatus.want_to_watch")
    expect(formatPlazaMediaActionKey({ mediaType: "watch", status: "watching" })).toBe("watchStatus.watching")
    expect(formatPlazaMediaActionKey({ mediaType: "watch", status: "finished" })).toBe("watchStatus.finished")
  })

  it("uses game status labels and keeps music as an activity action", () => {
    expect(formatPlazaMediaActionKey({ mediaType: "game", status: "backlog" })).toBe("gameStatus.backlog")
    expect(formatPlazaMediaActionKey({ mediaType: "game", status: "completed" })).toBe("gameStatus.completed")
    expect(formatPlazaMediaActionKey({ mediaType: "music" })).toBe("feed.listened")
  })
})
