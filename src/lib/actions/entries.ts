"use server"

import { db } from "@/db"
import { books, music, watches, games } from "@/db/schema"
import type { NewBook, NewMusic, NewWatch, NewGame } from "@/db/schema"
import { eq, desc, sql, and, ilike, count } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// ── Books ────────────────────────────────────────────────
export async function createBook(data: NewBook) {
  const [book] = await db.insert(books).values(data).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/books")
  return book
}

export async function updateBook(id: string, data: Partial<NewBook>) {
  const [book] = await db.update(books).set(data).where(eq(books.id, id)).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/books")
  return book
}

export async function deleteBook(id: string) {
  await db.delete(books).where(eq(books.id, id))
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
  const conditions = []
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
      : desc(books.createdAt)

  return db.query.books.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [orderBy],
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0,
  })
}

export async function getBook(id: string) {
  return db.query.books.findFirst({ where: eq(books.id, id) })
}

// ── Music ────────────────────────────────────────────────
export async function createMusic(data: NewMusic) {
  const [item] = await db.insert(music).values(data).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/music")
  return item
}

export async function updateMusic(id: string, data: Partial<NewMusic>) {
  const [item] = await db.update(music).set(data).where(eq(music.id, id)).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/music")
  return item
}

export async function deleteMusic(id: string) {
  await db.delete(music).where(eq(music.id, id))
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/music")
}

export async function getMusicList(options?: {
  search?: string
  sort?: string
  limit?: number
  offset?: number
}) {
  const conditions = []
  if (options?.search) {
    conditions.push(ilike(music.title, `%${options.search}%`))
  }

  const orderBy = options?.sort === "rating"
    ? desc(music.rating)
    : options?.sort === "title"
      ? music.title
      : desc(music.createdAt)

  return db.query.music.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [orderBy],
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0,
  })
}

// ── Watches ──────────────────────────────────────────────
export async function createWatch(data: NewWatch) {
  const [item] = await db.insert(watches).values(data).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/watches")
  return item
}

export async function updateWatch(id: string, data: Partial<NewWatch>) {
  const [item] = await db.update(watches).set(data).where(eq(watches.id, id)).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/watches")
  return item
}

export async function deleteWatch(id: string) {
  await db.delete(watches).where(eq(watches.id, id))
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
  const conditions = []
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
      : desc(watches.createdAt)

  return db.query.watches.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [orderBy],
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0,
  })
}

// ── Games ────────────────────────────────────────────────
export async function createGame(data: NewGame) {
  const [item] = await db.insert(games).values(data).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/games")
  return item
}

export async function updateGame(id: string, data: Partial<NewGame>) {
  const [item] = await db.update(games).set(data).where(eq(games.id, id)).returning()
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/games")
  return item
}

export async function deleteGame(id: string) {
  await db.delete(games).where(eq(games.id, id))
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
  const conditions = []
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
      : desc(games.createdAt)

  return db.query.games.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [orderBy],
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0,
  })
}

