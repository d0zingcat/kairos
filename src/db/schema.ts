import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  date,
  uniqueIndex,
  index,
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

export const siteVisibilityEnum = pgEnum("site_visibility", [
  "public",
  "private",
  "password",
])

export const userRoleEnum = pgEnum("user_role", ["admin", "member"])

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

// ── Users ────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("member"),
  isPublicProfile: boolean("is_public_profile").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
}, (table) => ({
  usernameUnique: uniqueIndex("users_username_unique").on(table.username),
  roleIdx: index("users_role_idx").on(table.role),
  publicProfileIdx: index("users_public_profile_idx").on(table.isPublicProfile),
}))

// ── Books ────────────────────────────────────────────────
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
}, (table) => ({
  userIdx: index("books_user_idx").on(table.userId),
}))

// ── Music ────────────────────────────────────────────────
export const music = pgTable("music", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
}, (table) => ({
  userIdx: index("music_user_idx").on(table.userId),
}))

// ── Watches (Movies / TV) ────────────────────────────────
export const watches = pgTable("watches", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
}, (table) => ({
  userIdx: index("watches_user_idx").on(table.userId),
}))

// ── Games ────────────────────────────────────────────────
export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
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
}, (table) => ({
  userIdx: index("games_user_idx").on(table.userId),
}))

// ── App settings ───────────────────────────────────────
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  visibility: siteVisibilityEnum("visibility").notNull().default("private"),
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
export type AppSetting = typeof appSettings.$inferSelect
export type NewAppSetting = typeof appSettings.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
