"use server"

import { db } from "@/db"
import { books, music, watches, games } from "@/db/schema"
import type { NewBook, NewMusic, NewWatch, NewGame } from "@/db/schema"
import { eq, desc, sql, and, ilike, count, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getTVDetail } from "@/lib/api/tmdb"
import { bookSchema, musicSchema, watchSchema, gameSchema } from "@/lib/validations/entry"

type BookInput = Omit<NewBook, "userId">
type MusicInput = Omit<NewMusic, "userId">
type WatchInput = Omit<NewWatch, "userId">
type GameInput = Omit<NewGame, "userId">

async function requireCurrentUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login?next=%2Fdashboard")
  }
  return user
}

async function validateTmdbTvSeasonSelection(input: {
  externalId: string | null
  seasonNumber: number | null
  type: "movie" | "tv"
}): Promise<string | null> {
  if (input.type !== "tv" || input.seasonNumber == null) {
    return null
  }

  if (!input.externalId || !/^\d+$/.test(input.externalId)) {
    return "缺少有效的 TMDB 剧集信息，无法保存季数"
  }

  try {
    const detail = await getTVDetail(Number(input.externalId))
    const validSeasonNumbers = detail.seasons?.length
      ? detail.seasons
          .map((season) => season.season_number)
          .filter((seasonNumber) => seasonNumber > 0)
      : Array.from({ length: detail.number_of_seasons ?? 0 }, (_, index) => index + 1)

    if (validSeasonNumbers.length === 0) {
      return null
    }

    return validSeasonNumbers.includes(input.seasonNumber)
      ? null
      : "请选择有效的季数"
  } catch {
    return "季信息校验失败，请稍后重试"
  }
}

// ── Books ────────────────────────────────────────────────
export async function createBook(data: BookInput) {
  const user = await requireCurrentUser()
  const result = bookSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }
  const [book] = await db.insert(books).values({ ...result.data, userId: user.id }).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/books")
  return { success: true, data: book }
}

export async function updateBook(id: string, data: Partial<BookInput>) {
  const user = await requireCurrentUser()
  const result = bookSchema.partial().safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }
  const [book] = await db.update(books).set(result.data).where(and(eq(books.id, id), eq(books.userId, user.id))).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/books")
  return { success: true, data: book }
}

export async function deleteBook(id: string) {
  const user = await requireCurrentUser()
  await db.delete(books).where(and(eq(books.id, id), eq(books.userId, user.id)))
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/books")
}

export async function getBooks(options?: {
  status?: string
  search?: string
  sort?: string
  limit?: number
  offset?: number
}) {
  const user = await requireCurrentUser()
  const conditions = [eq(books.userId, user.id)]
  if (options?.status) {
    conditions.push(eq(books.status, options.status as typeof books.status.enumValues[number]))
  }
  if (options?.search) {
    conditions.push(ilike(books.title, `%${options.search}%`))
  }

  const orderBy = options?.sort === "rating"
    ? desc(books.rating)
    : options?.sort === "title"
      ? books.title
      : desc(books.updatedAt)

  return db.query.books.findMany({
    where: and(...conditions),
    orderBy: [orderBy],
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0,
  })
}

export async function getBook(id: string) {
  const user = await requireCurrentUser()
  return db.query.books.findFirst({ where: and(eq(books.id, id), eq(books.userId, user.id)) })
}

// ── Music ────────────────────────────────────────────────
export async function createMusic(data: MusicInput) {
  const user = await requireCurrentUser()
  const result = musicSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }
  const [item] = await db.insert(music).values({ ...result.data, userId: user.id }).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/music")
  return { success: true, data: item }
}

export async function updateMusic(id: string, data: Partial<MusicInput>) {
  const user = await requireCurrentUser()
  const result = musicSchema.partial().safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }
  const [item] = await db.update(music).set(result.data).where(and(eq(music.id, id), eq(music.userId, user.id))).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/music")
  return { success: true, data: item }
}

export async function deleteMusic(id: string) {
  const user = await requireCurrentUser()
  await db.delete(music).where(and(eq(music.id, id), eq(music.userId, user.id)))
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/music")
}

export async function getMusicList(options?: {
  search?: string
  sort?: string
  limit?: number
  offset?: number
}) {
  const user = await requireCurrentUser()
  const conditions = [eq(music.userId, user.id)]
  if (options?.search) {
    conditions.push(ilike(music.title, `%${options.search}%`))
  }

  const orderBy = options?.sort === "rating"
    ? desc(music.rating)
    : options?.sort === "title"
      ? music.title
      : desc(music.updatedAt)

  return db.query.music.findMany({
    where: and(...conditions),
    orderBy: [orderBy],
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0,
  })
}

