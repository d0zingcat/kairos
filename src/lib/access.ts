import { getCurrentUser } from "@/lib/auth"

export async function getAccessState() {
  const user = await getCurrentUser()
  const isAdmin = user?.role === "admin"
  const hasSession = Boolean(user)

  return {
    canView: hasSession,
    canEdit: hasSession,
    isAdmin,
    isViewer: false,
    hasSession,
  }
}
