"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Heart, CalendarIcon, Star, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  BOOK_STATUSES,
  WATCH_STATUSES,
  GAME_STATUSES,
  type MediaType,
} from "@/lib/constants"
import {
  createBook,
  createMusic,
  createWatch,
  createGame,
} from "@/lib/actions/entries"
import type { SearchResultItem } from "@/app/api/search/[type]/route"

interface EntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: SearchResultItem | null
  mediaType: MediaType | null
}

export function EntryDialog({
  open,
  onOpenChange,
  item,
  mediaType,
}: EntryDialogProps) {
  const [rating, setRating] = useState(0)
  const [date, setDate] = useState<Date>(new Date())
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [favorite, setFavorite] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!item || !mediaType) return null

  const statuses =
    mediaType === "book"
      ? BOOK_STATUSES
      : mediaType === "watch"
        ? WATCH_STATUSES
        : mediaType === "game"
          ? GAME_STATUSES
          : null

  const defaultStatus =
    mediaType === "book"
      ? "finished"
      : mediaType === "watch"
        ? "finished"
        : mediaType === "game"
          ? "completed"
          : undefined

  const handleSave = () => {
    startTransition(async () => {
      try {
        const baseData = {
          externalId: item.externalId,
          title: item.title,
          rating: rating > 0 ? rating : null,
          notes: notes || null,
          favorite,
        }

        const meta = item.meta as Record<string, unknown>

        switch (mediaType) {
          case "book":
            await createBook({
              ...baseData,
              subtitle: (meta.subtitle as string) ?? null,
              authors: (meta.authors as string[]) ?? [],
              coverUrl: item.coverUrl,
              isbn: (meta.isbn as string) ?? null,
              pageCount: (meta.pageCount as number) ?? null,
              status: (status || defaultStatus) as "want_to_read" | "reading" | "finished" | "abandoned",
              finishDate: format(date, "yyyy-MM-dd"),
            })
            break

          case "music":
            await createMusic({
              ...baseData,
              type: ((meta.musicType as string) ?? "album") as "track" | "album",
              artist: item.subtitle,
              coverUrl: item.coverUrl,
              listenDate: format(date, "yyyy-MM-dd"),
            })
            break

          case "watch":
            await createWatch({
              ...baseData,
              type: (item.type === "tv" ? "tv" : "movie") as "movie" | "tv",
              posterUrl: item.coverUrl,
              genre: (meta.genre as string[]) ?? [],
              status: (status || defaultStatus) as "want_to_watch" | "watching" | "finished" | "abandoned",
              watchDate: format(date, "yyyy-MM-dd"),
            })
            break

          case "game":
            await createGame({
              ...baseData,
              coverUrl: item.coverUrl,
              platforms: (meta.platforms as string[]) ?? [],
              genre: (meta.genre as string[]) ?? [],
              developer: (meta.developer as string) ?? null,
              status: (status || defaultStatus) as "backlog" | "playing" | "completed" | "abandoned" | "platinum",
              finishDate: format(date, "yyyy-MM-dd"),
            })
            break
        }

        // Reset and close
        setRating(0)
        setDate(new Date())
        setStatus("")
        setNotes("")
        setFavorite(false)
        onOpenChange(false)
      } catch (error) {
        // Error is handled silently; could add toast notification later
      }
    })
  }

  // Quick rating via keyboard 1-5
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const num = parseInt(e.key)
    if (num >= 1 && num <= 5) {
      setRating(num * 2) // 1-5 maps to 2,4,6,8,10
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-zinc-800 bg-zinc-900 sm:max-w-lg"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-zinc-100">录入记录</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Item preview */}
          <div className="flex gap-4">
            {item.coverUrl ? (
              <img
                src={item.coverUrl}
                alt={item.title}
                className="h-24 w-16 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                ?
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-zinc-100">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="mt-0.5 text-sm text-zinc-400">{item.subtitle}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              评分 (按 1-5 快速评分)
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star * 2)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-6 w-6 transition-colors",
                      star * 2 <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-700"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-zinc-400">
                  {rating}/10
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              日期
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-800 bg-zinc-900 text-left text-zinc-300 hover:bg-zinc-800"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "yyyy年MM月dd日", { locale: zhCN })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto border-zinc-800 bg-zinc-900 p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          {statuses && (
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                状态
              </label>
              <Select
                value={status || defaultStatus}
                onValueChange={setStatus}
              >
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900">
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              笔记
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="写点什么..."
              className="min-h-[80px] border-zinc-800 bg-zinc-900 text-zinc-300 placeholder:text-zinc-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFavorite(!favorite)}
              className={cn(
                "transition-colors",
                favorite
                  ? "text-rose-400 hover:text-rose-300"
                  : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <Heart
                className={cn("h-5 w-5", favorite && "fill-current")}
              />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                保存
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
