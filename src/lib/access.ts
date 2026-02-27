import { verifyAdminSession, verifyViewerSession } from "@/lib/auth"
import { getStoredSiteVisibility } from "@/lib/site-settings"

export async function getAccessState() {
  const visibility = await getStoredSiteVisibility()
  const isAdmin = await verifyAdminSession()
  const isViewer = isAdmin ? true : await verifyViewerSession()

  if (visibility === "public") {
    return {
      visibility,
      canView: true,
      canEdit: isAdmin,
      isAdmin,
      isViewer,
      hasSession: isAdmin || isViewer,
    }
  }

  if (visibility === "private") {
    return {
      visibility,
      canView: isAdmin,
      canEdit: isAdmin,
      isAdmin,
      isViewer: false,
      hasSession: isAdmin,
    }
  }

  return {
    visibility,
    canView: isAdmin || isViewer,
    canEdit: isAdmin,
    isAdmin,
    isViewer,
    hasSession: isAdmin || isViewer,
  }
}
