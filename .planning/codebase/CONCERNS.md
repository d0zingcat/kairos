# Codebase Concerns

**Analysis Date:** 2026-03-06

## Tech Debt

### Large Files Exceeding Recommended Size

**Multiple files exceed 400+ lines:**
- `src/components/entry-dialog/entry-dialog.tsx` (698 lines) - Complex dialog component with multiple media type handlers
- `src/lib/actions/entries.ts` (507 lines) - CRUD actions for all media types in single file
- `src/app/api/search/[type]/route.ts` (451 lines) - Multi-provider search logic
- `src/lib/actions/plaza.ts` (368 lines) - Public feed and user summary logic
- `src/db/goodreads-importer.ts` (326 lines) - CSV import parsing logic

**Impact:** Harder to maintain, test, and modify. Violates the user's coding style guide (200-400 lines typical, 800 max).

**Fix approach:** Extract media-type-specific logic into separate modules (e.g., `entry-dialog/books.ts`, `entry-dialog/music.ts`), split CRUD actions by entity type.

### Console.log/Console.error Usage in Production Code

**Files with violations:**
- `src/components/dashboard/books-grid.tsx:97` - `console.error("Bulk delete failed:")`
- `src/components/dashboard/games-grid.tsx:98` - `console.error("Bulk delete failed:")`
- `src/components/dashboard/watches-grid.tsx:100` - `console.error("Bulk delete failed:")`
- `src/components/dashboard/music-grid.tsx:92` - `console.error("Bulk delete failed:")`
- `src/app/api/import/goodreads/route.ts:40` - `console.error("Goodreads import failed")`
- `src/app/api/export/route.ts:43` - `console.error("Export error:")`
- `src/components/i18n/i18n-provider.tsx:100` - `console.warn("Missing translation")`
- `src/app/layout.tsx:74-77` - ServiceWorker console.log
- `src/db/seed.ts`, `src/db/migrate.ts`, `src/db/migrate-privacy.ts` - Various console usage

**Impact:** Violates logging conventions established in `src/lib/logger.ts`. Logs may leak to production console.

**Fix approach:** Replace all `console.*` calls with `createLogger()` from `@/lib/logger`.

### Inconsistent Logging in DB Scripts

**Files:** `src/db/import-goodreads.ts`, `src/db/seed.ts`, `src/db/migrate.ts`

**Issue:** Scripts use direct `console.log`/`console.error` instead of the project logger.

**Fix approach:** Import and use `createLogger("db:*")` consistently.

## Known Bugs

### Missing Translation Keys Cause Silent Failures

**File:** `src/components/i18n/i18n-provider.tsx:100`

**Symptoms:** Missing translation keys only log a warning but don't provide fallback behavior.

**Trigger:** Using a translation key that doesn't exist in either language file.

**Workaround:** Ensure all keys exist in both `zh` and `en` locale files.

### Redis Connection Timeout Too Aggressive

**File:** `src/lib/redis.ts:23-24`

**Problem:** `connectTimeout: 1000` and `commandTimeout: 1000` may cause false failures under load.

**Impact:** Redis may be marked as unavailable when it's just slow to respond.

**Fix approach:** Increase timeouts to 3000-5000ms or make configurable.

## Security Considerations

### Hardcoded Fallback Secrets

**Files:**
- `src/lib/auth.ts:10-12` - `JWT_SECRET` fallback: `"fallback-secret-change-me"`
- `src/proxy.ts:10-12` - Same fallback JWT secret

**Risk:** If `JWT_SECRET` environment variable is not set, the application uses a known weak secret that could be exploited for session forgery.

**Current mitigation:** None - this is a fallback that should never be used in production.

**Recommendations:** Throw error if `JWT_SECRET` is not configured in production (`NODE_ENV === "production"`).

### API Keys Passed in Query Strings

**Files:**
- `src/lib/api/tmdb.ts:62` - `api_key=${key}` in URL
- `src/lib/api/google-books.ts` - API key in query params
- `src/lib/api/spotify.ts` - Client credentials in request

**Risk:** API keys in URLs may be logged by:
- Proxy servers
- CDN logs
- Browser history
- Server access logs

**Current mitigation:** None explicit.

**Recommendations:** Use `Authorization` header where API supports it. For TMDB, consider backend proxy pattern.