// ── Watches ──────────────────────────────────────────────
export async function createWatch(data: WatchInput) {
  const user = await requireCurrentUser()
  const result = watchSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const seasonValidationError = await validateTmdbTvSeasonSelection({
    externalId: result.data.externalId ?? null,
    seasonNumber: result.data.seasonNumber ?? null,
    type: result.data.type ?? "movie",
  })
  if (seasonValidationError) {
    return { success: false, error: seasonValidationError }
  }

  const [item] = await db.insert(watches).values({ ...result.data, userId: user.id }).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/watches")
  return { success: true, data: item }
}

export async function updateWatch(id: string, data: Partial<WatchInput>) {
  const user = await requireCurrentUser()
  const result = watchSchema.partial().safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const currentWatch = await db.query.watches.findFirst({
    where: and(eq(watches.id, id), eq(watches.userId, user.id)),
  })
  if (!currentWatch) {
    return { success: false, error: "记录不存在" }
  }

  const seasonValidationError = await validateTmdbTvSeasonSelection({
    externalId: result.data.externalId ?? currentWatch.externalId,
    seasonNumber: result.data.seasonNumber ?? currentWatch.seasonNumber,
    type: result.data.type ?? currentWatch.type,
  })
  if (seasonValidationError) {
    return { success: false, error: seasonValidationError }
  }

  const [item] = await db.update(watches).set(result.data).where(and(eq(watches.id, id), eq(watches.userId, user.id))).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/watches")
  return { success: true, data: item }
}

export async function deleteWatch(id: string) {
  const user = await requireCurrentUser()
  await db.delete(watches).where(and(eq(watches.id, id), eq(watches.userId, user.id)))
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/watches")
}

export async function getWatches(options?: {
  status?: string
  type?: string
  search?: string
  sort?: string
  limit?: number
  offset?: number
}) {
  const user = await requireCurrentUser()
  const conditions = [eq(watches.userId, user.id)]
  if (options?.status) {
    conditions.push(eq(watches.status, options.status as typeof watches.status.enumValues[number]))
  }
  if (options?.type) {
    conditions.push(eq(watches.type, options.type as typeof watches.type.enumValues[number]))
  }
  if (options?.search) {
    conditions.push(ilike(watches.title, `%${options.search}%`))
  }

  const orderBy = options?.sort === "rating"
    ? desc(watches.rating)
    : options?.sort === "title"
      ? watches.title
      : desc(watches.updatedAt)

  return db.query.watches.findMany({
    where: and(...conditions),
    orderBy: [orderBy],
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0,
  })
}

// ── Games ────────────────────────────────────────────────
export async function createGame(data: GameInput) {
  const user = await requireCurrentUser()
  const result = gameSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }
  const [item] = await db.insert(games).values({ ...result.data, userId: user.id }).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/games")
  return { success: true, data: item }
}

export async function updateGame(id: string, data: Partial<GameInput>) {
  const user = await requireCurrentUser()
  const result = gameSchema.partial().safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }
  const [item] = await db.update(games).set(result.data).where(and(eq(games.id, id), eq(games.userId, user.id))).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/games")
  return { success: true, data: item }
}

export async function deleteGame(id: string) {
  const user = await requireCurrentUser()
  await db.delete(games).where(and(eq(games.id, id), eq(games.userId, user.id)))
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/games")
}

export async function getGames(options?: {
  status?: string
  search?: string
  sort?: string
  limit?: number
  offset?: number
}) {
  const user = await requireCurrentUser()
  const conditions = [eq(games.userId, user.id)]
  if (options?.status) {
    conditions.push(eq(games.status, options.status as typeof games.status.enumValues[number]))
  }
  if (options?.search) {
    conditions.push(ilike(games.title, `%${options.search}%`))
  }

  const orderBy = options?.sort === "rating"
    ? desc(games.rating)
    : options?.sort === "title"
      ? games.title
      : desc(games.updatedAt)

  return db.query.games.findMany({
    where: and(...conditions),
    orderBy: [orderBy],
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0,
  })
}

