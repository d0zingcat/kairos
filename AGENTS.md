# Agent Workflow Instructions

## Default Post-change Workflow (Codex / Claude Code)

After any code change is completed, unless the user explicitly says to skip:

1. Update relevant documentation (`README.md` and/or feature docs).
2. Commit with a clear [Conventional Commits](https://www.conventionalcommits.org/) message:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `chore:` for maintenance tasks
   - `refactor:` for code refactoring
   - `test:` for test-related changes
3. Create a branch with a descriptive name and push to `origin`.
4. Create a GitHub PR with a concise summary and test notes.

> **Note:** Version bumping and CHANGELOG updates are handled automatically by semantic-release when code is merged to `main`. No manual version management needed.

## Shortcut Trigger

If the user says any of the following, run the full workflow above immediately:

- `收尾`
- `ship`

## `ship` Safety Constraints (Mandatory)

When executing `ship` / `收尾`, enforce the following to avoid malformed PR descriptions:

1. **Never** pass multi-line PR Markdown via inline `gh pr create --body "..."`.
2. **Always** write PR content to a temp file and use:
   - `gh pr create --body-file <file>` or
   - `gh pr edit --body-file <file>`
3. In PR body text, avoid shell-sensitive inline command composition; keep literal Markdown in the file.
4. After creating/updating PR, **must verify** title/body rendering is correct (headings, bullets, line breaks).
5. If formatting is broken, immediately fix by re-running `gh pr edit --body-file <file>` before finishing.

### Standard PR Body Template

When writing PR body content, use this default template unless user asks for a different format:

```markdown
## Summary

- <change 1>
- <change 2>
- <change 3>

## Verification

- <command or test 1>
- <command or test 2>

## Notes

- <risk / migration / follow-up notes>
```

Template rules:

- Keep headings exactly as `Summary`, `Verification`, `Notes`.
- Keep bullets concise and action-oriented.
- Prefer plain text in bullets; avoid shell-sensitive inline composition.
- If there are no notes, still keep the `Notes` section and write `- None`.

## Branch Protection Rule (CRITICAL)

**NEVER commit or push directly to `main`.** This rule is absolute.

- Create a new branch for EVERY change (e.g., `feat/feature-name`, `fix/bug-fix`, `chore/task`)
- All changes must go through a Pull Request workflow
- Merge to `main` only via PR (squash merge preferred)
- semantic-release handles versioning automatically on main merge - do NOT bump versions manually

---

# Build / Lint / Test Commands

## Development

```bash
bun run dev         # Start Next.js dev server with Turbopack
bun run build       # Production build
bun run start       # Start production server
```

## Linting

```bash
bun run lint       # Run ESLint (uses eslint-config-next)
```

## Testing

```bash
bun run test              # Run all unit tests (Vitest)
bun run test:e2e          # Run e2e tests (Playwright)
bun test                  # Run Vitest directly
bun test src/test/xxx.test.ts   # Run single test file
bun test --filter "test name"   # Run tests matching name pattern
```

## Database (Drizzle ORM)

```bash
bun run db:generate       # Generate migration files
bun run db:push           # Push schema to database (quick sync)
bun run db:migrate        # Run migrations
bun run db:studio         # Open Drizzle Studio
bun run db:seed           # Seed example data
bun run db:import:goodreads -- <csv_path> <userId>  # Import Goodreads books
```

---

# Code Style Guidelines

## Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **UI**: React 19, Tailwind CSS v4, shadcn/ui, Radix UI primitives
- **State**: Next.js nuqs (URL state), React hooks
- **Database**: PostgreSQL 16, Drizzle ORM
- **Validation**: Zod (with drizzle-zod)
- **Auth**: JWT (jose), bcrypt
- **Testing**: Vitest, Playwright, @testing-library
- **Package Manager**: Bun

## Imports & Path Aliases

- Use `@/` alias for imports from `src/` (e.g., `@/lib/utils`, `@/components/ui`)
- Import order: `"use server"` directives → React/core → external → `@/` → relative

```typescript
"use server"
import { useState } from "react"
import { z } from "zod"
import { db } from "@/db"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

## TypeScript

- **Strict mode enabled** - use explicit return types for exported functions
- Use `type` for type aliases, interfaces for objects
- Avoid `any`; use `unknown` when type is truly unknown

## Naming Conventions

- **Functions/variables**: camelCase
- **Components/Types**: PascalCase
- **Files**: Components `PascalCase.tsx`, Utils `camelCase.ts`, Tests `name.test.ts`

## Server Actions

- Add `"use server"` at top of action files
- Return consistent object shape: `{ success: true, data: ... }` or `{ success: false, error: "..." }`
- Validate input with Zod schemas using `.safeParse()`
- Call `revalidatePath()` after mutations
- Use `redirect()` for navigation after auth failures

```typescript
"use server"
export async function createBook(data: BookInput) {
  const result = bookSchema.safeParse(data)
  if (!result.success) return { success: false, error: result.error.issues[0].message }
  const [book] = await db.insert(books).values(...).returning()
  revalidatePath("/dashboard")
  return { success: true, data: book }
}
```

## Validation (Zod)

- Use `drizzle-zod` for schema generation from Drizzle tables
- Add Chinese error messages for user-facing validation
- Use `.omit()`, `.pick()`, `.partial()` for schema variants

```typescript
export const bookSchema = createInsertSchema(books, {
  title: (s) => s.min(1, "标题不能为空"),
  coverUrl: (s) => s.url().nullable().or(z.literal("")).optional(),
}).omit({ id: true, userId: true, createdAt: true, updatedAt: true })
```

## Error Handling

- Throw errors with descriptive messages: `throw new Error("message")`
- Handle API errors with try/catch and return error state
- Use logging via `@/lib/logger` for observability

## UI Components (shadcn/ui)

- Use `cva` (class-variance-authority) for variant components
- Use `cn` utility (clsx + tailwind-merge) for conditional classes
- Follow existing component patterns in `src/components/ui/`
- Use Radix UI primitives for accessible interactive components

## Database (Drizzle)

- Use Drizzle query builder for type-safe queries
- Use parameterized queries (not string interpolation) to prevent SQL injection
- Always filter by `userId` for multi-user data access

```typescript
const [book] = await db.select().from(books).where(and(eq(books.id, id), eq(books.userId, user.id)))
```

## Testing

- Unit tests: Vitest with @testing-library/react, jsdom environment
- E2E tests: Playwright with baseURL http://localhost:3000
- Test files in `src/test/*.test.ts` (unit), `e2e/*.test.ts` (e2e)
- Setup file: `src/test/setup.ts`

## CSS & Styling

- Use Tailwind CSS v4 utility classes
- Use `cn()` for conditional classes merging
- Follow design tokens from `globals.css` (CSS variables)
- Dark mode via `dark:` variant and `data-theme` attribute

## Environment Variables

- Never commit secrets; use `.env.example` as template
- Required: `DATABASE_URL`, `JWT_SECRET`
- Redis: `REDIS_URL` (optional, defaults to `redis://localhost:6379`)
- Optional: API keys (TMDB, Spotify, RAWG, etc.)

## Logging

- Use `createLogger` from `@/lib/logger`
- Use appropriate levels: `debug`, `info`, `warn`, `error`
- Include structured metadata for traceability

```typescript
const logger = createLogger("api/tmdb")
logger.debug("movie search completed", { query, count: results.length })
```