"use client"

import { ActivityCalendar } from "react-activity-calendar"
import type { ThemeInput } from "react-activity-calendar"
import { Tooltip as ReactTooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"

interface ActivityDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  details?: {
    books: number
    music: number
    watches: number
    games: number
  }
}

interface ActivityHeatmapProps {
  data: ActivityDay[]
  year: number
}

const kairosTheme: ThemeInput = {
  dark: ["#1c1917", "#4a3728", "#92400e", "#d97706", "#f59e0b"],
}

function generateFullYearData(data: ActivityDay[], year: number): ActivityDay[] {
  const dataMap = new Map(data.map((d) => [d.date, d]))
  const result: ActivityDay[] = []

  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0]
    const existing = dataMap.get(dateStr)
    result.push(
      existing ?? {
        date: dateStr,
        count: 0,
        level: 0,
      }
    )
  }

  return result
}

export function ActivityHeatmap({ data, year }: ActivityHeatmapProps) {
  const fullData = generateFullYearData(data, year)

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold text-zinc-300">
          {year} 活动记录
        </h2>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span>少</span>
          <div className="flex gap-0.5">
            {["#1c1917", "#4a3728", "#92400e", "#d97706", "#f59e0b"].map(
              (color) => (
                <div
                  key={color}
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
              )
            )}
          </div>
          <span>多</span>
        </div>
      </div>
      <ActivityCalendar
        data={fullData}
        theme={kairosTheme}
        colorScheme="dark"
        blockSize={12}
        blockMargin={3}
        blockRadius={3}
        fontSize={11}
        showColorLegend={false}
        showMonthLabels
        showTotalCount={false}
        renderBlock={(block, activity) => {
          const day = activity as ActivityDay
          const tooltipContent = day.details
            ? [
                day.details.books > 0 && `${day.details.books} 书`,
                day.details.music > 0 && `${day.details.music} 音乐`,
                day.details.watches > 0 && `${day.details.watches} 影视`,
                day.details.games > 0 && `${day.details.games} 游戏`,
              ]
                .filter(Boolean)
                .join(", ")
            : `${day.count} 条记录`

          return (
            <g data-tooltip-id="heatmap-tooltip" data-tooltip-content={`${day.date}: ${tooltipContent}`}>
              {block}
            </g>
          )
        }}
      />
      <ReactTooltip
        id="heatmap-tooltip"
        className="!rounded-lg !border !border-zinc-700 !bg-zinc-800 !px-3 !py-1.5 !text-xs !text-zinc-200"
      />
    </div>
  )
}