// ── Aggregations ─────────────────────────────────────────
export async function getActivityData(year: number) {
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const [bookActivity, musicActivity, watchActivity, gameActivity] = await Promise.all([
    db
      .select({ date: books.createdAt, count: count() })
      .from(books)
      .where(
        and(
          sql`${books.createdAt} >= ${startDate}::date`,
          sql`${books.createdAt} <= ${endDate}::date`
        )
      )
      .groupBy(sql`date(${books.createdAt})`),
    db
      .select({ date: music.createdAt, count: count() })
      .from(music)
      .where(
        and(
          sql`${music.createdAt} >= ${startDate}::date`,
          sql`${music.createdAt} <= ${endDate}::date`
        )
      )
      .groupBy(sql`date(${music.createdAt})`),
    db
      .select({ date: watches.createdAt, count: count() })
      .from(watches)
      .where(
        and(
          sql`${watches.createdAt} >= ${startDate}::date`,
          sql`${watches.createdAt} <= ${endDate}::date`
        )
      )
      .groupBy(sql`date(${watches.createdAt})`),
    db
      .select({ date: games.createdAt, count: count() })
      .from(games)
      .where(
        and(
          sql`${games.createdAt} >= ${startDate}::date`,
          sql`${games.createdAt} <= ${endDate}::date`
        )
      )
      .groupBy(sql`date(${games.createdAt})`),
  ])

  // Merge all activity into a date map
  const dateMap = new Map<string, { total: number; books: number; music: number; watches: number; games: number }>()

  const addToMap = (entries: { date: Date; count: number }[], key: "books" | "music" | "watches" | "games") => {
    for (const entry of entries) {
      const dateStr = new Date(entry.date).toISOString().split("T")[0]
      const existing = dateMap.get(dateStr) ?? { total: 0, books: 0, music: 0, watches: 0, games: 0 }
      existing[key] += entry.count
      existing.total += entry.count
      dateMap.set(dateStr, existing)
    }
  }

  addToMap(bookActivity, "books")
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
  const now = new Date()
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth() + 1
  const monthStart = `${thisYear}-${String(thisMonth).padStart(2, "0")}-01`
  const yearStart = `${thisYear}-01-01`

  const [bookCount, musicCount, watchCount, gameCount] = await Promise.all([
    db.select({ count: count() }).from(books),
    db.select({ count: count() }).from(music),
    db.select({ count: count() }).from(watches),
    db.select({ count: count() }).from(games),
  ])

  const [bookMonthly, musicMonthly, watchMonthly, gameMonthly] = await Promise.all([
    db.select({ count: count() }).from(books).where(sql`${books.createdAt} >= ${monthStart}::date`),
    db.select({ count: count() }).from(music).where(sql`${music.createdAt} >= ${monthStart}::date`),
    db.select({ count: count() }).from(watches).where(sql`${watches.createdAt} >= ${monthStart}::date`),
    db.select({ count: count() }).from(games).where(sql`${games.createdAt} >= ${monthStart}::date`),
  ])

  const [bookYearly, musicYearly, watchYearly, gameYearly] = await Promise.all([
    db.select({ count: count() }).from(books).where(sql`${books.createdAt} >= ${yearStart}::date`),
    db.select({ count: count() }).from(music).where(sql`${music.createdAt} >= ${yearStart}::date`),
    db.select({ count: count() }).from(watches).where(sql`${watches.createdAt} >= ${yearStart}::date`),
    db.select({ count: count() }).from(games).where(sql`${games.createdAt} >= ${yearStart}::date`),
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
  const [recentBooks, recentMusic, recentWatches, recentGames] = await Promise.all([
    db.query.books.findMany({ orderBy: [desc(books.createdAt)], limit }),
    db.query.music.findMany({ orderBy: [desc(music.createdAt)], limit }),
    db.query.watches.findMany({ orderBy: [desc(watches.createdAt)], limit }),
    db.query.games.findMany({ orderBy: [desc(games.createdAt)], limit }),
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
  const [favBooks, favMusic, favWatches, favGames] = await Promise.all([
    db.query.books.findMany({ where: eq(books.favorite, true), limit: 20 }),
    db.query.music.findMany({ where: eq(music.favorite, true), limit: 20 }),
    db.query.watches.findMany({ where: eq(watches.favorite, true), limit: 20 }),
    db.query.games.findMany({ where: eq(games.favorite, true), limit: 20 }),
  ])

  return [
    ...favBooks.map((b) => ({ ...b, mediaType: "book" as const })),
    ...favMusic.map((m) => ({ ...m, mediaType: "music" as const })),
    ...favWatches.map((w) => ({ ...w, mediaType: "watch" as const })),
    ...favGames.map((g) => ({ ...g, mediaType: "game" as const })),
  ]
}
