# src/lib — Core Utilities & Server Logic

**Location**: `src/lib/`  
**Purpose**: Core utilities, API clients, server actions, auth, i18n

## STRUCTURE

```
lib/
├── access.ts              # Access control utilities
├── actions/               # Server actions ("use server")
│   ├── auth.ts           # Login, register, session management
│   ├── entries.ts        # CRUD for books/music/watch/games
│   └── plaza.ts          # Plaza feed, public activity
├── api/                   # External API clients
│   ├── google-books.ts   # Google Books API
│   ├── hardcover.ts      # Hardcover API (Chinese books)
│   ├── musicbrainz.ts    # MusicBrainz API
│   ├── rawg.ts           # RAWG games API
│   ├── spotify.ts        # Spotify API
│   └── tmdb.ts           # TMDB movies/TV API
├── auth.ts                # JWT authentication (jose)
├── constants.ts           # App-wide constants (status labels, colors)
├── i18n.ts                # Internationalization (zh-CN / en-US)
├── logger.ts              # Structured logging (createLogger)
├── redis.ts               # Redis client (ioredis, API caching)
├── search-utils.ts        # Search result merging/deduplication
├── utils.ts               # cn() class merger (clsx + tailwind-merge)
└── validations/
    └── entry.ts          # Zod schemas for entry validation
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add server action | `actions/` | `"use server"`, Zod validation, `revalidatePath()` |
| External API client | `api/` | Rate limiting, caching via Redis, error handling |
| Auth logic | `auth.ts` | JWT sign/verify with jose, bcrypt password hashing |
| Logging | `logger.ts` | `createLogger("namespace")`, structured JSON output |
| i18n | `i18n.ts` | Translation keys, locale switching |
| Redis caching | `redis.ts` | `ioredis` client, API response caching |
| Utility function | `utils.ts` | `cn()` for class merging |
| Validation schema | `validations/entry.ts` | Zod schemas with Chinese error messages |

## CONVENTIONS

**Server Actions** (`actions/`):
```typescript
"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { books } from "@/db/schema"

const bookSchema = createInsertSchema(books, {
  title: (s) => s.min(1, "标题不能为空"),
}).omit({ id: true, userId: true, createdAt: true, updatedAt: true })

export async function createBook(data: BookInput) {
  const result = bookSchema.safeParse(data)
  if (!result.success) return { success: false, error: result.error.issues[0].message }
  
  const [book] = await db.insert(books).values({ ...data, userId: user.id }).returning()
  revalidatePath("/dashboard/books")
  return { success: true, data: book }
}
```

**API Clients** (`api/`):
```typescript
const logger = createLogger("api/tmdb")
const CACHE_TTL = 3600 // 1 hour

export async function searchMovies(query: string) {
  const cached = await redis.get(`tmdb:search:${query}`)
  if (cached) return JSON.parse(cached)
  
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
  })
  
  const results = await response.json()
  await redis.setex(`tmdb:search:${query}`, CACHE_TTL, JSON.stringify(results))
  logger.debug("movie search completed", { query, count: results.length })
  return results
}
```

**Logging**:
```typescript
import { createLogger } from "@/lib/logger"

const logger = createLogger("api/tmdb")
logger.debug("debug info", { metadata })
logger.info("informational")
logger.warn("warning")
logger.error("error", error)
```

**Redis Caching**:
- Key format: `{source}:{type}:{id}` (e.g., `tmdb:movie:123`)
- TTL: 1 hour for search, 6 hours for details
- Graceful degradation: Return empty array on Redis failure

## ANTI-PATTERNS

- ❌ `console.*` — Use `createLogger("namespace")` instead (35 violations)
- ❌ `any` type — Use `unknown` or proper types
- ❌ Direct DB without userId — Always filter by `userId` for multi-user isolation
- ❌ String interpolation in queries — Parameterized queries only
- ❌ Unvalidated input — Zod schemas required for all server actions
- ❌ Skipping revalidatePath — Call after mutations to refresh cache

## UNIQUE STYLES

- **Server actions return shape**: `{ success: true/false, data/error: ... }`
- **Chinese error messages**: Zod schemas use Chinese for user-facing errors
- **Redis caching**: All external APIs cached (search + details)
- **Trace IDs**: API responses include `x-trace-id` header for observability
- **Multi-user isolation**: Every query filters by `userId`
- **OKLCH colors**: OKLCH color space for perceptual uniformity (globals.css)

## TESTING

- Unit tests: `src/test/api-tmdb.test.ts`, `src/test/search-utils.test.ts`
- Test utilities: Vitest + @testing-library/react
- E2E tests: `e2e/auth.spec.ts` tests auth flows

## NOTES

- **6 API clients**: TMDB, Spotify, RAWG, Google Books, Hardcover, MusicBrainz
- **4 server action modules**: auth, entries, plaza, settings
- **Logging**: 35 console.* violations need fixing (database scripts + error boundaries)
- **Cache**: Redis used for all external API responses (1-6 hour TTL)
- **i18n**: Chinese (zh-CN) and English (en-US) supported
- **Auth**: JWT with jose, bcrypt password hashing
- **Validation**: drizzle-zod for schema generation from Drizzle tables
