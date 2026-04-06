export type ShareProfileUser = {
  username: string
  isPublicProfile: boolean
}

export function buildPublicProfilePath(username: string): string {
  return `/u/${encodeURIComponent(username.trim().toLowerCase())}`
}

export function buildPublicProfileUrl(origin: string, username: string): string {
  return new URL(buildPublicProfilePath(username), origin).toString()
}

export function canShareRecentActivity(user: ShareProfileUser | null | undefined): boolean {
  return Boolean(user?.isPublicProfile && user.username.trim())
}
