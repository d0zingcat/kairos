import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { hash } from "bcryptjs"
import { books, music, watches, games, appSettings, users } from "./schema"

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client)

async function seed() {
  console.log("🌱 Seeding database...")

  // Clear existing data
  await db.delete(books)
  await db.delete(music)
  await db.delete(watches)
  await db.delete(games)
  await db.delete(users)
  await db.delete(appSettings)

  const [adminUser] = await db.insert(users).values({
    username: "admin",
    passwordHash: await hash("admin12345", 10),
    role: "admin",
    isPublicProfile: true,
    isActive: true,
  }).returning()

  await db.insert(appSettings).values({
    key: "site",
    visibility: "private",
  })

  // ── Books ──────────────────────────────────────────
  await db.insert(books).values([
    {
      userId: adminUser.id,
      title: "三体",
      authors: ["刘慈欣"],
      coverUrl: "https://books.google.com/books/content?id=ZrNzEAAAQBAJ&printsec=frontcover&img=1&zoom=1",
      pageCount: 302,
      status: "finished",
      rating: 10,
      finishDate: "2026-01-15",
      favorite: true,
      notes: "宇宙很大，生活更大",
      tags: ["科幻", "中国文学"],
    },
    {
      userId: adminUser.id,
      title: "Atomic Habits",
      subtitle: "An Easy & Proven Way to Build Good Habits & Break Bad Ones",
      authors: ["James Clear"],
      status: "finished",
      rating: 8,
      finishDate: "2026-02-01",
      notes: "1% better every day",
      tags: ["自助", "习惯"],
    },
    {
      userId: adminUser.id,
      title: "Designing Data-Intensive Applications",
      authors: ["Martin Kleppmann"],
      status: "reading",
      rating: null,
      tags: ["技术", "分布式系统"],
    },
  ])

  // ── Music ──────────────────────────────────────────
  await db.insert(music).values([
    {
      userId: adminUser.id,
      title: "OK Computer",
      artist: "Radiohead",
      type: "album",
      rating: 10,
      listenDate: "2026-01-20",
      favorite: true,
      notes: "Timeless masterpiece",
      tags: ["Alternative Rock"],
    },
    {
      userId: adminUser.id,
      title: "Random Access Memories",
      artist: "Daft Punk",
      type: "album",
      rating: 9,
      listenDate: "2026-02-10",
      notes: "Get Lucky 循环了一整天",
      tags: ["Electronic", "Disco"],
    },
    {
      userId: adminUser.id,
      title: "运动员",
      artist: "陈绮贞",
      type: "track",
      rating: 7,
      listenDate: "2026-02-20",
      tags: ["华语", "民谣"],
    },
  ])

  // ── Watches ────────────────────────────────────────
  await db.insert(watches).values([
    {
      userId: adminUser.id,
      title: "Inception",
      type: "movie",
      director: "Christopher Nolan",
      genre: ["Sci-Fi", "Action", "Thriller"],
      runtime: 148,
      rating: 9,
      watchDate: "2026-01-05",
      status: "finished",
      favorite: true,
      notes: "A dream within a dream within a dream",
      tags: ["Nolan"],
    },
    {
      userId: adminUser.id,
      title: "Breaking Bad",
      type: "tv",
      director: "Vince Gilligan",
      genre: ["Drama", "Crime", "Thriller"],
      rating: 10,
      watchDate: "2026-02-15",
      seasonNumber: 5,
      episodeNumber: 16,
      status: "finished",
      favorite: true,
      notes: "Say my name",
      tags: ["经典美剧"],
    },
    {
      userId: adminUser.id,
      title: "Dune: Part Two",
      type: "movie",
      director: "Denis Villeneuve",
      genre: ["Sci-Fi", "Adventure"],
      runtime: 166,
      rating: 8,
      watchDate: "2026-02-22",
      status: "finished",
      tags: ["科幻"],
    },
  ])

  // ── Games ──────────────────────────────────────────
  await db.insert(games).values([
    {
      userId: adminUser.id,
      title: "Elden Ring",
      platforms: ["PC", "PlayStation 5"],
      genre: ["Action RPG", "Open World"],
      developer: "FromSoftware",
      rating: 10,
      startDate: "2026-01-01",
      finishDate: "2026-02-20",
      playTimeMinutes: 7200,
      status: "completed",
      favorite: true,
      notes: "Praise the Elden Ring!",
      tags: ["Souls-like"],
    },
    {
      userId: adminUser.id,
      title: "Celeste",
      platforms: ["Nintendo Switch"],
      genre: ["Platformer", "Indie"],
      developer: "Extremely OK Games",
      rating: 9,
      startDate: "2026-02-10",
      finishDate: "2026-02-18",
      playTimeMinutes: 1200,
      status: "completed",
      notes: "Beautiful story about climbing mountains",
      tags: ["Indie", "精品"],
    },
    {
      userId: adminUser.id,
      title: "Baldur's Gate 3",
      platforms: ["PC"],
      genre: ["RPG", "Turn-Based"],
      developer: "Larian Studios",
      rating: null,
      status: "playing",
      startDate: "2026-02-25",
      tags: ["RPG"],
    },
  ])

  console.log("✅ Seed complete!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
