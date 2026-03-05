"use client"

import { ActivityCalendar } from "react-activity-calendar"
import type { ThemeInput } from "react-activity-calendar"
import { Tooltip as ReactTooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"
import { useTranslation } from "@/components/i18n/i18n-provider"

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
}

const kairosTheme: ThemeInput = {
  light: ["#f5f5f4", "#fed7aa", "#fdba74", "#fb923c", "#ea580c"],
  dark: ["#1c1917", "#4a3728", "#92400e", "#d97706", "#f59e0b"],
}

function normalizeDateKey(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10)

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString().slice(0, 10)
}

function generateRollingYearData(data: ActivityDay[]): ActivityDay[] {
  const dataMap = new Map<string, ActivityDay>()

  for (const day of data) {
    const dateKey = normalizeDateKey(day.date)
    const existing = dataMap.get(dateKey)

    if (!existing) {
      dataMap.set(dateKey, {
        ...day,
        date: dateKey,
        level: day.level ?? (Math.min(4, day.count) as 0 | 1 | 2 | 3 | 4),
      })
      continue
    }

    const mergedCount = existing.count + day.count
    dataMap.set(dateKey, {
      date: dateKey,
      count: mergedCount,
      level: Math.min(4, mergedCount) as 0 | 1 | 2 | 3 | 4,
      details: {
        books: (existing.details?.books ?? 0) + (day.details?.books ?? 0),
        music: (existing.details?.music ?? 0) + (day.details?.music ?? 0),
        watches: (existing.details?.watches ?? 0) + (day.details?.watches ?? 0),
        games: (existing.details?.games ?? 0) + (day.details?.games ?? 0),
      },
    })
  }

  const result: ActivityDay[] = []

  const now = new Date()
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 364)

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10)
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

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const { t } = useTranslation()
  const fullData = generateRollingYearData(data)
  const legendColors = kairosTheme.light

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-card/60 p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-sm font-semibold text-foreground">
          {t("dashboard.activityYear")}
        </h2>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{t("dashboard.less")}</span>
          <div className="flex gap-0.5">
            {(legendColors ?? []).map(
              (color) => (
                <div
                  key={color}
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
              )
            )}
          </div>
          <span>{t("dashboard.more")}</span>
        </div>
      </div>
      <ActivityCalendar
        data={fullData}
        theme={kairosTheme}
        colorScheme="light"
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
              day.details.books > 0 && `${day.details.books} ${t("media.book")}`,
              day.details.music > 0 && `${day.details.music} ${t("media.music")}`,
              day.details.watches > 0 && `${day.details.watches} ${t("media.watch")}`,
              day.details.games > 0 && `${day.details.games} ${t("media.game")}`,
            ]
              .filter(Boolean)
              .join(", ")
            : `${day.count} ${t("dashboard.items")}`

          return (
            <g data-tooltip-id="heatmap-tooltip" data-tooltip-content={`${day.date}: ${tooltipContent}`}>
              {block}
            </g>
          )
        }}
      />
      <ReactTooltip
        id="heatmap-tooltip"
        className="!rounded-lg !border !border-border !bg-popover !px-3 !py-1.5 !text-xs !text-popover-foreground"
      />
    </div>
  )
}
