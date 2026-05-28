import { describe, expect, it } from "vitest"
import nextConfig from "../../next.config"

describe("next image configuration", () => {
  it("allows WeRead CDN cover images", () => {
    const remotePatterns = nextConfig.images?.remotePatterns ?? []

    expect(remotePatterns).toContainEqual({
      protocol: "https",
      hostname: "cdn.weread.qq.com",
    })
  })
})
