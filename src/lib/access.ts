import { getCurrentUser } from "@/lib/auth"
import { getStoredSiteVisibility } from "@/lib/site-settings"

export async function getAccessState() {
  const visibility = await getStoredSiteVisibility()
  const user = await getCurrentUser()
  const isAdmin = user?.role === "admin"
  const hasSession = Boolean(user)

  return {
    visibility,
    canView: hasSession,
    canEdit: hasSession,
    isAdmin,
    isViewer: false,
    hasSession,
  }
}
