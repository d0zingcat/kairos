import { describe, expect, it } from "vitest"
import { normalizeBookCategories } from "@/lib/book-categories"

describe("normalizeBookCategories", () => {
  it("keeps specific categories and filters generic book labels", () => {
    expect(normalizeBookCategories(["Book", "Science Fiction", "图书", "Graphic Novel"])).toEqual([
      "Science Fiction",
      "Graphic Novel",
    ])
  })

  it("deduplicates categories case-insensitively while preserving the first label", () => {
    expect(normalizeBookCategories(["  Programming  ", "programming", "技术"])).toEqual([
      "Programming",
      "技术",
    ])
  })
})
