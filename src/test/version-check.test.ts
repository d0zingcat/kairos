import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  compareVersions,
  fetchLatestGithubVersion,
  normalizeVersion,
} from "@/lib/version-check"

describe("version-check", () => {
  const originalGithubToken = process.env.GITHUB_TOKEN
  const originalGithubAccessToken = process.env.GITHUB_ACCESS_TOKEN

  beforeEach(() => {
    delete process.env.GITHUB_TOKEN
    delete process.env.GITHUB_ACCESS_TOKEN
  })

  afterEach(() => {
    if (originalGithubToken) {
      process.env.GITHUB_TOKEN = originalGithubToken
    } else {
      delete process.env.GITHUB_TOKEN
    }

    if (originalGithubAccessToken) {
      process.env.GITHUB_ACCESS_TOKEN = originalGithubAccessToken
    } else {
      delete process.env.GITHUB_ACCESS_TOKEN
    }
  })

  it("normalizes version strings", () => {
    expect(normalizeVersion("v1.7.4")).toBe("1.7.4")
    expect(normalizeVersion("1.7.4-beta.1")).toBe("1.7.4")
    expect(normalizeVersion("release-1.7.4")).toBeNull()
  })

  it("compares semantic versions", () => {
    expect(compareVersions("1.7.4", "1.7.3")).toBeGreaterThan(0)
    expect(compareVersions("1.7.4", "1.7.4")).toBe(0)
    expect(compareVersions("1.7.3", "1.7.4")).toBeLessThan(0)
  })

  it("falls back to tags when the latest release endpoint returns 404", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ name: "v1.7.4" }]), { status: 200 }))

    await expect(fetchLatestGithubVersion("d0zingcat/kairos", fetcher)).resolves.toEqual({
      latest: "1.7.4",
      releaseUrl: "https://github.com/d0zingcat/kairos/releases/tag/v1.7.4",
      publishedAt: null,
    })
  })

  it("treats inaccessible repositories as an unknown version state", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))

    await expect(fetchLatestGithubVersion("d0zingcat/kairos", fetcher)).rejects.toThrow(
      "Configure GITHUB_TOKEN for private repos"
    )
  })
})