### No Rate Limiting on Most API Endpoints

**File:** `src/proxy.ts:55-91`

**Problem:** Rate limiting only implemented for `/api/search/*` endpoints. Other endpoints like `/api/import/*`, `/api/export/*`, `/api/plaza/*` have no rate limiting.

**Risk:** DoS vulnerability, API quota exhaustion, resource abuse.

**Current mitigation:** Only search endpoint has 30 requests/minute limit.

**Recommendations:** Add rate limiting to all API endpoints, especially:
- `/api/import/*` - File uploads
- `/api/export/*` - Data exports
- `/api/auth/*` - Login/register (already protected by form validation)

### Missing CSRF Protection

**Files:** All server actions in `src/lib/actions/*.ts`

**Risk:** Server actions (`"use server"`) may be vulnerable to CSRF attacks if cookies are not properly protected.

**Current mitigation:** Next.js `"use server"` has some built-in protections, but explicit CSRF tokens are not implemented.

**Recommendations:** Add CSRF token validation for state-changing operations.

### SQL Injection Risk in Raw SQL

**Files:**
- `src/app/api/search/[type]/route.ts:60-61` - `sql` template with interpolated values

```typescript
sql`array_to_string(${books.authors}, ',') ilike ${`%${query}%`}`
```

**Risk:** While Drizzle's `sql` template provides some protection, string interpolation with user input (`query`) is risky.

**Current mitigation:** `query` is trimmed and validated to minimum length (2 chars).

**Recommendations:** Use parameterized queries: `sql` tagged template with proper parameter binding.

### Password Protection Mode Not Fully Implemented

**File:** `src/lib/site-visibility.ts`, `.env.example:18-19`

**Problem:** `SITE_VISIBILITY=password` mode is defined but no password verification flow exists for public pages.

**Impact:** If set to "password", the mode falls back to checking `VIEWER_PASSWORD_HASH` but no UI exists to enter the password.

**Fix approach:** Implement password modal for public page access when site is password-protected.

## Performance Bottlenecks

### N+1 Query Pattern in Plaza Feed

**File:** `src/lib/actions/plaza.ts:47-67`

**Problem:** Four separate database queries for counting books, music, watches, and games:
```typescript
const [bookCounts, musicCounts, watchCounts, gameCounts] = await Promise.all([...])
```

**Impact:** While parallelized, this still makes 4 separate queries. Could be optimized with a UNION query or materialized view for high-traffic scenarios.

**Improvement path:** Consider caching user summaries with longer TTL or using a denormalized count table.

### No Pagination for Large Data Sets

**Files:**
- `src/lib/actions/entries.ts` - Uses `limit: 50` but no cursor-based pagination
- `src/lib/actions/plaza.ts` - Limited to 200 public users max

**Problem:** Offset-based pagination doesn't scale. Fixed limits may truncate data.

**Impact:** Users with large libraries may not see all their data.

**Improvement path:** Implement cursor-based pagination for all list endpoints.

### Missing Database Indexes

**File:** `src/db/schema.ts`

**Problem:** While basic indexes exist on `userId`, `status`, `rating`, `favorite`, there are no composite indexes for common query patterns like:
- `(userId, status, updatedAt)` - Dashboard filtering
- `(userId, favorite, updatedAt)` - Favorites view
- `(publishToPlaza, isActive, updatedAt)` - Plaza queries

**Impact:** Slower queries as data grows.

**Improvement path:** Add composite indexes based on query patterns in `src/lib/actions/entries.ts` and `src/lib/actions/plaza.ts`.

## Fragile Areas

### Complex Entry Dialog Component

**File:** `src/components/entry-dialog/entry-dialog.tsx` (698 lines)

**Why fragile:**
- Handles 4 different media types with conditional rendering
- Complex state management for dates, ratings, tags
- Mixed concerns (UI logic + data submission)

**Safe modification:**
- Extract media-type-specific form logic into separate components
- Use state machine pattern for dialog flow
- Add comprehensive tests before refactoring

**Test coverage:** None - component has no test file.

### Search Route Complexity

**File:** `src/app/api/search/[type]/route.ts` (451 lines)

**Why fragile:**
- Integrates 6+ external APIs (TMDB, Google Books, Hardcover, RAWG, Spotify, MusicBrainz)
- Complex result merging logic in `src/lib/search-utils.ts`
- Each API has different response formats and error handling