// ── Aggregations ─────────────────────────────────────────
export async function getActivityData(days = 365) {
  const user = await requireCurrentUser()

  const normalizeDate = (value: string | Date | null | undefined) => {
    if (!value) return null
    if (value instanceof Date) return value.toISOString().slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10)

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toISOString().slice(0, 10)
  }

  const now = new Date()
  const endDate = normalizeDate(now)
  if (!endDate) return []
  const start = new Date(now)
  start.setDate(start.getDate() - Math.max(1, days) + 1)
  const startDate = normalizeDate(start)
  if (!startDate) return []

  const musicDateExpr = sql<string>`date(${music.createdAt})`
  const watchDateExpr = sql<string>`date(${watches.createdAt})`
  const gameDateExpr = sql<string>`date(${games.createdAt})`

  const [bookRows, musicActivity, watchActivity, gameActivity] = await Promise.all([
    db
      .select({ createdAt: books.createdAt, startDate: books.startDate, finishDate: books.finishDate })
      .from(books)
      .where(
        and(
          eq(books.userId, user.id),
          sql`date(${books.createdAt}) <= ${endDate}::date`
        )
      ),
    db
      .select({ date: musicDateExpr, count: count() })
      .from(music)
      .where(
        and(
          eq(music.userId, user.id),
          sql`${musicDateExpr} >= ${startDate}::date`,
          sql`${musicDateExpr} <= ${endDate}::date`
        )
      )
      .groupBy(musicDateExpr),
    db
      .select({ date: watchDateExpr, count: count() })
      .from(watches)
      .where(
        and(
          eq(watches.userId, user.id),
          sql`${watchDateExpr} >= ${startDate}::date`,
          sql`${watchDateExpr} <= ${endDate}::date`
        )
      )
      .groupBy(watchDateExpr),
    db
      .select({ date: gameDateExpr, count: count() })
      .from(games)
      .where(
        and(
          eq(games.userId, user.id),
          sql`${gameDateExpr} >= ${startDate}::date`,
          sql`${gameDateExpr} <= ${endDate}::date`
        )
      )
      .groupBy(gameDateExpr),
  ])

  const dateMap = new Map<string, { total: number; books: number; music: number; watches: number; games: number }>()
  const isDateInRange = (date: string) => date >= startDate && date <= endDate

  for (const row of bookRows) {
    const bookDates = new Set<string>()

    const normalizedStartDate = normalizeDate(row.startDate)
    if (normalizedStartDate && isDateInRange(normalizedStartDate)) {
      bookDates.add(normalizedStartDate)
    }
    const normalizedFinishDate = normalizeDate(row.finishDate)
    if (normalizedFinishDate && isDateInRange(normalizedFinishDate)) {
      bookDates.add(normalizedFinishDate)
    }

    if (bookDates.size === 0) {
      const createdDate = normalizeDate(row.createdAt)
      if (createdDate && isDateInRange(createdDate)) {
        bookDates.add(createdDate)
      }
    }

    for (const date of bookDates) {
      const existing = dateMap.get(date) ?? { total: 0, books: 0, music: 0, watches: 0, games: 0 }
      existing.books += 1
      existing.total += 1
      dateMap.set(date, existing)
    }
  }

  const addToMap = (
    entries: { date: string | Date; count: number }[],
    key: "books" | "music" | "watches" | "games"
  ) => {
    for (const entry of entries) {
      const dateStr = normalizeDate(entry.date)
      if (!dateStr || !isDateInRange(dateStr)) continue
      const existing = dateMap.get(dateStr) ?? { total: 0, books: 0, music: 0, watches: 0, games: 0 }
      existing[key] += entry.count
      existing.total += entry.count
      dateMap.set(dateStr, existing)
    }
  }

  addToMap(musicActivity, "music")
  addToMap(watchActivity, "watches")
  addToMap(gameActivity, "games")

  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    count: data.total,
    level: Math.min(4, data.total) as 0 | 1 | 2 | 3 | 4,
    details: data,
  }))
}

