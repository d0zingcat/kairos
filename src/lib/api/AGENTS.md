# src/lib/api — External API Integrations

**Location**: `src/lib/api/`  
**Purpose**: External API clients for media metadata (books, music, movies, games)

## STRUCTURE

```
api/
├── google-books.ts    # Google Books API (book search, metadata)
├── hardcover.ts       # Hardcover API (Chinese book metadata, enhances Google Books)
├── musicbrainz.ts     # MusicBrainz API (music metadata, cover art)
├── rawg.ts            # RAWG API (game search, metadata)
├── spotify.ts         # Spotify API (music search, preferred source)
└── tmdb.ts            # TMDB API (movie/TV search, metadata, posters)
```

## WHERE TO LOOK

| Task | File | API |
|------|------|-----|
| Book search | `google-books.ts`, `hardcover.ts` | Google Books + Hardcover (Chinese) |
| Music search | `spotify.ts`, `musicbrainz.ts` | Spotify (primary) + MusicBrainz (fallback) |
| Movie/TV search | `tmdb.ts` | TMDB (The Movie Database) |
| Game search | `rawg.ts` | RAWG (games database) |
| Image URLs | All files | Poster/cover art URL helpers |

## API CLIENTS

### 1. **TMDB** (`tmdb.ts`)
**Purpose**: Movie and TV show metadata  
**Auth**: Bearer token (`TMDB_API_KEY`)  
**Caching**: 1 hour search, 6 hours details  
**Endpoints**:
- `/search/movie` — Search movies
- `/search/tv` — Search TV shows
- `/movie/{id}` — Movie details
- `/tv/{id}` — TV show details
- **Image base**: `https://image.tmdb.org/t/p/w500` (poster paths)

### 2. **Spotify** (`spotify.ts`)
**Purpose**: Music search (primary source)  
**Auth**: Client credentials flow (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`)  
**Caching**: 1 hour search, 6 hours details  
**Endpoints**:
- `GET /v1/search` — Search tracks/albums
- `GET /v1/{type}/{id}` — Get details
- **Image**: `images[0].url` from API response

### 3. **MusicBrainz** (`musicbrainz.ts`)
**Purpose**: Music metadata (fallback to Spotify)  
**Auth**: None (public API)  
**Caching**: 1 hour search, 6 hours details  
**Endpoints**:
- `/ws/2/release` — Search releases (albums)
- `/ws/2/recording` — Search recordings (tracks)
- **Cover art**: Integrates with Cover Art Archive

### 4. **Google Books** (`google-books.ts`)
**Purpose**: Book search and metadata  
**Auth**: API key (`GOOGLE_BOOKS_API_KEY`)  
**Caching**: 1 hour search, 6 hours details  
**Endpoints**:
- `/books/v1/volumes?q={query}` — Search books
- `/books/v1/volumes/{id}` — Get book details
- **Image**: `volumeInfo.imageLinks.thumbnail`

### 5. **Hardcover** (`hardcover.ts`)
**Purpose**: Chinese book metadata (enhancement)  
**Auth**: Bearer token (`HARDCOVER_API_TOKEN`)  
**Caching**: 1 hour search  
**Endpoints**:
- GraphQL: `searchBooks(query)` — Search with Chinese title support
- **Use case**: Better Chinese book coverage than Google Books

### 6. **RAWG** (`rawg.ts`)
**Purpose**: Game search and metadata  
**Auth**: API key (`RAWG_API_KEY`)  
**Caching**: 1 hour search, 6 hours details  
**Endpoints**:
- `/games` — Search games
- `/games/{id}` — Game details
- **Image**: `background_image` field

## CONVENTIONS

**API Client Pattern**:
```typescript
import { createLogger } from "@/lib/logger"
import { redis } from "@/lib/redis"

const logger = createLogger("api/tmdb")
const CACHE_TTL = { search: 3600, details: 21600 } // 1h / 6h

export async function searchMovies(query: string) {
  const cacheKey = `tmdb:search:${query}`
  
  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    logger.debug("cache hit", { query })
    return JSON.parse(cached)
  }
  
  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`)
    
    const data = await response.json()
    await redis.setex(cacheKey, CACHE_TTL.search, JSON.stringify(data.results))
    logger.info("movie search completed", { query, count: data.results.length })
    return data.results
    
  } catch (error) {
    logger.error("movie search failed", { query }, error)
    throw error
  }
}
```

**Error Handling**:
- Always log with `logger.error()` (NOT console.error)
- Include trace ID in response headers (`x-trace-id`)
- Return empty array on failure (graceful degradation)
- Cache failures for 5 minutes to prevent hammering

**Caching Strategy**:
- **Search results**: 1 hour TTL
- **Detail responses**: 6 hours TTL
- **Cache keys**: `{source}:{type}:{id}` (e.g., `tmdb:movie:123`)
- **Graceful degradation**: Return empty array on Redis failure

**Search Result Merging**:
- Multiple sources merged by `search-utils.ts`
- Deduplication by title + year
- Priority: Spotify > MusicBrainz (music), Google Books > Hardcover (books)

## ANTI-PATTERNS

- ❌ `console.error()` — Use `logger.error()` from `@/lib/logger`
- ❌ No caching — ALWAYS cache API responses via Redis
- ❌ Missing error handling — Wrap all fetches in try/catch
- ❌ Hard-coded API keys — Use `process.env.*` only
- ❌ No rate limiting — Respect API rate limits (429 handling)
- ❌ Skipping validation — Validate response shape before returning

## UNIQUE STYLES

- **Trace IDs**: Every API response includes `x-trace-id` header for observability
- **Multi-source search**: Books (Google + Hardcover), Music (Spotify + MusicBrainz)
- **Response normalization**: All APIs return unified shape `{ id, title, coverUrl, ... }`
- **Chinese support**: Hardcover integration for better Chinese book coverage
- **Image domains**: 13 external domains whitelisted in `next.config.ts`

## TESTING

- Unit tests: `src/test/api-tmdb.test.ts` tests TMDB client
- Test patterns: Mock fetch, test caching behavior
- E2E tests: Search flows tested via `e2e/home-ui.spec.ts`

## NOTES

- **6 API clients** — Books (2), Music (2), Movies (1), Games (1)
- **Redis caching** — All APIs cached (1h search, 6h details)
- **Rate limits**: TMDB (40 req/10s), Spotify (no limit), RAWG (no limit specified)
- **Image domains** (13 total):
  - TMDB: `image.tmdb.org`
  - Google Books: `books.google.com`
  - RAWG: `media.rawg.io`
  - MusicBrainz: `coverartarchive.org`
  - Last.fm: `lastfm.freetls.fastly.net`
  - Hardcover: `images.hardcover.app`, `assets.hardcover.app`
  - Spotify: `i.scdn.co`
  - Apple Music: `is1-ssl.mzstatic.com` through `is5-ssl.mzstatic.com`
  - Amazon: `m.media-amazon.com`
- **Fallback chain**: Primary API → Secondary API → Empty array
- **Search priority**: User-configured (Spotify preferred for music, etc.)
