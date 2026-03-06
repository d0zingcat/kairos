# Architecture

**Analysis Date:** 2026-03-06

## Pattern Overview

**Overall:** Next.js 16 App Router with React Server Components (RSC)

**Key Characteristics:**
- Server-first architecture with selective client components
- Route handlers for API endpoints (`route.ts` files)
- Server actions for form mutations (`"use server"`)
- Redis caching layer for external API calls
- JWT-based session management with cookie storage
- Drizzle ORM for type-safe database access

## Layers

**Presentation Layer:**
- Purpose: UI components and page rendering
- Location: `src/app/`, `src/components/`
- Contains: Page components, feature components, UI primitives
- Depends on: Server actions, i18n, theme providers
- Used by: End users via browser

**Application Layer:**
- Purpose: Business logic and data orchestration
- Location: `src/lib/actions/`
- Contains: Server actions (`entries.ts`, `plaza.ts`, `settings.ts`, `auth.ts`)
- Depends on: Database layer, validation schemas, auth utilities
- Used by: Page components and API routes

**API Layer:**
- Purpose: External service integration
- Location: `src/lib/api/`
- Contains: TMDB, Google Books, Hardcover, RAWG, Spotify, MusicBrainz clients
- Depends on: Redis caching, logging utilities
- Used by: Search API routes (`src/app/api/search/[type]/route.ts`)

**Data Access Layer:**
- Purpose: Database operations
- Location: `src/db/`
- Contains: Drizzle schema (`schema.ts`), database client (`index.ts`), migrations
- Depends on: PostgreSQL via `postgres` driver
- Used by: Server actions and API routes

**Infrastructure Layer:**
- Purpose: Cross-cutting concerns
- Location: `src/lib/`
- Contains: Auth (`auth.ts`), Redis (`redis.ts`), i18n (`i18n.ts`), logger (`logger.ts`), validations (`validations/`)
- Depends on: Environment configuration
- Used by: All layers

## Data Flow

**User Content Creation (e.g., Add Book):**

1. User triggers action via UI (`EntryDialog` component)
2. Client calls server action (`createBook` in `src/lib/actions/entries.ts`)
3. Server action validates session (`requireCurrentUser()`)
4. Input validated against Zod schema (`bookSchema` in `src/lib/validations/entry.ts`)
5. Database insert via Drizzle ORM with `userId` attached
6. `revalidatePath()` triggers Next.js cache invalidation
7. UI re-renders with updated data

**Search Flow (External API Aggregation):**

1. Client requests `/api/search/[type]?q=query`
2. Route handler (`src/app/api/search/[type]/route.ts`) authenticates user
3. Query local database first (user's existing entries)
4. Parallel external API calls (e.g., Hardcover + Google Books for books)
5. Results merged via `mergeUniqueResults()` utility
6. Response includes `x-trace-id` header for observability
7. Redis caching in API clients (`src/lib/api/*.ts`) for repeated queries

**Authentication Flow:**

1. User submits credentials to login page
2. `loginAction` in `src/lib/actions/auth.ts` validates against `users` table
3. JWT token created with `userId`, `role`, and `jti` (unique token ID)
4. Token stored in `kairos-session` cookie (httpOnly, 30-day expiry)
5. Token ID registered in Redis for revocation tracking
6. `getCurrentUser()` verifies token and fetches user from database
7. Session middleware checks access state per-route

## Key Abstractions

**Media Type Schema Pattern:**
- Purpose: Unified schema for books, music, watches, games
- Examples: `src/db/schema.ts` (lines 78-191)
- Pattern: Each media type has UUID primary key, userId foreign key, status enum, rating, tags array, timestamps

**Server Action Pattern:**
- Purpose: Type-safe server-side mutations with automatic revalidation
- Examples: `src/lib/actions/entries.ts` (lines 26-507)
- Pattern: Validate user -> validate input -> database operation -> `revalidatePath()` -> return result

**API Client Pattern:**
- Purpose: External service integration with caching
- Examples: `src/lib/api/tmdb.ts`, `src/lib/api/google-books.ts`
- Pattern: `searchX(query, { traceId })` -> check Redis cache -> call API -> cache result -> return normalized data

**Access Control Pattern:**
- Purpose: Granular permission checking
- Examples: `src/lib/access.ts`, `src/app/dashboard/layout.tsx`
- Pattern: `getAccessState()` returns `{ canView, canEdit, isAdmin, hasSession }` based on site visibility and user role

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: Theme provider, i18n provider, service worker registration, global providers

**Dashboard Layout:**
- Location: `src/app/dashboard/layout.tsx`
- Triggers: All `/dashboard/*` routes
- Responsibilities: Access control, navigation sidebar, command palette provider, tooltip provider

**Main Dashboard Page:**
- Location: `src/app/dashboard/page.tsx`
- Triggers: User visits dashboard
- Responsibilities: Parallel data fetching (`getStats`, `getActivityData`, `getRecentActivity`, `getFavorites`), render overview

**Search API:**
- Location: `src/app/api/search/[type]/route.ts`
- Triggers: Command palette search
- Responsibilities: Multi-source aggregation, local + remote search, response formatting

**Instrumentation:**
- Location: `src/instrumentation.ts`
- Triggers: Application startup
- Responsibilities: Automatic database migration via `ensureDatabaseMigrated()`

## Error Handling

**Strategy:** Graceful degradation with comprehensive logging

**Patterns:**
- API calls wrapped in try-catch with logger warnings (e.g., `src/app/api/search/[type]/route.ts` lines 94-108)
- Redis failures silently ignored (cache miss fallback)
- Server actions return `{ success: false, error: string }` for client handling
- Global error boundaries: `src/app/error.tsx`, `src/app/dashboard/error.tsx`
- Zod validation errors returned as user-friendly messages

## Cross-Cutting Concerns

**Logging:** Structured logging via `src/lib/logger.ts` with configurable levels (`LOG_LEVEL` env var), trace ID correlation

**Validation:** Zod schemas in `src/lib/validations/entry.ts` using `drizzle-zod` for schema-to-validation sync

**Authentication:** JWT-based with Redis revocation, cookie storage, role-based access (`admin` vs `member`)

**Internationalization:** Cookie-based locale storage (`kairos-locale`), JSON message files in `src/messages/`, nested key lookup with params support

**Caching:** Redis for external API responses (1-hour TTL), React `cache()` for session lookups, Next.js `revalidatePath()` for on-demand invalidation

---

*Architecture analysis: 2026-03-06*
