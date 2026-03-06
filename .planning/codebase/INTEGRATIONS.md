# External Integrations

**Analysis Date:** 2026-03-06

## APIs & External Services

**Media Metadata APIs:**

- **TMDB (The Movie Database)** - Movie and TV show metadata
  - SDK/Client: Native `fetch` API
  - Auth: `TMDB_API_KEY` environment variable
  - Location: `src/lib/api/tmdb.ts`
  - Endpoints: `/search/movie`, `/search/tv`, `/movie/{id}`, `/tv/{id}`
  - Caching: Redis (1 day for search, 7 days for details)

- **Spotify** - Music metadata and OAuth
  - SDK/Client: Native `fetch` API
  - Auth: Client credentials flow (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`)
  - Location: `src/lib/api/spotify.ts`
  - Endpoints: `/v1/search`, `/api/token`
  - Token caching: In-memory with refresh logic

- **Google Books** - Book metadata
  - SDK/Client: Native `fetch` API
  - Auth: `GOOGLE_BOOKS_API_KEY` environment variable
  - Location: `src/lib/api/google-books.ts`
  - Endpoints: `/books/v1/volumes`
  - Caching: Redis (1 day for search, 7 days for details)

- **Hardcover** - Book metadata (alternative, better Chinese book support)
  - SDK/Client: Native `fetch` API (GraphQL)
  - Auth: `HARDCOVER_API_TOKEN` (GraphQL token)
  - Location: `src/lib/api/hardcover.ts`
  - Endpoint: `/v1/graphql`
  - Note: Recommended for better Chinese book search results

- **RAWG** - Video game metadata
  - SDK/Client: Native `fetch` API
  - Auth: `RAWG_API_KEY` environment variable
  - Location: `src/lib/api/rawg.ts`
  - Endpoints: `/api/games`, `/api/games/{id}`
  - No caching implemented

- **MusicBrainz** - Music metadata (open-source)
  - SDK/Client: Native `fetch` API
  - Auth: None required (public API with User-Agent header)
  - Location: `src/lib/api/musicbrainz.ts`
  - Endpoints: `/ws/2/release-group/`, `/ws/2/recording/`
  - Cover art: Cover Art Archive API

- **Last.fm** - Album cover art fallback
  - SDK/Client: Native `fetch` API
  - Auth: `LASTFM_API_KEY` environment variable
  - Location: `src/lib/api/musicbrainz.ts` (helper function)
  - Endpoint: `/2.0/?method=album.getinfo`

## Data Storage

**Databases:**
- PostgreSQL
  - Connection: `DATABASE_URL` environment variable
  - Client: `postgres` package via Drizzle ORM
  - ORM: Drizzle ORM with schema in `src/db/schema.ts`
  - Migrations: Drizzle Kit (`drizzle-kit migrate`, `drizzle-kit push`)
  - Tables: `users`, `books`, `music`, `watches`, `games`, `app_settings`

**File Storage:**
- Local filesystem only (no cloud storage)
- Static assets served from `./public` directory
- Images: External URLs cached, no local image storage

**Caching:**
- Redis
  - Connection: `REDIS_URL` environment variable (defaults to `redis://localhost:6379`)
  - Client: `ioredis` with global singleton pattern
  - Location: `src/lib/redis.ts`
  - TTL: 1 day for search results, 7 days for details
  - Features: Connection error handling, TLS support, DB selection

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication
- Implementation:
  - JWT signing/verification via `jose` package
  - Password hashing via `bcryptjs`
  - Session cookies (`kairos-session`) with 30-day expiry
  - Token revocation via Redis blacklist
  - Location: `src/lib/auth.ts`

**User Roles:**
- `admin` - Full access, can manage settings
- `member` - Standard user access

## Monitoring & Observability

**Error Tracking:**
- None integrated

**Logs:**
- Custom logging system with levels (debug, info, warn, error)
- Location: `src/lib/logger.ts`
- API request/response logging with trace IDs
- Environment-controlled via `LOG_LEVEL`

## CI/CD & Deployment

**Hosting:**
- Docker containerization (multi-stage build)
- Base image: `oven/bun:1-slim`
- Dockerfile: `./Dockerfile`

**CI Pipeline:**
- GitHub Actions
  - Workflow: `.github/workflows/ci-docker-ghcr.yml`
    - Lint (ESLint)
    - Docker build and push to GHCR
  - Workflow: `.github/workflows/release.yml`
    - semantic-release for automated versioning
    - Product changelog generation (via OpenAI)
  - Caching: Bun dependencies, Next.js build, ESLint

**Container Registry:**
- GitHub Container Registry (GHCR)
- Image format: `ghcr.io/{owner}/{repo}:latest` and `:sha-{short}`

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `ADMIN_PASSWORD_HASH` - Admin password (bcrypt hash)
- `VIEWER_PASSWORD_HASH` - Optional viewer password (for password-protected mode)
- `SITE_VISIBILITY` - Default: `private` | `public` | `password`

**Optional env vars:**
- `REDIS_URL` - Redis connection (defaults to localhost)
- `TMDB_API_KEY` - TMDB API key
- `GOOGLE_BOOKS_API_KEY` - Google Books API key
- `HARDCOVER_API_TOKEN` - Hardcover GraphQL token
- `RAWG_API_KEY` - RAWG games API key
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` - Spotify OAuth
- `LASTFM_API_KEY` - Last.fm API key
- `LOG_LEVEL` - Logging level (default: debug in dev, info in prod)
- `OPENAI_API_KEY` - For automated changelog generation

**Secrets location:**
- `.env` file for local development (gitignored)
- GitHub Secrets for CI/CD (`GITHUB_TOKEN`, `OPENAI_API_KEY`)
- Docker secrets or environment injection for production

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-03-06*
