# Technology Stack

**Analysis Date:** 2026-03-06

## Languages

**Primary:**
- TypeScript 5.x - Primary language for all application code
- JavaScript (ES2017+) - Runtime target

**Secondary:**
- SQL (PostgreSQL dialect) - Database queries via Drizzle ORM

## Runtime

**Environment:**
- Node.js 22 (GitHub Actions CI)
- Bun 1.x - Local development and production runtime

**Package Manager:**
- Bun 1.2.23
- Lockfile: `bun.lock` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with App Router
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- PostCSS - CSS processing
- class-variance-authority 0.7.1 - Component variant utilities
- clsx 2.1.1 - Conditional class names
- tailwind-merge 3.5.0 - Merge Tailwind classes

**UI Components:**
- Radix UI 1.4.3 - Unstyled, accessible primitives
- shadcn/ui - Component library built on Radix
- Lucide React 0.575.0 - Icon library
- Framer Motion 12.34.3 - Animation library
- cmdk 1.1.1 - Command palette component
- sonner 2.0.7 - Toast notifications

**Testing:**
- Vitest 4.0.18 - Unit test runner (JSDOM environment)
- Playwright 1.58.2 - E2E testing (Chromium)
- Testing Library React 16.3.2 - Component testing utilities

**Build/Dev:**
- Turbopack (via `next dev --turbopack`) - Development bundler
- ESLint 9 - Linting
- semantic-release 25.0.3 - Automated releases

## Key Dependencies

**Database:**
- Drizzle ORM 0.45.1 - Type-safe ORM for PostgreSQL
- postgres 3.4.8 - PostgreSQL client
- drizzle-zod 0.8.3 - Zod schema integration

**Validation:**
- Zod 4.3.6 - Runtime type validation and schema parsing

**Authentication:**
- jose 6.1.3 - JWT signing and verification
- bcryptjs 3.0.3 - Password hashing

**Caching:**
- ioredis 5.10.0 - Redis client with connection pooling

**Date Handling:**
- date-fns 4.1.0 - Date manipulation

**URL State:**
- nuqs 2.8.8 - Type-safe URL search params

## Configuration

**Environment:**
- `.env` - Local environment variables (gitignored)
- `.env.example` - Template for required variables
- Key configs: `DATABASE_URL`, `JWT_SECRET`, API keys for external services

**Build:**
- `next.config.ts` - Next.js configuration (standalone output, image domains)
- `tsconfig.json` - TypeScript configuration with path alias `@/*` -> `./src/*`
- `drizzle.config.ts` - Drizzle ORM schema location and PostgreSQL dialect
- `vitest.config.ts` - Vitest configuration with JSDOM environment
- `playwright.config.ts` - Playwright E2E configuration
- `eslint.config.mjs` - ESLint configuration
- `postcss.config.mjs` - PostCSS with Tailwind

## Platform Requirements

**Development:**
- Bun 1.x runtime
- PostgreSQL 15+ database
- Redis (optional, for caching)
- Node.js 22+ (alternative runtime)

**Production:**
- Docker containerization (multi-stage build)
- Base image: `oven/bun:1-slim`
- Output: Standalone Next.js build (`output: "standalone"`)
- Port: 3000
- Deployment: Docker container to any container host

---

*Stack analysis: 2026-03-06*