export async function getStats() {
  const user = await requireCurrentUser()
  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth() + 1
  const monthStart = `${thisYear}-${String(thisMonth).padStart(2, "0")}-01`
  const yearStart = `${thisYear}-01-01`

  const [bookCount, musicCount, watchCount, gameCount] = await Promise.all([
    db.select({ count: count() }).from(books).where(eq(books.userId, user.id)),
    db.select({ count: count() }).from(music).where(eq(music.userId, user.id)),
    db.select({ count: count() }).from(watches).where(eq(watches.userId, user.id)),
    db.select({ count: count() }).from(games).where(eq(games.userId, user.id)),
  ])

  const [bookMonthly, musicMonthly, watchMonthly, gameMonthly] = await Promise.all([
    db.select({ count: count() }).from(books).where(and(eq(books.userId, user.id), sql`${books.createdAt} >= ${monthStart}::date`)),
    db.select({ count: count() }).from(music).where(and(eq(music.userId, user.id), sql`${music.createdAt} >= ${monthStart}::date`)),
    db.select({ count: count() }).from(watches).where(and(eq(watches.userId, user.id), sql`${watches.createdAt} >= ${monthStart}::date`)),
    db.select({ count: count() }).from(games).where(and(eq(games.userId, user.id), sql`${games.createdAt} >= ${monthStart}::date`)),
  ])

  const [bookYearly, musicYearly, watchYearly, gameYearly] = await Promise.all([
    db.select({ count: count() }).from(books).where(and(eq(books.userId, user.id), sql`${books.createdAt} >= ${yearStart}::date`)),
    db.select({ count: count() }).from(music).where(and(eq(music.userId, user.id), sql`${music.createdAt} >= ${yearStart}::date`)),
    db.select({ count: count() }).from(watches).where(and(eq(watches.userId, user.id), sql`${watches.createdAt} >= ${yearStart}::date`)),
    db.select({ count: count() }).from(games).where(and(eq(games.userId, user.id), sql`${games.createdAt} >= ${yearStart}::date`)),
  ])

  return {
    total: {
      books: bookCount[0].count,
      music: musicCount[0].count,
      watches: watchCount[0].count,
      games: gameCount[0].count,
      all: bookCount[0].count + musicCount[0].count + watchCount[0].count + gameCount[0].count,
    },
    monthly: {
      books: bookMonthly[0].count,
      music: musicMonthly[0].count,
      watches: watchMonthly[0].count,
      games: gameMonthly[0].count,
      all: bookMonthly[0].count + musicMonthly[0].count + watchMonthly[0].count + gameMonthly[0].count,
    },
    yearly: {
      books: bookYearly[0].count,
      music: musicYearly[0].count,
      watches: watchYearly[0].count,
      games: gameYearly[0].count,
      all: bookYearly[0].count + musicYearly[0].count + watchYearly[0].count + gameYearly[0].count,
    },
  }
}

export async function getRecentActivity(limit = 20) {
  const user = await requireCurrentUser()
  const [recentBooks, recentMusic, recentWatches, recentGames] = await Promise.all([
    db.query.books.findMany({ where: eq(books.userId, user.id), orderBy: [desc(books.createdAt)], limit }),
    db.query.music.findMany({ where: eq(music.userId, user.id), orderBy: [desc(music.createdAt)], limit }),
    db.query.watches.findMany({ where: eq(watches.userId, user.id), orderBy: [desc(watches.createdAt)], limit }),
    db.query.games.findMany({ where: eq(games.userId, user.id), orderBy: [desc(games.createdAt)], limit }),
  ])

  const timeline = [
    ...recentBooks.map((b) => ({ ...b, mediaType: "book" as const })),
    ...recentMusic.map((m) => ({ ...m, mediaType: "music" as const })),
    ...recentWatches.map((w) => ({ ...w, mediaType: "watch" as const })),
    ...recentGames.map((g) => ({ ...g, mediaType: "game" as const })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)

  return timeline
}

export async function getFavorites() {
  const user = await requireCurrentUser()
  const [favBooks, favMusic, favWatches, favGames] = await Promise.all([
    db.query.books.findMany({ where: and(eq(books.userId, user.id), eq(books.favorite, true)), limit: 20 }),
    db.query.music.findMany({ where: and(eq(music.userId, user.id), eq(music.favorite, true)), limit: 20 }),
    db.query.watches.findMany({ where: and(eq(watches.userId, user.id), eq(watches.favorite, true)), limit: 20 }),
    db.query.games.findMany({ where: and(eq(games.userId, user.id), eq(games.favorite, true)), limit: 20 }),
  ])

  return [
    ...favBooks.map((b) => ({ ...b, mediaType: "book" as const })),
    ...favMusic.map((m) => ({ ...m, mediaType: "music" as const })),
    ...favWatches.map((w) => ({ ...w, mediaType: "watch" as const })),
    ...favGames.map((g) => ({ ...g, mediaType: "game" as const })),
  ]
}

export async function deleteEntries(type: "book" | "music" | "watch" | "game", ids: string[]) {
  const user = await requireCurrentUser()
  if (ids.length === 0) return

  const table = type === "book" ? books : type === "music" ? music : type === "watch" ? watches : games
  await db.delete(table).where(and(eq(table.userId, user.id), inArray(table.id, ids)))

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/${type === "watch" ? "watches" : type === "music" ? "music" : type + "s"}`)
}
