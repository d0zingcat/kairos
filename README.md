# Kairos — Record Every Moment of Life

> καιρόs — Greek for "the right or opportune moment"

[中文版 README](README.zh.md)

A modern personal life tracking app for your books, music, movies, and games.

For detailed release history, see [CHANGELOG.md](CHANGELOG.md).
User-facing release summary data is maintained in `src/data/product-changelog.{zh,en}.json`, powering the product changelog page (accessible at `/dashboard/settings`).
Product direction and execution priorities are documented in [docs/product-roadmap.en.md](docs/product-roadmap.en.md) (Chinese: [docs/product-roadmap.md](docs/product-roadmap.md)).

Optional: Use OpenAI to auto-generate user-facing release summaries from `CHANGELOG.md` (supports both Chinese and English, with automatic technical term handling). The script reads only the most recent release and prepends the new entry to the top of `src/data/product-changelog.{zh,en}.json` — historical entries are never rewritten:

```bash
OPENAI_API_KEY=your_key bun run changelog:generate:product
```

Override the default model with `OPENAI_CHANGELOG_MODEL` (default: `gpt-4o-mini`).

![Kairos](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square)

## Features

- 📊 **GitHub-style Activity Heatmap** — See your recording frequency at a glance
- 📆 **Past-Year Heatmap** — Displays "past 365 days through today", avoiding blank cells for future dates
- 🧭 **Heatmap Date Key Fix** — Unified activity date keys with filtering by `date(created_at)`; same-day entries render with correct coloring
- 📚 **Books Count by Reading Date** — Books are counted toward the heatmap by `startDate` / `finishDate` first; falls back to `createdAt` only when those are missing
- ⌘ **Cmd+K Quick Entry** — Command palette for searching and logging (supports `/isbn 978...` for precise book metadata import via Hardcover by ISBN)
- 📚 **Four Media Types** — Books / Music / Movies & TV / Games
- ✏️ **Click-to-Edit Cards** — Books / Music / Watch / Games all support editing by clicking existing cards
- 🔎 **Resilient Search Fallback** — Local library first + multi-source aggregation; search still works with local data when third-party APIs are unavailable
- 🔭 **Enhanced Observability** — Tiered logging for the search pipeline + `x-trace-id` end-to-end tracing
- 🌓 **Light / Dark / Auto Themes** — Manual toggle and automatic system-theme following
- 🌐 **Internationalization (i18n)** — Chinese and English UI switching for multilingual users
- 💾 **Data Management (JSON Backup)** — Export all media records as a JSON file from the admin settings page, for easy backup and migration
- 📝 **Changelog Entry Consolidated** — The "Changelog" entry has been moved into the settings page, reducing outer-nav redundancy
- 🔒 **Three Access Modes** — Supports `public` / `private` / `password`, switchable in real time from "Admin Settings" (`/dashboard/settings`)
- 🏷️ **Tag Input & Multi-Author Support** — Uses the `TagInput` component; supports Enter / comma-separated author and category entry, colored category tags, and clean author tags
- 🗑️ **Record Deletion & Live Sync** — Delete records via the trash icon while editing; removed in real time from both your Dashboard and the Plaza
- 💿 **Music Type Differentiation** — Supports Album and Track types; Spotify search auto-detects type; external source type is locked; Plaza feed shows a type icon
- 📝 **Reserved Username Protection** — Usernames like `admin`, `official`, `system` are automatically reserved at registration
- 👥 **Multi-User Account System** — Register an account; each user sees only their own timeline by default
- 🌐 **Public Plaza** — Users can toggle "whether to publish summary activity" and showcase recent activity on the Plaza (`/plaza`)
- 📥 **Goodreads One-Click Import** — Upload a CSV from "Admin Settings"; auto-appends and skips duplicates
- 🐳 **Docker One-Click Deployment** — PostgreSQL + App, fully containerized
- 🗄️ **In-Image Migrations** — The `latest` image bundles `dist/migrate.js`, supporting database initialization without source code

## Quick Start

### Docker Compose (Recommended)

