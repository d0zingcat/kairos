export const dynamic = "force-dynamic"

import { getPublicPlazaFeed, getPublicUserSummaries } from "@/lib/actions/plaza"
import { verifySession } from "@/lib/auth"
import { PlazaClient } from "@/components/plaza/plaza-client"

export default async function PlazaPage() {
  const [publicUsers, feedResult, hasSession] = await Promise.all([
    getPublicUserSummaries(),
    getPublicPlazaFeed({ limit: 20 }),
    verifySession(),
  ])

  const initialItems = feedResult.items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }))

  return (
    <PlazaClient
      publicUsers={publicUsers}
      initialItems={initialItems}
      nextCursor={feedResult.nextCursor}
      hasMore={feedResult.hasMore}
      hasSession={!!hasSession}
    />
  )
}