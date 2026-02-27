import { db } from "@/db"
import { appSettings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getSiteVisibility, type SiteVisibility } from "@/lib/site-visibility"

const SITE_SETTINGS_KEY = "site"

export async function getStoredSiteVisibility(): Promise<SiteVisibility> {
  const fallback = getSiteVisibility()

  try {
    const row = await db.query.appSettings.findFirst({
      where: eq(appSettings.key, SITE_SETTINGS_KEY),
    })
    return row?.visibility ?? fallback
  } catch {
    return fallback
  }
}

export async function setStoredSiteVisibility(
  visibility: SiteVisibility
): Promise<SiteVisibility> {
  await db
    .insert(appSettings)
    .values({
      key: SITE_SETTINGS_KEY,
      visibility,
    })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        visibility,
      },
    })

  return visibility
}
