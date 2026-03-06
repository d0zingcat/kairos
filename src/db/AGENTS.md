# src/db — Database Layer (Drizzle ORM)

**Location**: `src/db/`  
**ORM**: Drizzle ORM  
**Database**: PostgreSQL 16  
**Dialect**: PostgreSQL

## STRUCTURE

```
db/
├── auto-migrate.ts        # Auto-migration on startup (DB_AUTO_MIGRATE)
├── goodreads-importer.ts  # Goodreads CSV import logic
├── import-goodreads.ts    # CLI script for Goodreads import
├── index.ts               # Re-exports (db connection, schema)
├── migrate-privacy.ts     # Privacy settings migration (one-time)
├── migrate.ts             # Standalone migration script (Docker)
├── schema.ts              # Drizzle schema (tables, enums, indexes)
└── seed.ts                # Seed example data
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add table/column | `schema.ts` | Drizzle table definitions with timestamps |
| Database connection | `index.ts` | Exports `db` instance (postgres driver) |
| Migration logic | `auto-migrate.ts`, `migrate.ts` | Drizzle migrator, runtime migrations |
| Seed data | `seed.ts` | Example users + media entries |
| Goodreads import | `goodreads-importer.ts`, `import-goodreads.ts` | CSV parsing, upsert logic |
| Privacy migration | `migrate-privacy.ts` | Adds isPublicProfile, publishToPlaza columns |

## SCHEMA OVERVIEW

**Tables** (in `schema.ts`):
- `users` — User accounts (username, passwordHash, role, privacy settings)
- `books` — Book entries (title, authors, status, rating, dates, tags)
- `music` — Music entries (track/album, artist, status, rating)
- `watches` — Movie/TV entries (title, status, rating, episodes watched)
- `games` — Game entries (title, platforms, status, rating, playtime)
- `plaza_activities` — Public activity feed (aggregated from user entries)

**Enums**:
- `book_status`: want_to_read, reading, finished, abandoned
- `music_type`: track, album
- `watch_type`: movie, tv
- `watch_status`: want_to_watch, watching, finished, abandoned
- `game_status`: backlog, playing, completed, abandoned, platinum
- `user_role`: admin, member

**Indexes** (auto-created):
- User indexes: `users_username_unique`, `users_role_idx`, `users_public_profile_idx`
- Book indexes: `books_user_idx`, `books_status_idx`, `books_rating_idx`, `books_favorite_idx`
- Similar for music, watches, games (userId, status, rating, favorite)

## CONVENTIONS

**Table Definition Pattern**:
```typescript
import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core"

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  // ... fields
  ...timestamps,
}, (table) => ({
  userIdIdx: index("books_user_idx").on(table.userId),
  statusIdx: index("books_status_idx").on(table.status),
}))
```

**Query Pattern** (always filter by userId):
```typescript
import { db } from "@/db"
import { books } from "@/db/schema"
import { eq, and } from "drizzle-orm"

const userBooks = await db
  .select()
  .from(books)
  .where(and(eq(books.userId, userId), eq(books.id, bookId)))
```

**Migration Pattern**:
```typescript
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"

const client = postgres(process.env.DATABASE_URL!, { max: 1 })
const db = drizzle(client)

await migrate(db, { migrationsFolder: "./drizzle" })
```

## ANTI-PATTERNS

- ❌ Direct `console.log` — Use `createLogger("db:*")` (4 violations in scripts)
- ❌ Missing userId filter — ALL queries must filter by userId
- ❌ String interpolation — Parameterized queries only (SQL injection prevention)
- ❌ Manual timestamp management — Use shared `timestamps` object
- ❌ Skipping references — Always define foreign key constraints
- ❌ Manual index creation — Use Drizzle `index()` in table definition

## UNIQUE STYLES

- **Shared timestamps**: `timestamps` object reused across all tables
- **Cascading deletes**: `onDelete: "cascade"` on all user references
- **Timezone-aware**: `timestamp(..., { withTimezone: true })` for UTC storage
- **Array fields**: `text().array()` for authors, tags, platforms
- **Default random UUID**: `uuid().defaultRandom()` instead of gen_random_uuid()
- **Standalone migration**: `dist/migrate.js` for Docker runtime (no source needed)

## MIGRATIONS

**Generate**: `bun run db:generate` — Creates new migration in `drizzle/`
**Run**: `bun run db:migrate` — Runs pending migrations
**Runtime**: `bun dist/migrate.js` — Standalone script for Docker

**Migration Files**:
- `drizzle/0000_init.sql` — Baseline schema (all tables)
- `drizzle/meta/` — Drizzle metadata (tracking applied migrations)

**Docker Deployment**:
- `DB_AUTO_MIGRATE=true` (default) — Auto-runs on startup
- Migration script embedded in Docker image at `dist/migrate.js`
- Migrations folder copied to image (`drizzle/`)

## SEEDING

**Command**: `bun run db:seed`
**File**: `src/db/seed.ts`
**Content**:
- 3 example users (admin, member1, member2)
- Sample books, music, watches, games per user
- Privacy settings (some public, some private)

## GOODREADS IMPORT

**CLI Script**: `bun run db:import:goodreads -- <csv_path> <userId>`
**Options**:
- `--clear` — Clear existing books before import
- CSV format: Goodreads library export (title, authors, ISBN, rating, date read)

**Logic**:
- Parses CSV with Node.js `fs`
- Upserts by title + authors (skip duplicates)
- Maps Goodreads shelves to book_status enum
- Logs progress with `console.log` (TODO: fix to use logger)

## TESTING

- No unit tests for schema (type-safe via Drizzle)
- E2E tests: `e2e/auth.spec.ts` tests database interactions
- Seed data used for E2E test setup

## NOTES

- **8 files total** — Schema + migrations + scripts
- **Multi-user**: All tables have `userId` column for isolation
- **Privacy**: `isPublicProfile` and `publishToPlaza` control visibility
- **Plaza**: `plaza_activities` table aggregates public user activities
- **Auto-migration**: Runs on app startup if `DB_AUTO_MIGRATE=true`
- **Runtime migration**: `dist/migrate.js` for Docker (no source code needed)
- **Foreign keys**: All user references use `onDelete: "cascade"`
- **Timezone**: All timestamps stored in UTC with timezone info
