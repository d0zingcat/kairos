"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MEDIA_TYPES } from "@/lib/constants"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface StatsCardsProps {
  stats: {
    total: Record<string, number>
    monthly: Record<string, number>
    yearly: Record<string, number>
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards: { label: string; value: number; color: string; icon?: LucideIcon }[] = [
    { label: "本月", value: stats.monthly.all, color: "from-amber-500/20 to-orange-500/20" },
    { label: "本年", value: stats.yearly.all, color: "from-emerald-500/20 to-teal-500/20" },
    { label: "总计", value: stats.total.all, color: "from-violet-500/20 to-purple-500/20" },
    ...Object.entries(MEDIA_TYPES).map(([key, config]) => ({
      label: config.label,
      value: stats.total[key === "watch" ? "watches" : `${key}s`] ?? stats.total[key] ?? 0,
      color: "from-muted/70 to-muted/40",
      icon: config.icon,
    })),
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className={`border-border/60 bg-gradient-to-br ${card.color} backdrop-blur`}>
            <CardContent className="px-4 py-3">
              <div className="flex items-center gap-2">
                {card.icon && <card.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              </div>
              <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                {card.value}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
