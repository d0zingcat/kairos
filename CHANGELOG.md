# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/d0zingcat/kairos/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/d0zingcat/kairos/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/d0zingcat/kairos/releases/tag/v0.1.0
