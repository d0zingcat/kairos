import { db } from "@/db"
import { books, games, music, users, watches } from "@/db/schema"
import { and, count, desc, eq, inArray, lt } from "drizzle-orm"

export type FeedItem = {
  id: string
  userId: string
  username: string
  mediaType: "book" | "music" | "watch" | "game"
  title: string
  musicType?: "track" | "album"
  createdAt: Date
}

export type UserSummary = {
  userId: string
  username: string
  total: number
  books: number
  music: number
  watches: number
  games: number
}

function toCountMap(items: Array<{ userId: string; count: number }>) {
  return new Map(items.map((item) => [item.userId, item.count]))
}

async function getPublicUsers() {
  const publicUsers = await db.query.users.findMany({
    where: and(eq(users.publishToPlaza, true), eq(users.isActive, true)),
    orderBy: [desc(users.updatedAt)],
    limit: 200,
  })

  return publicUsers
}

export async function getPublicUserSummaries() {
  const publicUsers = await getPublicUsers()

  if (publicUsers.length === 0) {
    return [] as UserSummary[]
  }

  const userIds = publicUsers.map((user) => user.id)

  const [bookCounts, musicCounts, watchCounts, gameCounts] = await Promise.all([
    db
      .select({ userId: books.userId, count: count() })
      .from(books)
      .where(inArray(books.userId, userIds))
      .groupBy(books.userId),
    db
      .select({ userId: music.userId, count: count() })
      .from(music)
      .where(inArray(music.userId, userIds))
      .groupBy(music.userId),
    db
      .select({ userId: watches.userId, count: count() })
      .from(watches)
      .where(inArray(watches.userId, userIds))
      .groupBy(watches.userId),
    db
      .select({ userId: games.userId, count: count() })
      .from(games)
      .where(inArray(games.userId, userIds))
      .groupBy(games.userId),
  ])

  const bookMap = toCountMap(bookCounts)
  const musicMap = toCountMap(musicCounts)
  const watchMap = toCountMap(watchCounts)
  const gameMap = toCountMap(gameCounts)

  return publicUsers
    .map<UserSummary>((user) => {
      const booksCount = bookMap.get(user.id) ?? 0
      const musicCount = musicMap.get(user.id) ?? 0
      const watchesCount = watchMap.get(user.id) ?? 0
      const gamesCount = gameMap.get(user.id) ?? 0
      return {
        userId: user.id,
        username: user.username,
        books: booksCount,
        music: musicCount,
        watches: watchesCount,
        games: gamesCount,
        total: booksCount + musicCount + watchesCount + gamesCount,
      }
    })
    .sort((a, b) => b.total - a.total)
}

export async function getPublicPlazaFeed(options?: {
  limit?: number
  cursor?: string
}) {
  const feedLimit = Math.min(Math.max(options?.limit ?? 20, 1), 50)
  const cursorDate = options?.cursor ? new Date(options.cursor) : null

  if (cursorDate && Number.isNaN(cursorDate.getTime())) {
    return {
      items: [] as FeedItem[],
      nextCursor: null as string | null,
      hasMore: false,
    }
  }

  const publicUsers = await getPublicUsers()

  if (publicUsers.length === 0) {
    return {
      items: [] as FeedItem[],
      nextCursor: null as string | null,
      hasMore: false,
    }
  }

  const userIds = publicUsers.map((user) => user.id)
  const usernameMap = new Map(publicUsers.map((user) => [user.id, user.username]))

  const booksWhere = cursorDate
    ? and(inArray(books.userId, userIds), lt(books.createdAt, cursorDate))
    : inArray(books.userId, userIds)
  const musicWhere = cursorDate
    ? and(inArray(music.userId, userIds), lt(music.createdAt, cursorDate))
    : inArray(music.userId, userIds)
  const watchesWhere = cursorDate
    ? and(inArray(watches.userId, userIds), lt(watches.createdAt, cursorDate))
    : inArray(watches.userId, userIds)
  const gamesWhere = cursorDate
    ? and(inArray(games.userId, userIds), lt(games.createdAt, cursorDate))
    : inArray(games.userId, userIds)

  const queryLimit = feedLimit + 1
  const [recentBooks, recentMusic, recentWatches, recentGames] = await Promise.all([
    db.query.books.findMany({
      where: booksWhere,
      orderBy: [desc(books.createdAt)],
      limit: queryLimit,
    }),
    db.query.music.findMany({
      where: musicWhere,
      orderBy: [desc(music.createdAt)],
      limit: queryLimit,
    }),
    db.query.watches.findMany({
      where: watchesWhere,
      orderBy: [desc(watches.createdAt)],
      limit: queryLimit,
    }),
    db.query.games.findMany({
      where: gamesWhere,
      orderBy: [desc(games.createdAt)],
      limit: queryLimit,
    }),
  ])

  const merged = [
    ...recentBooks.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: usernameMap.get(item.userId) ?? "unknown",
      mediaType: "book" as const,
      title: item.title,
      createdAt: item.createdAt,
    })),
    ...recentMusic.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: usernameMap.get(item.userId) ?? "unknown",
      mediaType: "music" as const,
      title: item.title,
      musicType: item.type,
      createdAt: item.createdAt,
    })),
    ...recentWatches.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: usernameMap.get(item.userId) ?? "unknown",
      mediaType: "watch" as const,
      title: item.title,
      createdAt: item.createdAt,
    })),
    ...recentGames.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: usernameMap.get(item.userId) ?? "unknown",
      mediaType: "game" as const,
      title: item.title,
      createdAt: item.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const hasMore = merged.length > feedLimit
  const items = merged.slice(0, feedLimit)
  const last = items.at(-1)

  return {
    items,
    nextCursor: hasMore && last ? last.createdAt.toISOString() : null,
    hasMore,
  }
}

