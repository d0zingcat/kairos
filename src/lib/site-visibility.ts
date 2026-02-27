export type SiteVisibility = "public" | "private" | "password"

export function getSiteVisibility(): SiteVisibility {
  const raw = process.env.SITE_VISIBILITY?.trim().toLowerCase()
  if (raw === "public" || raw === "private" || raw === "password") {
    return raw
  }
  return "private"
}
