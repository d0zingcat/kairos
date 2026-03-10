"use client"

import { useEffect, useState, useTransition } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/ui/tag-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Star, Loader2, Trash2, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { zhCN, enUS } from "date-fns/locale"
import { useI18n } from "@/components/i18n/i18n-provider"
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
  deleteBook,
  deleteMusic,
  deleteWatch,
  deleteGame,
} from "@/lib/actions/entries"
import type { SearchResultItem } from "@/lib/search-utils"

interface EntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: SearchResultItem | null
  mediaType: MediaType | null
  canEdit?: boolean
}

export function EntryDialog({
  open,
  onOpenChange,
  item,
  mediaType,
  canEdit = true,
}: EntryDialogProps) {
  const { t, locale } = useI18n()
  const dateLocale = locale === "zh" ? zhCN : enUS
  const dateFormat = t("entry.dateFormat")
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
  const [bookAuthors, setBookAuthors] = useState<string[]>([])
  const [bookCategories, setBookCategories] = useState<string[]>([])
  const [bookStartDate, setBookStartDate] = useState("")
  const [bookFinishDate, setBookFinishDate] = useState("")
  const [musicType, setMusicType] = useState<"track" | "album">("album")
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

  /* eslint-disable react-hooks/set-state-in-effect */
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
    const existingMusicType = typeof meta.musicType === "string" ? (meta.musicType as "track" | "album") : "album"

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
    setBookAuthors(authors)
    setBookCategories(categories)
    setBookStartDate(localId ? existingStartDate : existingStartDate || today)
    setBookFinishDate(localId ? existingFinishDate : existingFinishDate)
    setNotes(existingNotes)
    setRating(existingRating)
    setFavorite(existingFavorite)
    setStatus(existingStatus)
    setMusicType(existingMusicType)
  }, [item, mediaType])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!item || !mediaType || !canEdit) return null

  const handleSave = () => {
    startTransition(async () => {
      try {
        const meta = item.meta as Record<string, unknown>

        switch (mediaType) {
          case "book":
            {
              const parsedAuthors = bookAuthors
                .map((entry) => entry.trim())
                .filter(Boolean)

              const parsedCategories = bookCategories
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
                type: musicType,
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
        setBookAuthors([])
        setBookCategories([])
        setBookStartDate("")
        setBookFinishDate("")
        onOpenChange(false)
      } catch {
        // Error is handled silently; could add toast notification later
      }
    })
  }

  const handleDelete = () => {
    if (!item) return
    const meta = item.meta as Record<string, unknown>
    const localId = typeof meta.localId === "string" ? meta.localId : null
    if (!localId) return

    if (!confirm(t("entry.confirmDelete"))) {
      return
    }

    startTransition(async () => {
      try {
        switch (mediaType) {
          case "book":
            await deleteBook(localId)
            break
          case "music":
            await deleteMusic(localId)
            break
          case "watch":
            await deleteWatch(localId)
            break
          case "game":
            await deleteGame(localId)
            break
        }
        onOpenChange(false)
      } catch {
        // Handle error
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
        className="flex max-h-[90vh] flex-col overflow-hidden border-border bg-popover sm:max-w-lg"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">{t("entry.title")}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 space-y-5 overflow-y-auto pr-1">
          {/* Item preview */}
          <div className="flex gap-4">
            {item.coverUrl ? (
              <Image
                src={item.coverUrl}
                alt={item.title}
                width={64}
                height={96}
                unoptimized
                className="h-24 w-16 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                ?
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="mt-0.5 text-sm text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              {t("entry.rating")}
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
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/10
                </span>
              )}
            </div>
          </div>

          {mediaType === "book" ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {t("entry.startDate")}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-border bg-card text-left text-foreground hover:bg-accent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bookStartDate
                          ? format(new Date(bookStartDate), dateFormat, { locale: dateLocale })
                          : t("entry.selectStartDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-border bg-popover p-0">
                      <Calendar
                        mode="single"
                        selected={bookStartDate ? new Date(bookStartDate) : undefined}
                        onSelect={(d) => setBookStartDate(d ? format(d, "yyyy-MM-dd") : "")}
                        initialFocus
                        locale={dateLocale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">
                    {t("entry.finishDate")}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-border bg-card text-left text-foreground hover:bg-accent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bookFinishDate
                          ? format(new Date(bookFinishDate), dateFormat, { locale: dateLocale })
                          : t("entry.selectFinishDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-border bg-popover p-0">
                      <Calendar
                        mode="single"
                        selected={bookFinishDate ? new Date(bookFinishDate) : undefined}
                        onSelect={(d) => setBookFinishDate(d ? format(d, "yyyy-MM-dd") : "")}
                        initialFocus
                        locale={dateLocale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  {t("entry.author")}
                </label>
                <TagInput
                  value={bookAuthors}
                  onChange={setBookAuthors}
                  placeholder={t("entry.authorPlaceholder")}
                  colored={false}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  {t("entry.category")}
                </label>
                <TagInput
                  value={bookCategories}
                  onChange={setBookCategories}
                  placeholder={t("entry.categoryPlaceholder")}
                />
              </div>
            </>
          ) : mediaType === "music" ? (
            <>
              {/* Music Type - Locked for external sources (Spotify/MusicBrainz), editable for manual entries */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  类型
                </label>
                <Select
                  value={musicType}
                  onValueChange={(value: "track" | "album") => setMusicType(value)}
                  disabled={
                    // Lock type for external sources to maintain data consistency
                    (item.meta as Record<string, unknown>).source === "spotify" ||
                    (item.meta as Record<string, unknown>).source === "musicbrainz" ||
                    (item.meta as Record<string, unknown>).source === "external"
                  }
                >
                  <SelectTrigger className="border-border bg-card text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    <SelectItem value="album">专辑 (Album)</SelectItem>
                    <SelectItem value="track">单曲 (Track)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {(item.meta as Record<string, unknown>).source === "spotify" ||
                    (item.meta as Record<string, unknown>).source === "musicbrainz" ||
                    (item.meta as Record<string, unknown>).source === "external"
                    ? "外部数据源，类型已锁定"
                    : "手动输入时请选择类型"}
                </p>
              </div>
              {/* Date Picker */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  {t("entry.date")}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-border bg-card text-left text-foreground hover:bg-accent"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, dateFormat, { locale: dateLocale })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-border bg-popover p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          ) : (
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                {t("entry.date")}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border bg-card text-left text-foreground hover:bg-accent"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, dateFormat, { locale: dateLocale })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-border bg-popover p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    locale={dateLocale}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Status */}
          {statuses && (
            <div>
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                {t("entry.status")}
              </label>
              <Select
                value={status || defaultStatus}
                onValueChange={setStatus}
              >
                <SelectTrigger className="border-border bg-card text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {t(`${mediaType}Status.${s.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              {mediaType === "book" ? t("entry.myRating") : t("entry.note")}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("entry.notePlaceholder")}
              className="min-h-[80px] max-h-56 resize-y overflow-y-auto border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFavorite(!favorite)}
                className={cn(
                  "transition-colors",
                  favorite
                    ? "text-rose-400 hover:text-rose-300"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Heart
                  className={cn("h-5 w-5", favorite && "fill-current")}
                />
              </Button>

              {((item.meta as Record<string, unknown>).localId as string) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