```bash
# 1. Clone the project
git clone https://github.com/d0zingcat/kairos.git
cd kairos

# 2. Configure environment variables
cp .env.example .env
# Edit .env — fill in DATABASE_URL / JWT_SECRET / search API Keys

# 3. Start
docker compose up -d

# 4. (Optional) Load sample data
docker compose exec app bun run db:seed

# Visit http://localhost:3000
```

### Database Migration for Image-Only Deployment

```bash
# Run directly when you have only the image and no source code
docker run --rm \
  --network <your_network> \
  -e DATABASE_URL='postgresql://user:pass@db:5432/kairos' \
  ghcr.io/d0zingcat/kairos:latest \
  bun dist/migrate.js
```

### Local Development

```bash
# Install dependencies
bun install

# Start PostgreSQL (local install or Docker)
docker run -d --name kairos-pg \
  -e POSTGRES_USER=kairos \
  -e POSTGRES_PASSWORD=kairos \
  -e POSTGRES_DB=kairos \
  -p 5432:5432 \
  postgres:16-alpine

# Configure environment variables
cp .env.example .env

# Start the dev server (migrations run automatically on boot)
bun run dev

# (Optional) Load sample data
bun run db:seed
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|:--------:|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `DB_AUTO_MIGRATE` | Auto-run migrations on boot (on by default) | Optional |
| `JWT_SECRET` | JWT signing key (≥32 chars) | ✅ |
| `SITE_VISIBILITY` | Default access mode (fallback when DB is uninitialized) | Optional |
| `LOG_LEVEL` | Server log level (debug/info/warn/error) | Optional |
| `TMDB_API_KEY` | TMDB API Key (movie & TV search) | When searching |
| `GOOGLE_BOOKS_API_KEY` | Google Books API Key | When searching |
| `HARDCOVER_API_TOKEN` | Hardcover API Token (Chinese book search enhancement) | Recommended |
| `RAWG_API_KEY` | RAWG API Key (game search) | When searching |
| `SPOTIFY_CLIENT_ID` | Spotify Client ID (preferred music search source) | Recommended |
| `SPOTIFY_CLIENT_SECRET` | Spotify Client Secret | Recommended |
| `LASTFM_API_KEY` | Last.fm API Key (music cover fallback) | When searching |
| `NEXT_PUBLIC_SITE_AUTHOR` | Author name shown in the site footer (default: d0zingcat) | Optional |
| `NEXT_PUBLIC_GITHUB_URL` | GitHub icon link in the site footer (defaults to author's repo) | Optional |
| `NEXT_PUBLIC_GITHUB_REPO` | GitHub repo used for version checks in settings, format `owner/repo` | Optional |
| `GITHUB_TOKEN` | Server-side GitHub Token for private-repo version checks | Recommended for private repos |

> Search APIs return an `x-trace-id` response header; use it to correlate backend logs for troubleshooting.
> Access mode prefers the admin setting stored in the database; falls back to `SITE_VISIBILITY` if none is set.
> After first boot, visit `/register` to create an account; the first registered user becomes admin automatically.
> If `NEXT_PUBLIC_GITHUB_REPO` points to a private repository, also configure `GITHUB_TOKEN` — otherwise the version check will show "unable to verify the latest version" instead of falsely reporting "up to date."

## Security Deployment

When self-hosting and exposing to the public internet:

- **Set a strong, random `JWT_SECRET`** (≥32 characters). A built-in fallback exists for development — **never rely on it in production**.
- **Change default database credentials**. The `kairos/kairos` in `docker-compose.yml` and README examples is for local development only.
- **Never run `db:seed` in production**. That script creates a demo account with a default password of `admin12345`.
- **Guard your API keys**. All third-party secrets are injected via `.env`; never commit them to version control.
- Configure `SITE_VISIBILITY`, registration policy, and reverse proxy (HTTPS, rate limiting, etc.) according to your threat model.

More details in [SECURITY.md](SECURITY.md).

## Data Sources & Attribution

Search and metadata are provided by the following third-party services; self-hosters must obtain their own API keys and comply with each service's terms:

| Service | Purpose | Docs |
|---------|---------|------|
| TMDB | Movie & TV search and posters | https://www.themoviedb.org/documentation/api |
| Spotify | Music search (preferred source) | https://developer.spotify.com/documentation/web-api |
| RAWG | Game search | https://rawg.io/apidocs |
| Google Books | Book search | https://developers.google.com/books |
| Hardcover | Chinese book enhancement | https://hardcover.app/account/api |
| MusicBrainz | Music metadata fallback | https://musicbrainz.org/doc/MusicBrainz_API |
| Last.fm | Music cover fallback | https://www.last.fm/api |
| OpenAI | Plaza content moderation (optional) | https://platform.openai.com/docs |

When TMDB data is used, the app displays an attribution statement in the footer and settings page:

> *This product uses the TMDB API but is not endorsed or certified by TMDB.*

## Multi-User & Plaza

- By default, users can only view and manage their own records (books, music, movies & TV, games).
- From `Dashboard -> Settings`, toggle the "Publish summary publicly" switch to control visibility on the Plaza.
- The Plaza page is at `/plaza`, showing summaries and recent activity from users who have opted in.
- Public profile pages are at `/u/<username>`; non-public users expose no profile content.
- The Plaza feed uses infinite scroll, with a "click to retry" fallback on network failure and a brief toast when loading resumes.

## Tech Stack

- **Framework**: Next.js 16 (App Router, RSC)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Cache**: Redis (ioredis) — accelerates third-party API search and detail queries
- **Auth**: JWT (jose) + bcrypt
- **Automated Testing**: Vitest + Playwright
- **Animation**: Framer Motion
- **Heatmap**: react-activity-calendar
- **Package Manager**: Bun
- **Deployment**: Docker Compose

## Scripts

```bash
bun run dev                    # Development server
bun run build                  # Production build
bun run build:migrate          # Build the runtime migration script
bun run start                  # Start the production server
bun run lint                   # ESLint check
bun run db:generate            # Generate migration files
bun run db:push                # Push schema to the database (optional: fast local schema sync)
bun run db:migrate             # Run migrations
bun run db:migrate:runtime     # Run the in-image runtime migration script (recommended for remote/production images)
bun run db:studio              # Open Drizzle Studio
bun run db:seed                # Load sample data
bun run db:import:goodreads -- /path/to/goodreads_library_export.csv <userId>          # Import Goodreads library
bun run db:import:goodreads -- /path/to/goodreads_library_export.csv <userId> --clear  # Clear the user's books before import
```

### Migration Baseline Reset (Destructive)

- The repository has been reset to a new Drizzle baseline migration: `drizzle/0000_init.sql`.
- Auto-migration at boot invokes only Drizzle's official migrator; it does not manually modify Drizzle metadata.
- The Docker image build never runs `db:generate`; production environments only apply committed `drizzle/*.sql` migration files.
- If your database still has the old schema and you don't need to preserve data, run this first:

```sql
drop schema if exists public cascade;
create schema public;
```

- Then start the app (`bun run dev` / `bun run start`) and auto-migration will rebuild the schema.

Import Dashboard entry: `/dashboard/settings` → Goodreads Import.

## Agent Collaboration Conventions

- A new `AGENTS.md` at the repository root standardizes the default finish-up workflow for Codex / Claude Code.
- Trigger via the shortcut `收尾` or `ship`: updates documentation, updates `CHANGELOG`, bumps version, commits, pushes, and creates or updates a PR.
- Agents are forbidden from committing directly to `main`; all changes must land through PRs.

## Open Source

This project is released under the [MIT License](LICENSE). Forking, self-hosting, and contributions are welcome; please submit changes via Pull Request.

Before making the repository public, please confirm:

- `.env` has not been committed and no secrets are leaked in git history
- Production instances have had default credentials and `JWT_SECRET` changed
- If the GHCR image needs public distribution, adjust visibility in GitHub Packages settings

## License

[MIT](LICENSE) — Copyright (c) 2026 d0zingcat