export async function getPublicPlazaData(feedLimit = 40) {
  const publicUsers = await getPublicUsers()

  if (publicUsers.length === 0) {
    return {
      publicUsers: [] as UserSummary[],
      feed: [] as FeedItem[],
    }
  }

  const userIds = publicUsers.map((user) => user.id)

  const feedResult = await getPublicPlazaFeed({ limit: feedLimit })
  const feed = feedResult.items

  const [bookCounts, musicCounts, watchCounts, gameCounts] = await Promise.all([
    db
      .select({ userId: books.userId, count: count() })
      .from(books)
      .where(inArray(books.userId, userIds))
      .groupBy(books.userId),
    db
      .select({ userId: music.userId, count: count() })
      .from(music)
      .where(inArray(music.userId, userIds))
      .groupBy(music.userId),
    db
      .select({ userId: watches.userId, count: count() })
      .from(watches)
      .where(inArray(watches.userId, userIds))
      .groupBy(watches.userId),
    db
      .select({ userId: games.userId, count: count() })
      .from(games)
      .where(inArray(games.userId, userIds))
      .groupBy(games.userId),
  ])

  const bookMap = toCountMap(bookCounts)
  const musicMap = toCountMap(musicCounts)
  const watchMap = toCountMap(watchCounts)
  const gameMap = toCountMap(gameCounts)

  const summaries = publicUsers
    .map<UserSummary>((user) => {
      const booksCount = bookMap.get(user.id) ?? 0
      const musicCount = musicMap.get(user.id) ?? 0
      const watchesCount = watchMap.get(user.id) ?? 0
      const gamesCount = gameMap.get(user.id) ?? 0
      return {
        userId: user.id,
        username: user.username,
        books: booksCount,
        music: musicCount,
        watches: watchesCount,
        games: gamesCount,
        total: booksCount + musicCount + watchesCount + gamesCount,
      }
    })
    .sort((a, b) => b.total - a.total)

  return {
    publicUsers: summaries,
    feed,
  }
}

export async function getPublicUserProfile(username: string, feedLimit = 30) {
  const normalizedUsername = username.trim().toLowerCase()
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.username, normalizedUsername),
      eq(users.isPublicProfile, true),
      eq(users.isActive, true)
    ),
  })

  if (!user) {
    return null
  }

  const [recentBooks, recentMusic, recentWatches, recentGames] = await Promise.all([
    db.query.books.findMany({
      where: eq(books.userId, user.id),
      orderBy: [desc(books.createdAt)],
      limit: feedLimit,
    }),
    db.query.music.findMany({
      where: eq(music.userId, user.id),
      orderBy: [desc(music.createdAt)],
      limit: feedLimit,
    }),
    db.query.watches.findMany({
      where: eq(watches.userId, user.id),
      orderBy: [desc(watches.createdAt)],
      limit: feedLimit,
    }),
    db.query.games.findMany({
      where: eq(games.userId, user.id),
      orderBy: [desc(games.createdAt)],
      limit: feedLimit,
    }),
  ])

  const feed: FeedItem[] = [
    ...recentBooks.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: user.username,
      mediaType: "book" as const,
      title: item.title,
      createdAt: item.createdAt,
    })),
    ...recentMusic.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: user.username,
      mediaType: "music" as const,
      title: item.title,
      musicType: item.type,
      createdAt: item.createdAt,
    })),
    ...recentWatches.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: user.username,
      mediaType: "watch" as const,
      title: item.title,
      createdAt: item.createdAt,
    })),
    ...recentGames.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: user.username,
      mediaType: "game" as const,
      title: item.title,
      createdAt: item.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, feedLimit)

  const [bookCountRows, musicCountRows, watchCountRows, gameCountRows] = await Promise.all([
    db.select({ value: count() }).from(books).where(eq(books.userId, user.id)),
    db.select({ value: count() }).from(music).where(eq(music.userId, user.id)),
    db.select({ value: count() }).from(watches).where(eq(watches.userId, user.id)),
    db.select({ value: count() }).from(games).where(eq(games.userId, user.id)),
  ])

  const summary: UserSummary = {
    userId: user.id,
    username: user.username,
    books: bookCountRows[0]?.value ?? 0,
    music: musicCountRows[0]?.value ?? 0,
    watches: watchCountRows[0]?.value ?? 0,
    games: gameCountRows[0]?.value ?? 0,
    total:
      (bookCountRows[0]?.value ?? 0) +
      (musicCountRows[0]?.value ?? 0) +
      (watchCountRows[0]?.value ?? 0) +
      (gameCountRows[0]?.value ?? 0),
  }

  return { summary, feed }
}
