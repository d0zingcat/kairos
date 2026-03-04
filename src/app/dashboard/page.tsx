export const dynamic = "force-dynamic"

import { getStats, getRecentActivity, getFavorites, getActivityData } from "@/lib/actions/entries"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityHeatmap } from "@/components/heatmap/activity-heatmap"
import { RecentTimeline } from "@/components/dashboard/recent-timeline"
import { FavoritesGrid } from "@/components/dashboard/favorites-grid"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function DashboardPage() {
  const [stats, activity, recent, favorites] = await Promise.all([
    getStats(),
    getActivityData(365),
    getRecentActivity(15),
    getFavorites(),
  ])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <DashboardHeader />

      {/* Heatmap */}
      <ActivityHeatmap data={activity} />

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Recent + Favorites */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTimeline items={recent} />
        </div>
        <div>
          <FavoritesGrid items={favorites} />
        </div>
      </div>
    </div>
  )
}
