import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { moderateText } from "@/lib/moderation"

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

function mockApiResponse(flagged: boolean, categories: Record<string, boolean> = {}) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ results: [{ flagged, categories }] }),
  })
}

describe("moderateText", () => {
  it("returns flagged=false when OPENAI_API_KEY is not set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "")
    const result = await moderateText("some text")
    expect(result.flagged).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("returns flagged=false for clean content", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key")
    mockApiResponse(false, { harassment: false })
    const result = await moderateText("I loved this book")
    expect(result.flagged).toBe(false)
    expect(result.categories).toEqual({ harassment: false })
  })

  it("returns flagged=true for harmful content", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key")
    mockApiResponse(true, { violence: true })
    const result = await moderateText("harmful content here")
    expect(result.flagged).toBe(true)
    expect(result.categories).toEqual({ violence: true })
  })

  it("calls the API with the correct payload and auth header", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test-123")
    mockApiResponse(false)
    await moderateText("hello world")
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/moderations",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk-test-123",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ input: "hello world" }),
      }),
    )
  })

  it("returns flagged=false when API returns non-ok status", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key")
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 })
    const result = await moderateText("some text")
    expect(result.flagged).toBe(false)
  })

  it("returns flagged=false when API response has unexpected shape", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key")
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    })
    const result = await moderateText("some text")
    expect(result.flagged).toBe(false)
  })

  it("returns flagged=false when fetch throws (network error)", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key")
    mockFetch.mockRejectedValueOnce(new Error("network error"))
    const result = await moderateText("some text")
    expect(result.flagged).toBe(false)
  })
})
