export const dynamic = "force-dynamic"

import { getPublicPlazaFeed, getPublicUserSummaries } from "@/lib/actions/plaza"
import { DashboardPlazaClient } from "@/components/plaza/dashboard-plaza-client"

export default async function DashboardPlazaPage() {
  const [publicUsers, feedResult] = await Promise.all([
    getPublicUserSummaries(),
    getPublicPlazaFeed({ limit: 20 }),
  ])

  const initialItems = feedResult.items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }))

  return (
    <DashboardPlazaClient
      publicUsers={publicUsers}
      initialItems={initialItems}
      nextCursor={feedResult.nextCursor}
      hasMore={feedResult.hasMore}
    />
  )
}