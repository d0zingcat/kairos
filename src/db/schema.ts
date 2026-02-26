import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  date,
} from "drizzle-orm/pg-core"

// ── Enums ────────────────────────────────────────────────
export const bookStatusEnum = pgEnum("book_status", [
  "want_to_read",
  "reading",
  "finished",
  "abandoned",
])

export const musicTypeEnum = pgEnum("music_type", ["track", "album"])

export const watchTypeEnum = pgEnum("watch_type", ["movie", "tv"])

export const watchStatusEnum = pgEnum("watch_status", [
  "want_to_watch",
  "watching",
  "finished",
  "abandoned",
])

export const gameStatusEnum = pgEnum("game_status", [
  "backlog",
  "playing",
  "completed",
  "abandoned",
  "platinum",
])

// ── Shared timestamps ────────────────────────────────────
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

// ── Books ────────────────────────────────────────────────
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id"),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  authors: text("authors").array(),
  coverUrl: text("cover_url"),
  isbn: text("isbn"),
  pageCount: integer("page_count"),
  status: bookStatusEnum("status").notNull().default("want_to_read"),
  rating: integer("rating"),
  startDate: date("start_date"),
  finishDate: date("finish_date"),
  notes: text("notes"),
  favorite: boolean("favorite").notNull().default(false),
  tags: text("tags").array(),
  ...timestamps,
})

// ── Music ────────────────────────────────────────────────
export const music = pgTable("music", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id"),
  type: musicTypeEnum("type").notNull().default("album"),
  title: text("title").notNull(),
  artist: text("artist"),
  albumTitle: text("album_title"),
  coverUrl: text("cover_url"),
  genre: text("genre").array(),
  rating: integer("rating"),
  listenDate: date("listen_date"),
  favorite: boolean("favorite").notNull().default(false),
  notes: text("notes"),
  tags: text("tags").array(),
  ...timestamps,
})

// ── Watches (Movies / TV) ────────────────────────────────
export const watches = pgTable("watches", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id"),
  type: watchTypeEnum("type").notNull().default("movie"),
  title: text("title").notNull(),
  posterUrl: text("poster_url"),
  director: text("director"),
  genre: text("genre").array(),
  runtime: integer("runtime"),
  rating: integer("rating"),
  watchDate: date("watch_date"),
  seasonNumber: integer("season_number"),
  episodeNumber: integer("episode_number"),
  status: watchStatusEnum("status").notNull().default("want_to_watch"),
  favorite: boolean("favorite").notNull().default(false),
  notes: text("notes"),
  tags: text("tags").array(),
  ...timestamps,
})

// ── Games ────────────────────────────────────────────────
export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: text("external_id"),
  title: text("title").notNull(),
  coverUrl: text("cover_url"),
  platforms: text("platforms").array(),
  genre: text("genre").array(),
  developer: text("developer"),
  rating: integer("rating"),
  startDate: date("start_date"),
  finishDate: date("finish_date"),
  playTimeMinutes: integer("play_time_minutes"),
  status: gameStatusEnum("status").notNull().default("backlog"),
  favorite: boolean("favorite").notNull().default(false),
  notes: text("notes"),
  tags: text("tags").array(),
  ...timestamps,
})

// ── Type exports ─────────────────────────────────────────
export type Book = typeof books.$inferSelect
export type NewBook = typeof books.$inferInsert
export type Music = typeof music.$inferSelect
export type NewMusic = typeof music.$inferInsert
export type Watch = typeof watches.$inferSelect
export type NewWatch = typeof watches.$inferInsert
export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert
