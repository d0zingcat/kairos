# Codebase Structure

**Analysis Date:** 2026-03-06

## Directory Layout

```
kairos/
├── src/                    # Main source code
│   ├── app/                # Next.js App Router pages and API routes
│   ├── components/         # React components (shared and feature-specific)
│   ├── db/                 # Database schema, migrations, and client
│   ├── lib/                # Core utilities, actions, and API clients
│   ├── messages/           # i18n translation files (zh.json, en.json)
│   ├── data/               # Static data files (product changelog)
│   ├── test/               # Test files (Vitest, Playwright)
│   └── instrumentation.ts  # Application startup hooks
├── public/                 # Static assets (manifest.json, sw.js, images)
├── scripts/                # Utility scripts (changelog generator)
├── drizzle/                # Database migration files
├── .github/                # GitHub Actions workflows
├── .claude/                # Claude agent configuration
├── .planning/              # Planning documents (generated)
├── docs/                   # Documentation
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Production Docker image
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── next.config.ts          # Next.js configuration
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages and API routes
- Contains: Route groups, layout files, page components, API route handlers
- Key files:
  - `src/app/layout.tsx` - Root layout with providers
  - `src/app/page.tsx` - Landing page
  - `src/app/dashboard/layout.tsx` - Dashboard shell with sidebar
  - `src/app/dashboard/page.tsx` - Dashboard overview
  - `src/app/api/search/[type]/route.ts` - Search aggregation endpoint

**`src/components/`:**
- Purpose: Reusable and feature-specific UI components
- Contains:
  - `ui/` - shadcn/ui primitives (button, dialog, input, etc.)
  - `dashboard/` - Dashboard-specific components (nav, grids, forms)
  - `command-palette/` - Cmd+K quick entry functionality
  - `entry-dialog/` - Media entry creation/editing dialogs
  - `heatmap/` - Activity heatmap component
  - `i18n/` - Locale switcher and translation provider
  - `theme/` - Theme toggle and provider
  - `plaza/` - Public plaza components
  - `login/` - Login/register forms

**`src/lib/`:**
- Purpose: Core business logic and utilities
- Contains:
  - `actions/` - Server actions (entries, auth, plaza, settings)
  - `api/` - External API clients (TMDB, Google Books, Spotify, etc.)
  - `validations/` - Zod schemas for input validation
  - `auth.ts` - JWT session management
  - `redis.ts` - Redis client and cache helpers
  - `i18n.ts` - Internationalization utilities
  - `logger.ts` - Structured logging
  - `constants.ts` - Application constants (media types)
  - `search-utils.ts` - Search result deduplication

**`src/db/`:**
- Purpose: Database layer
- Contains:
  - `schema.ts` - Drizzle ORM schema definitions (7 tables)
  - `index.ts` - Database client initialization
  - `migrate.ts` - Migration runner
  - `auto-migrate.ts` - Automatic migration on startup
  - `seed.ts` - Seed data for development

**`src/messages/`:**
- Purpose: i18n translation files
- Contains: `zh.json`, `en.json` - keyed translation strings

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with theme, i18n, and global providers
- `src/app/page.tsx`: Landing page (public)
- `src/app/dashboard/layout.tsx`: Dashboard layout with access control
- `src/instrumentation.ts`: Startup hook for auto-migration

**Configuration:**
- `next.config.ts`: Next.js config (standalone output, image domains)
- `tsconfig.json`: TypeScript paths (`@/*` -> `src/*`)
- `package.json`: Dependencies, scripts, version
- `docker-compose.yml`: PostgreSQL + app services

**Core Logic:**
- `src/lib/actions/entries.ts`: CRUD for books, music, watches, games
- `src/lib/auth.ts`: JWT session creation, verification, revocation
- `src/lib/api/search/[type]/route.ts`: Multi-source search aggregation
- `src/db/schema.ts`: All table definitions and type exports

**Testing:**
- `src/test/setup.ts`: Vitest configuration
- `src/test/*.test.ts`: Unit and integration tests

## Naming Conventions

**Files:**
- Components: `kebab-case.tsx` (e.g., `dashboard-header.tsx`, `media-card.tsx`)
- Utilities: `kebab-case.ts` (e.g., `search-utils.ts`, `site-settings.ts`)
- Server actions: `plural-noun.ts` (e.g., `entries.ts`, `settings.ts`)
- API clients: `service-name.ts` (e.g., `tmdb.ts`, `spotify.ts`)
- Schemas: `domain.ts` (e.g., `entry.ts` in validations/)

**Directories:**
- Feature folders: `kebab-case` (e.g., `command-palette/`, `entry-dialog/`)
- UI primitives: `ui/` (flat structure)
- API routes: Match URL structure (e.g., `api/search/[type]/`)

**Types:**
- Database types: Exported from schema (`Book`, `NewBook`, `Music`, etc.)
- Component props: Inline or extracted interfaces
- API responses: `ApiResponse<T>` pattern

## Where to Add New Code

**New Feature (e.g., Movies category):**
- Schema: `src/db/schema.ts` - add new table definition
- Server actions: `src/lib/actions/entries.ts` - add CRUD functions
- API client: `src/lib/api/` - add external service integration
- Search route: `src/app/api/search/[type]/route.ts` - add case handler
- Page: `src/app/dashboard/movies/page.tsx` - list view
- Components: `src/components/dashboard/movies-grid.tsx` - display component

**New Component:**
- Shared UI: `src/components/ui/new-component.tsx`
- Feature-specific: `src/components/feature-name/component-name.tsx`

**Utilities:**
- Shared helpers: `src/lib/utils.ts` or new file in `src/lib/`
- Validation schemas: `src/lib/validations/schema-name.ts`

**API Integration:**
- Client: `src/lib/api/new-service.ts`
- Route handler: `src/app/api/new-endpoint/route.ts`

**Translations:**
- Add keys to: `src/messages/zh.json` and `src/messages/en.json`

## Special Directories

**`.next/`:**
- Purpose: Next.js build output and dev cache
- Generated: Yes (by `next dev` / `next build`)
- Committed: No (gitignored)

**`drizzle/`:**
- Purpose: Database migration SQL files
- Generated: Yes (by `bun run db:generate`)
- Committed: Yes

**`dist/`:**
- Purpose: Production build output (migrations)
- Generated: Yes (by `bun run build:migrate`)
- Committed: No (gitignored)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (by `bun install`)
- Committed: No (gitignored)

## Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Common imports:
- `@/db` - Database client
- `@/db/schema` - Schema definitions and types
- `@/lib/auth` - Authentication utilities
- `@/lib/actions/*` - Server actions
- `@/lib/api/*` - External API clients
- `@/components/*` - UI components

---

*Structure analysis: 2026-03-06*
