"use client"

import { useEffect, useState, useTransition } from "react"
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
  updateBook,
  createMusic,
  updateMusic,
  createWatch,
  updateWatch,
  createGame,
  updateGame,
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
  const toDateString = (value: unknown): string => {
    if (typeof value === "string") return value
    if (value instanceof Date) return format(value, "yyyy-MM-dd")
    return ""
  }

  const [rating, setRating] = useState(0)
  const [date, setDate] = useState<Date>(new Date())
  const [status, setStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [favorite, setFavorite] = useState(false)
  const [bookAuthors, setBookAuthors] = useState("")
  const [bookCategories, setBookCategories] = useState("")
  const [bookStartDate, setBookStartDate] = useState("")
  const [bookFinishDate, setBookFinishDate] = useState("")
  const [isPending, startTransition] = useTransition()

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
      ? "want_to_read"
      : mediaType === "watch"
        ? "finished"
        : mediaType === "game"
          ? "completed"
          : undefined

  useEffect(() => {
    if (!item || !mediaType) return

    const meta = item.meta as Record<string, unknown>
    const localId = typeof meta.localId === "string" ? meta.localId : null
    const today = format(new Date(), "yyyy-MM-dd")
    const authors = Array.isArray(meta.authors) ? (meta.authors as string[]) : []
    const categories = Array.isArray(meta.categories) ? (meta.categories as string[]) : []
    const existingStartDate = toDateString(meta.startDate)
    const existingFinishDate = toDateString(meta.finishDate)
    const existingNotes = typeof meta.notes === "string" ? meta.notes : ""
    const existingRating = typeof meta.rating === "number" ? meta.rating : 0
    const existingFavorite = typeof meta.favorite === "boolean" ? meta.favorite : false
    const existingStatus = typeof meta.status === "string" ? meta.status : ""

    const parseDateInput = (value: unknown): Date | null => {
      if (typeof value !== "string" || !value) return null
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    const activityDate =
      parseDateInput(meta.listenDate) ??
      parseDateInput(meta.watchDate) ??
      parseDateInput(meta.finishDate)

    setDate(activityDate ?? new Date())
    setBookAuthors(authors.join(", "))
    setBookCategories(categories.join(", "))
    setBookStartDate(localId ? existingStartDate : existingStartDate || today)
    setBookFinishDate(localId ? existingFinishDate : existingFinishDate)
    setNotes(existingNotes)
    setRating(existingRating)
    setFavorite(existingFavorite)
    setStatus(existingStatus)
  }, [item, mediaType])

  if (!item || !mediaType) return null

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
            {
              const parsedAuthors = bookAuthors
                .split(",")
                .map((entry) => entry.trim())
                .filter(Boolean)

              const parsedCategories = bookCategories
                .split(",")
                .map((entry) => entry.trim())
                .filter(Boolean)

              const localId = typeof meta.localId === "string" ? meta.localId : null
              const existingAuthors = Array.isArray(meta.authors)
                ? (meta.authors as string[])
                : []
              const existingCategories = Array.isArray(meta.categories)
                ? (meta.categories as string[])
                : []

              const authors = parsedAuthors.length > 0
                ? parsedAuthors
                : localId
                  ? existingAuthors
                  : []

              const categories = parsedCategories.length > 0
                ? parsedCategories
                : localId
                  ? existingCategories
                  : []

              const resolvedStartDate =
                bookStartDate || (localId ? toDateString(meta.startDate) : "")
              const resolvedFinishDate =
                bookFinishDate || (localId ? toDateString(meta.finishDate) : "")

              const subtitle =
                typeof meta.subtitle === "string"
                  ? meta.subtitle
                  : localId
                    ? typeof meta.subtitle === "string"
                      ? meta.subtitle
                      : null
                    : null
              const isbn =
                typeof meta.isbn === "string"
                  ? meta.isbn
                  : localId
                    ? typeof meta.isbn === "string"
                      ? meta.isbn
                      : null
                    : null
              const pageCount =
                typeof meta.pageCount === "number"
                  ? meta.pageCount
                  : localId
                    ? typeof meta.pageCount === "number"
                      ? meta.pageCount
                      : null
                    : null
              const coverUrl =
                item.coverUrl ??
                (typeof meta.coverUrl === "string" ? meta.coverUrl : null)

              const payload = {
                title: item.title,
                subtitle,
                authors,
                coverUrl,
                isbn,
                pageCount,
                status: (status || defaultStatus) as "want_to_read" | "reading" | "finished" | "abandoned",
                rating: rating > 0 ? rating : null,
                notes: notes || null,
                favorite,
                startDate: resolvedStartDate || null,
                finishDate: resolvedFinishDate || null,
                tags: categories,
              }

              if (localId) {
                await updateBook(localId, payload)
              } else {
                await createBook({
                  ...payload,
                  externalId: item.externalId,
                })
              }
            }
            break

          case "music":
            {
              const localId = typeof meta.localId === "string" ? meta.localId : null
              const existingType =
                typeof meta.musicType === "string"
                  ? (meta.musicType as "track" | "album")
                  : "album"
              const existingArtist = typeof meta.artist === "string" ? meta.artist : null
              const existingAlbumTitle = typeof meta.albumTitle === "string" ? meta.albumTitle : null
              const existingGenre = Array.isArray(meta.genre) ? (meta.genre as string[]) : []
              const existingTags = Array.isArray(meta.tags) ? (meta.tags as string[]) : []
              const existingCoverUrl = typeof meta.coverUrl === "string" ? meta.coverUrl : null
              const existingExternalId = typeof meta.externalId === "string" ? meta.externalId : null
              const payload = {
                title: item.title,
                rating: rating > 0 ? rating : null,
                notes: notes || null,
                favorite,
                type: existingType,
                artist: item.subtitle || existingArtist,
                albumTitle: existingAlbumTitle,
                genre: existingGenre,
                tags: existingTags,
                coverUrl: item.coverUrl || existingCoverUrl,
                listenDate: format(date, "yyyy-MM-dd"),
              }

              if (localId) {
                await updateMusic(localId, payload)
              } else {
                await createMusic({
                  ...payload,
                  externalId: item.externalId || existingExternalId,
                })
              }
            }
            break

          case "watch":
            {
              const localId = typeof meta.localId === "string" ? meta.localId : null
              const existingType =
                (typeof meta.type === "string" ? meta.type : item.type === "tv" ? "tv" : "movie") as "movie" | "tv"
              const existingGenre = Array.isArray(meta.genre) ? (meta.genre as string[]) : []
              const existingDirector = typeof meta.director === "string" ? meta.director : null
              const existingRuntime = typeof meta.runtime === "number" ? meta.runtime : null
              const existingSeasonNumber = typeof meta.seasonNumber === "number" ? meta.seasonNumber : null
              const existingEpisodeNumber = typeof meta.episodeNumber === "number" ? meta.episodeNumber : null
              const existingTags = Array.isArray(meta.tags) ? (meta.tags as string[]) : []
              const existingPosterUrl = typeof meta.posterUrl === "string" ? meta.posterUrl : null
              const existingExternalId = typeof meta.externalId === "string" ? meta.externalId : null
              const payload = {
                title: item.title,
                rating: rating > 0 ? rating : null,
                notes: notes || null,
                favorite,
                type: existingType,
                posterUrl: item.coverUrl || existingPosterUrl,
                director: existingDirector,
                genre: existingGenre,
                runtime: existingRuntime,
                seasonNumber: existingSeasonNumber,
                episodeNumber: existingEpisodeNumber,
                tags: existingTags,
                status: (status || defaultStatus) as "want_to_watch" | "watching" | "finished" | "abandoned",
                watchDate: format(date, "yyyy-MM-dd"),
              }

              if (localId) {
                await updateWatch(localId, payload)
              } else {
                await createWatch({
                  ...payload,
                  externalId: item.externalId || existingExternalId,
                })
              }
            }
            break

          case "game":
            {
              const localId = typeof meta.localId === "string" ? meta.localId : null
              const existingPlatforms = Array.isArray(meta.platforms) ? (meta.platforms as string[]) : []
              const existingGenre = Array.isArray(meta.genre) ? (meta.genre as string[]) : []
              const existingTags = Array.isArray(meta.tags) ? (meta.tags as string[]) : []
              const existingDeveloper = typeof meta.developer === "string" ? meta.developer : null
              const existingStartDate = toDateString(meta.startDate)
              const existingPlayTimeMinutes = typeof meta.playTimeMinutes === "number" ? meta.playTimeMinutes : null
              const existingCoverUrl = typeof meta.coverUrl === "string" ? meta.coverUrl : null
              const existingExternalId = typeof meta.externalId === "string" ? meta.externalId : null
              const payload = {
                title: item.title,
                rating: rating > 0 ? rating : null,
                notes: notes || null,
                favorite,
                coverUrl: item.coverUrl || existingCoverUrl,
                platforms: existingPlatforms,
                genre: existingGenre,
                developer: existingDeveloper,
                startDate: existingStartDate || null,
                playTimeMinutes: existingPlayTimeMinutes,
                tags: existingTags,
                status: (status || defaultStatus) as "backlog" | "playing" | "completed" | "abandoned" | "platinum",
                finishDate: format(date, "yyyy-MM-dd"),
              }

              if (localId) {
                await updateGame(localId, payload)
              } else {
                await createGame({
                  ...payload,
                  externalId: item.externalId || existingExternalId,
                })
              }
            }
            break
        }

        // Reset and close
        setRating(0)
        setDate(new Date())
        setStatus("")
        setNotes("")
        setFavorite(false)
        setBookAuthors("")
        setBookCategories("")
        setBookStartDate("")
        setBookFinishDate("")
        onOpenChange(false)
      } catch (error) {
        // Error is handled silently; could add toast notification later
      }
    })
  }

  // Quick rating via keyboard 1-5
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement
    const tagName = target.tagName.toLowerCase()
    const isTypingField =
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select" ||
      target.isContentEditable

    if (isTypingField) {
      return
    }

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

          {mediaType === "book" ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
                    开始阅读
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-zinc-800 bg-zinc-900 text-left text-zinc-300 hover:bg-zinc-800"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bookStartDate
                          ? format(new Date(bookStartDate), "yyyy年MM月dd日", { locale: zhCN })
                          : "选择开始日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-zinc-800 bg-zinc-900 p-0">
                      <Calendar
                        mode="single"
                        selected={bookStartDate ? new Date(bookStartDate) : undefined}
                        onSelect={(d) => setBookStartDate(d ? format(d, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
                    结束阅读
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-zinc-800 bg-zinc-900 text-left text-zinc-300 hover:bg-zinc-800"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bookFinishDate
                          ? format(new Date(bookFinishDate), "yyyy年MM月dd日", { locale: zhCN })
                          : "选择结束日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-zinc-800 bg-zinc-900 p-0">
                      <Calendar
                        mode="single"
                        selected={bookFinishDate ? new Date(bookFinishDate) : undefined}
                        onSelect={(d) => setBookFinishDate(d ? format(d, "yyyy-MM-dd") : "")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  作者（逗号分隔）
                </label>
                <Input
                  value={bookAuthors}
                  onChange={(e) => setBookAuthors(e.target.value)}
                  placeholder="例如：刘慈欣, 王小波"
                  className="border-zinc-800 bg-zinc-900 text-zinc-300 placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  类别（逗号分隔）
                </label>
                <Input
                  value={bookCategories}
                  onChange={(e) => setBookCategories(e.target.value)}
                  placeholder="例如：科幻, 小说"
                  className="border-zinc-800 bg-zinc-900 text-zinc-300 placeholder:text-zinc-600"
                />
              </div>
            </>
          ) : (
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
          )}

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
              {mediaType === "book" ? "我的评价" : "笔记"}
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
