## [1.0.1](https://github.com/d0zingcat/kairos/compare/v1.0.0...v1.0.1) (2026-03-02)


### Bug Fixes

* add pull-requests permission and fetch-depth for semantic-release ([1179619](https://github.com/d0zingcat/kairos/commit/1179619bed57e2f565045d803ae975caaf11333e))

# 1.0.0 (2026-03-02)


### Bug Fixes

* cast localId to string for TypeScript compatibility ([8549b1c](https://github.com/d0zingcat/kairos/commit/8549b1c08a8c6c02b2f5063eda7f16294dd18a73))
* **changelog:** restore 0.3.2 heatmap fixes section ([d82a5f7](https://github.com/d0zingcat/kairos/commit/d82a5f760d42d5bae2730fbe114b35cfa2418003))
* generate drizzle metadata during docker build ([b9b1255](https://github.com/d0zingcat/kairos/commit/b9b125563089f0f801bfdd90de8efdaf0c41e214))
* **import:** backfill goodreads book activity to heatmap ([18f8fdb](https://github.com/d0zingcat/kairos/commit/18f8fdb3748658ba7add38dd946dde42d9bad212))
* keep sidebar when opening plaza from dashboard ([c4276c8](https://github.com/d0zingcat/kairos/commit/c4276c847cb3b364f9607b9c14843c207ea374c2))
* make entry dialog scroll with long reviews ([4aaa019](https://github.com/d0zingcat/kairos/commit/4aaa01959635f359752db3dd03ac5270b8d02ac3))
* read version from package.json instead of env variable ([141557c](https://github.com/d0zingcat/kairos/commit/141557c4c5a056a966ad3580c465925ef9bd454d))
* relax importer db type for typed drizzle instance ([b3930aa](https://github.com/d0zingcat/kairos/commit/b3930aa3e06a1d34416c1897e022b897324a6fbb))
* resolve dashboard auth redirects and bump version to 0.3.1 ([8be03bd](https://github.com/d0zingcat/kairos/commit/8be03bd73d3f4215faec8d14795fb60bf4b090b5))
* resolve linting errors in entry-dialog.tsx ([72072b5](https://github.com/d0zingcat/kairos/commit/72072b5c6694900b87b4f3cee79321a61e77e8a6))
* restore dashboard heatmap activity rendering ([da5d295](https://github.com/d0zingcat/kairos/commit/da5d29546434b63a399f83a0fe693864e27a1982))
* use typed generic db signature in importer ([21d297b](https://github.com/d0zingcat/kairos/commit/21d297b2d685818382ef16a075fdf77a00006c9e))
* use yellow accent color for update indicator ([40c23f9](https://github.com/d0zingcat/kairos/commit/40c23f96a5ad9ed59b2bd5f7557ee88cf78bfe42))


### Features

* add API debug logging mode ([9921156](https://github.com/d0zingcat/kairos/commit/992115667123d22e82084c59f30483fe22a1da59))
* add Goodreads CSV import flow ([1357a4f](https://github.com/d0zingcat/kairos/commit/1357a4f5656223332d264221595d934a19ca564a))
* add light/dark/system theme mode and unify UI tokens ([7b12c7c](https://github.com/d0zingcat/kairos/commit/7b12c7c6cca38fb7e7d438ee06a34ceb33aa0b04))
* add multi-user timeline and public plaza ([3033879](https://github.com/d0zingcat/kairos/commit/3033879860d85339320c5bb91b825ff132715190))
* add Node.js 22 to release workflow for semantic-release v25 ([d3ce2cc](https://github.com/d0zingcat/kairos/commit/d3ce2ccc34f4740825ac27bd34e95830b2138559))
* add Spotify API for music search with fallback to MusicBrainz ([579d002](https://github.com/d0zingcat/kairos/commit/579d002eb3358a1e936de7dcd4b1ad31684d74ff))
* add TagInput component and implement entry deletion ([1514c0b](https://github.com/d0zingcat/kairos/commit/1514c0b275a2897a16c1a5e317545ac2153a68e6))
* add user ownership migration and runtime migrate docs ([4259da5](https://github.com/d0zingcat/kairos/commit/4259da51d6f9ade1b267d5600822101a1855848f))
* add version display and update check ([26e3a10](https://github.com/d0zingcat/kairos/commit/26e3a1045a68cdefa3cb7ac79139ccd76572a7b3))
* **db:** auto-run migrations on app startup ([d0a0e3d](https://github.com/d0zingcat/kairos/commit/d0a0e3d532fcf784a943a6e7816a6860c30fc5c4))
* enable runtime DB migration in latest image ([85eff9c](https://github.com/d0zingcat/kairos/commit/85eff9c439123fb21a97aa0bb3342c0b6b70f2a0))
* improve search resilience, editing UX, and observability ([f4e0cf6](https://github.com/d0zingcat/kairos/commit/f4e0cf66d4de76e18a6735fc1bb1738f56339760))
* initial Kairos personal life tracker ([c9ebe48](https://github.com/d0zingcat/kairos/commit/c9ebe4895ad71bbbb15f5371c43811597f61b547))
* setup auto-release on main merge ([68d17ec](https://github.com/d0zingcat/kairos/commit/68d17eceee6071ab154948b19e0b3c77124680c4))
* setup NEXT_PUBLIC_SITE_AUTHOR and github link fallback ([8ab0ecb](https://github.com/d0zingcat/kairos/commit/8ab0ecbf4fac74c0d3132c5c3a124ca222d743cd))


### Performance Improvements

* change default sort order to updatedAt desc ([067cde9](https://github.com/d0zingcat/kairos/commit/067cde9e1817da4137e9f1be822ae0501a68e28a))
* change default sort order to updatedAt desc ([4dd0368](https://github.com/d0zingcat/kairos/commit/4dd03683e10c03fd9eb0a73f6e50f4b5a4320cde))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Spotify API Integration**: Added Spotify API client for music search with OAuth client credentials flow; music search now prioritizes Spotify, falling back to MusicBrainz when Spotify returns no results.
- **API Debug Logging**: Added `logger.debugApi()` method for detailed API request/response logging; all search API clients (Google Books, Hardcover, TMDB, RAWG, MusicBrainz, Spotify) now print request URLs and response bodies in debug mode.

### Changed

- **Default Sort Order**: Changed default sorting from `createdAt` to `updatedAt` (descending) across all media types (books, music, watches, games), so recently updated entries appear first.

## [0.3.13] - 2026-03-02

### Added

- **Tag Input Component**: New reusable `TagInput` UI component with color-coded badges, deterministic hashing for consistent colors, and a `colored` prop to toggle colorization.
- **Record Multi-tag Support**: Books now support multiple authors and categories via the new tag input interface; authors are rendered without color while categories retain colorful badges.
- **Media Entry Deletion**: Added a delete (trash) action to the entry dialog for existing records; deleting an entry also automatically removes it from the Plaza and user timeline.
- **Customizable Footer**: Added `NEXT_PUBLIC_SITE_AUTHOR` and `NEXT_PUBLIC_GITHUB_URL` environment variables to customize the footer author name and GitHub link, with safe fallbacks.

- **Startup Auto Migration**: Added Next.js startup hook (`src/instrumentation.ts`) that auto-runs Drizzle migrations before serving requests, with process-level single-run guard and PostgreSQL advisory lock to prevent concurrent multi-instance migration conflicts.
- **Migration Baseline Reset Docs**: Added destructive reset guidance in `README.md` for environments that still contain old schema but no data retention requirement.
- **Agent Finalization Workflow**: Added repository-level `AGENTS.md` instructions to standardize post-change tasks for coding agents (`docs/changelog/version bump/commit/push/PR`).
- **Main Branch Protection Rule**: Added explicit agent rule to never commit directly to `main`; all changes must go through PR.
- **Theme Mode System**: Added full `light` / `dark` / `system` theme modes with persistence and system preference auto-follow behavior.
- **Global Theme Toggle**: Added user-facing theme switcher in core navigation and home page entry points for quick mode switching.
- **Ship PR Template**: Added a standard PR body template (`Summary` / `Verification` / `Notes`) in `AGENTS.md` for consistent agent-authored PR descriptions.

### Changed

- **Deployment Initialization Flow**: Updated setup documentation to default to startup auto-migration, making manual `db:migrate` steps optional for normal app boot.
- **Database Error Copy**: Updated login/register/settings database failure messages to reflect auto-migration and connection readiness instead of instructing users to run `db:push`.
- **Finalize Trigger Keywords**: Updated workflow trigger keywords to `收尾` and `ship` (removed `/ship` to avoid shell command confusion).
- **Theme Token Coverage**: Replaced remaining hardcoded dark color classes with semantic theme tokens across dashboard, plaza, auth, command palette, and entry dialog surfaces.
- **Ship Safety Constraints**: Added mandatory `ship` guardrails requiring `gh pr create/edit --body-file`, post-update rendering verification, and immediate PR body repair when formatting is broken.
- **Drizzle Migration Baseline**: Reinitialized migration history to a single baseline file `drizzle/0000_init.sql` generated from current schema.
- **Startup Migrator Behavior**: Simplified startup migration flow to use Drizzle official migrator directly (no manual schema probing/reset and no manual metadata writes).
- **Default Sort Order**: Changed default sorting from `createdAt` to `updatedAt` (descending) across all media types (books, music, watches, games), so recently updated entries appear first.
- **API Debug Logging**: Added `logger.debugApi()` method for detailed API request/response logging; all search API clients (Google Books, Hardcover, TMDB, RAWG, MusicBrainz) now print request URLs and response bodies in debug mode.
- **Spotify API Integration**: Added Spotify API client for music search with OAuth client credentials flow; music search now prioritizes Spotify, falling back to MusicBrainz when Spotify returns no results.

### Fixed

- **Theme Readability Parity**: Fixed inconsistent day-mode readability on plaza/profile and dashboard subviews by unifying card, border, and text token usage.
- **Stats Card Gradient Class**: Fixed stats cards to correctly interpolate gradient classes at runtime.
- **Lint Warning Cleanup**: Resolved all outstanding lint warnings by migrating key media thumbnails to `next/image` and removing unused variables.

## [0.3.2] - 2026-02-28

### Fixed

- **Heatmap Date Key Normalization**: Normalized activity date keys end-to-end so entries with ISO datetime values map to the correct calendar cells.
- **Same-day Activity Filtering**: Fixed aggregation date filters to compare by calendar date (`date(created_at)`) and include records created on the current day.

## [0.3.1] - 2026-02-28

### Fixed

- **Dashboard Auth Redirect Loop**: Unauthenticated visits to `/dashboard` now redirect to `/login?next=/dashboard` instead of bouncing back to Plaza in public mode.
- **Unauthorized Dashboard Crash**: Replaced `UNAUTHORIZED` throw paths in entry server actions with login redirect flow to avoid hard server errors when sessions expire.
- **Post-login Return Path**: Login flow now honors a validated `next` parameter and returns users to the page they originally attempted to access.

## [0.3.0] - 2026-02-28

### Added

- **Multi-user Accounts**: Added user registration/login with per-user sessions, first-user admin bootstrap, and account-scoped data ownership for all timeline entries.
- **Public Plaza**: Added `/plaza` public feed with user summaries and recent public activities, plus public profile pages at `/u/[username]`.
- **Profile Visibility Control**: Added user-level public visibility toggle to control whether personal summary/activity appears in Plaza.
- **Plaza Feed Pagination API**: Added cursor-based feed endpoint at `/api/plaza/feed` for incremental client loading.
- **Infinite Scrolling Feed UX**: Added intersection-observer based infinite loading in Plaza feed with error retry and recovery feedback.

### Changed

- **Authentication Model**: Migrated from legacy admin/viewer mode to user-account sessions (`userId` + `role`) with stronger database readiness error handling.
- **Data Isolation**: Updated entry CRUD, dashboard stats, local search, and Goodreads import flow to enforce user-scoped reads/writes.

### Fixed

- **Login Failure Hard Crash**: Fixed login action crash path when user table queries fail by returning user-facing error messages.

## [0.2.1] - 2026-02-28

### Fixed

- **Goodreads Activity Backfill**: Activity heatmap now counts imported books by `startDate` / `finishDate` (falls back to `createdAt` only when both are missing), so imported reading history appears on the correct days.
- **Goodreads Start Date Mapping**: Import now maps `Date Added` to `startDate` for non-`want_to_read` books to preserve reading timeline context.

## [0.2.0] - 2026-02-28

### Added

- **Hardcover Book Search Source**: Added backend Hardcover GraphQL search client and merged results into `/api/search/book` pipeline to improve Chinese book discovery.
- **Leveled Logging System**: Added centralized logger with `debug` / `info` / `warn` / `error` levels and configurable `LOG_LEVEL`.
- **Traceable Search Requests**: Added per-request `traceId` propagation across search route and upstream API clients; search responses now include `x-trace-id` header.
- **Direct Card Editing**: Added click-to-edit flows for all categories (books, music, watches, games) using entry dialog with prefilled local metadata.
- **Books Editing UX**: Added calendar selectors for start/end reading dates and richer edit metadata fallback.
- **Access Control Modes**: Added `public` / `private` / `password` site visibility modes with separate admin/viewer sessions.
- **Admin Settings Page**: Added `/dashboard/settings` to switch visibility mode at runtime (stored in database with env fallback).
- **Settings Persistence Table**: Added `app_settings` schema for site-level runtime configuration.
- **Project TODO List**: Added `TODO.md` to track upcoming integration tasks.
- **Runtime Migration in Latest Image**: Added image-bundled DB migration script (`dist/migrate.js`) and runtime command support for no-source deployments.
- **Goodreads CSV Import**: Added admin-only Goodreads import flow (settings UI + `/api/import/goodreads` API + CSV parser/importer + CLI command `db:import:goodreads`) with duplicate skipping logic.

### Changed

- **Command Palette Input Model**: Refactored slash-command behavior to separate search mode from query text (e.g. `/book` sets mode, input keeps only keyword).
- **Search Aggregation Strategy**: Unified local-first fallback behavior across all media types; upstream failures now degrade gracefully instead of blocking results.
- **Hydration Stability**: Deferred command palette rendering until client mount to avoid Radix dialog SSR/CSR ID mismatch warnings.
- **Book Default Status**: Changed default book status in entry dialog to `want_to_read`.
- **Activity Heatmap Window**: Switched from calendar-year view to rolling last 365 days through today.
- **Docker Build Migration Metadata**: Docker build now runs `db:generate` so `drizzle/meta/_journal.json` is always present in the runtime image.
- **CI Trigger Scope**: Restricted workflow `push` trigger to `main` to avoid duplicate builds for PR branch pushes.

### Fixed

- **Hook Order Error**: Resolved React hooks order issue in `EntryDialog` caused by conditional early return position.
- **Book Activity SQL Grouping**: Fixed `getActivityData` aggregation query shape to match PostgreSQL grouping rules.
- **Password Hash Loading**: Hardened admin password hash loading to avoid env expansion corruption edge cases.
- **Date/Rating Interaction Bug**: Prevented date input typing from triggering global quick-rating keyboard shortcuts.
- **Local Record Data Loss on Update**: Fixed update payloads to preserve existing fields when editing local items.
- **Login Session UX**: Login page now redirects authenticated users to `/dashboard` to avoid conflicting states.
- **Search Route Protection**: Added server-side admin session check to `/api/search/[type]` in addition to middleware guard.
- **Entry Dialog Overflow**: Fixed long review content making the entry panel unscrollable by adding bounded dialog/content scrolling behavior.

## [0.1.0] - 2026-02-26

### Added

- **Project Bootstrap**: Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui, Bun package manager, Turbopack dev build.
- **Database Schema**: PostgreSQL 16 + Drizzle ORM with 4 core tables (`books`, `music`, `watches`, `games`) and 5 PostgreSQL enum types (`book_status`, `music_type`, `watch_type`, `watch_status`, `game_status`).
- **Database Tooling**: drizzle-kit scripts for generate / push / migrate / studio / seed; seed script with 12 sample entries covering all media types.
- **Authentication**: Single-password protection using bcrypt hash verification + JWT sessions (jose); middleware guards `/dashboard` routes; HttpOnly cookie with 30-day expiry.
- **TMDB API Client**: Movie and TV series search and detail endpoints.
- **Google Books API Client**: Book search with ISBN extraction and cover URL normalization.
- **RAWG API Client**: Game search with platform and genre normalization.
- **MusicBrainz API Client**: Album/track search via MusicBrainz + Cover Art Archive, with Last.fm fallback for cover images.
- **Unified Search Proxy**: `/api/search/[type]` route supporting book, movie, tv, game, and music types — keeps API keys server-side.
- **Dashboard Layout**: Responsive sidebar navigation (desktop) + bottom tab bar (mobile) with framer-motion `layoutId` active indicator.
- **Dashboard Overview Page**: Activity heatmap, stats cards, recent activity timeline, and favorites grid.
- **Media Category Pages**: Books, Music, Watches, and Games pages with card grids, status filtering, sorting, and search.
- **Command Palette (⌘K)**: Global quick-entry powered by cmdk; prefix-based search (`/book`, `/music`, `/movie`, `/tv`, `/game`); 300ms debounced API calls with cover thumbnails in results.
- **Entry Recording Dialog**: Auto-filled metadata from API search, star rating (1–5 mapped to 2–10), calendar date picker, status select, notes textarea, favorite toggle.
- **Activity Heatmap**: react-activity-calendar v3 with amber color scale, year-long data fill, hover tooltip showing per-type breakdown.
- **Dark Theme Design System**: zinc-950 background + amber/orange gradient accents, Geist / Geist Mono fonts with Chinese fallback.
- **Animations**: Framer Motion card stagger entrance, dialog transitions, login page entrance animation.
- **Empty States**: Illustrated empty state components with call-to-action for each media category.
- **Docker Deployment**: Multi-stage Dockerfile (oven/bun base, standalone output), docker-compose.yml with PostgreSQL 16 + app service, health checks, persistent volume.
- **Environment Configuration**: `.env.example` documenting all required and optional environment variables.

[Unreleased]: https://github.com/d0zingcat/kairos/compare/v0.3.13...HEAD
[0.3.13]: https://github.com/d0zingcat/kairos/compare/v0.3.2...v0.3.13
[0.3.2]: https://github.com/d0zingcat/kairos/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/d0zingcat/kairos/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/d0zingcat/kairos/compare/v0.2.0...v0.3.0
[0.2.1]: https://github.com/d0zingcat/kairos/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/d0zingcat/kairos/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/d0zingcat/kairos/releases/tag/v0.1.0
