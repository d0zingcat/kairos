import { describe, expect, it } from "vitest"
import {
  buildPublicProfilePath,
  buildPublicProfileUrl,
  canShareRecentActivity,
} from "@/lib/share"

describe("share helpers", () => {
  it("builds a normalized public profile path", () => {
    expect(buildPublicProfilePath(" Alice ")).toBe("/u/alice")
    expect(buildPublicProfilePath("Name With Space")).toBe("/u/name%20with%20space")
  })

  it("builds an absolute public profile URL", () => {
    expect(buildPublicProfileUrl("https://kairos.example", "Alice")).toBe("https://kairos.example/u/alice")
  })

  it("only allows sharing when the public profile is enabled", () => {
    expect(canShareRecentActivity({ username: "alice", isPublicProfile: true })).toBe(true)
    expect(canShareRecentActivity({ username: "alice", isPublicProfile: false })).toBe(false)
    expect(canShareRecentActivity(null)).toBe(false)
  })
})