**Safe modification:**
- Add integration tests for each provider
- Use schema validation on all external responses
- Implement circuit breaker pattern for failing APIs

**Test coverage:** Minimal - only `src/test/api-tmdb.test.ts` exists.

### Goodreads Import Logic

**File:** `src/db/goodreads-importer.ts` (326 lines)

**Why fragile:**
- Complex CSV parsing with multiple format variations
- Author name normalization
- ISBN matching against external APIs
- Returns `null` in many error cases (lines 116, 121, 131, 180, 194)

**Safe modification:**
- Add unit tests for CSV parsing edge cases
- Log warnings instead of silent null returns
- Add import validation preview before committing

**Test coverage:** None.

### Authentication Session Handling

**File:** `src/lib/auth.ts`

**Why fragile:**
- In-memory revocation cache (`revocationCache` Map) with 2-second TTL
- Redis timeout of 500ms for revocation checks (line 83)
- Complex interaction between JWT, cookies, and Redis

**Safe modification:**
- Add integration tests for session revocation
- Test Redis failure scenarios
- Consider using Next.js built-in session management

**Test coverage:** E2E tests in `e2e/auth.spec.ts` cover basic flows.

## Dependencies at Risk

### Multiple External API Dependencies

**Packages:** TMDB, Google Books, Hardcover, RAWG, Spotify, MusicBrainz, Last.fm

**Risk:** Any of these services could:
- Change API format
- Rate limit or block requests
- Shut down entirely

**Impact:** Search functionality would degrade or fail.

**Migration plan:**
- Abstract API clients behind common interface
- Implement graceful degradation (return local results only)
- Add API health monitoring

### Redis as Hard Dependency for Caching

**File:** `src/lib/redis.ts`

**Risk:** Redis is optional but if configured incorrectly, API response times degrade significantly.

**Impact:** External API calls happen on every request without cache.

**Migration plan:** Redis fallback already exists (returns null), but consider in-memory LRU cache as additional fallback.

## Test Coverage Gaps

### Minimal Unit Test Coverage

**Current tests:**
- `src/test/search-utils.test.ts` - Utility functions
- `src/test/api-tmdb.test.ts` - TMDB API client
- `e2e/auth.spec.ts` - Authentication flows
- `e2e/home-ui.spec.ts` - Home page UI
- `e2e/security.spec.ts` - Security redirects

**What's not tested:**
- `src/lib/actions/entries.ts` (507 lines) - All CRUD operations
- `src/lib/actions/plaza.ts` (368 lines) - Public feed logic
- `src/lib/actions/settings.ts` - Settings updates
- `src/db/goodreads-importer.ts` (326 lines) - CSV import
- `src/components/entry-dialog/entry-dialog.tsx` (698 lines) - Main entry UI
- `src/components/command-palette/command-palette.tsx` (274 lines)
- All API route handlers except TMDB

**Risk:** Regression bugs in core functionality would only be caught by manual testing.

**Priority:** High - Core business logic has no automated tests.

### No Integration Tests for API Routes

**Missing:**
- `/api/search/[type]` - Book/movie/music search
- `/api/import/goodreads` - CSV import
- `/api/export` - Data export
- `/api/plaza/feed` - Public feed

**Priority:** High - External API integration points are untested.

### No Load/Performance Tests

**Risk:** Unknown breaking point for concurrent users.

**Priority:** Medium - Application is single-user focused currently.

## Missing Critical Features

### Multi-User Support Incomplete

**File:** `TODO.md`

**What's missing:**
- [ ] Auto-sync to Hardcover
- [ ] Auto-sync to RAWG
- [ ] Full user system (registration exists but limited)
- [ ] User data isolation in queries (partially implemented)
- [ ] "Plaza" public feed for user discoveries
- [ ] Privacy settings (partially implemented)

**Blocks:** True multi-user deployment with data isolation.

**Priority:** High - Listed as TODO but core architecture needs it.

### Admin Settings UI Limited

**File:** `src/components/dashboard/settings-form.tsx`

**What's missing:**
- Site-wide visibility controls
- User management interface
- API key configuration UI

**Priority:** Medium - Currently configured via environment variables.

---

*Concerns audit: 2026-03-06*
