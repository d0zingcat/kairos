# Coding Conventions

**Analysis Date:** 2026-03-06

## Naming Patterns

**Files:**
- kebab-case for component files: `login-form.tsx`, `locale-switcher.tsx`
- kebab-case for utility files: `search-utils.ts`, `i18n.ts`
- Single-word names for core modules: `auth.ts`, `logger.ts`, `redis.ts`
- Schema files use singular: `schema.ts`, `entry.ts`

**Functions:**
- camelCase for all functions: `createUserSession`, `verifyAdminSession`, `getBooks`
- Server actions suffixed with `Action`: `loginAction`, `registerAction`, `logoutAction`
- Async functions prefixed with verb: `createX`, `getX`, `updateX`, `deleteX`

**Variables:**
- camelCase for variables and parameters
- PascalCase for types and interfaces: `SessionPayload`, `SearchResultItem`, `MediaTypeConfig`
- UPPER_SNAKE_CASE for constants: `TMDB_BASE`, `JWT_SECRET`, `COOKIE_MAX_AGE`

**Types:**
- Interface names describe the shape: `TMDBSearchResult`, `BookInput`
- Type aliases for unions: `MediaType = "book" | "music" | "watch" | "game"`

## Code Style

**Formatting:**
- eslint-config-next with TypeScript plugin
- Prettier via shadcn tooling (no dedicated config found - relies on Next.js defaults)
- 2-space indentation (inferred from codebase)
- Semicolons used consistently
- Single quotes for strings in most files, double quotes in newer/i18n files

**Linting:**
- ESLint 9 with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Custom ignores for `.next/`, `out/`, `build/`, `next-env.d.ts`
- Strict TypeScript enabled in `tsconfig.json`

## Import Organization

**Order:**
1. React and core libraries: `import { ... } from "react"`
2. Next.js modules: `import { redirect } from "next/navigation"`
3. Third-party libraries: `import { z } from "zod"`, `import { eq } from "drizzle-orm"`
4. Internal modules with path alias: `import { db } from "@/db"`, `import { cn } from "@/lib/utils"`
5. Relative imports for components: `import { Button } from "@/components/ui/button"`
6. Type imports: `import type { NewBook } from "@/db/schema"`

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json` and `vitest.config.ts`)

## Error Handling

**Server Actions Pattern:**
```typescript
export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  // Input validation
  if (!username || !password) {
    return { error: "请输入用户名和密码" }
  }

  // Database operations wrapped in try-catch
  try {
    user = await db.query.users.findFirst({ ... })
  } catch {
    return { error: "登录失败：数据库初始化中或连接异常，请稍后重试" }
  }

  // Business logic validation
  if (!user || !user.isActive) {
    return { error: "用户名或密码错误" }
  }
}
```

**API Functions:**
```typescript
function getApiKey(): string {
  const key = process.env.TMDB_API_KEY
  if (!key) throw new Error("TMDB_API_KEY not configured")
  return key
}

// Non-200 response handling
if (!res.ok) {
  logger.warn("tv search returned non-200", { query, status: res.status })
  throw new Error(`TMDB TV search failed: ${res.status}`)
}
```

**Error Boundaries:**
- Global error boundary in `src/app/error.tsx`
- Uses `useEffect` to log errors: `console.error("Global Error Boundary:", error)`
- Provides user-friendly error messages with retry functionality

## Logging

**Framework:** Custom logger in `src/lib/logger.ts`

**Patterns:**
- Create scoped logger: `const logger = createLogger("api/tmdb")`
- Log levels: `debug`, `info`, `warn`, `error`
- Environment-based filtering via `LOG_LEVEL` env var
- API debug logging with `logger.debugApi()`:

```typescript
logger.debugApi("request", url, undefined, traceMeta)
// Output: [DEBUG][api/tmdb] API → https://api.themoviedb.org/3/...

logger.debugApi("response", url, data, traceMeta)
// Output: [DEBUG][api/tmdb] API ← https://api.themoviedb.org/3/... Response: {...}
```

**Console Usage:**
- `console.error` for errors
- `console.warn` for warnings
- `console.info`, `console.debug` via logger abstraction
- `console.log` should be avoided (per user coding-style.md)

## Comments

**When to Comment:**
- Section dividers with box-drawing characters: `// ── Books ────────────────────────────────────────────────`
- JSDoc-style for exported functions when needed
- Inline comments for non-obvious logic

**TSDoc:**
- Not consistently used across codebase
- Type information primarily conveyed through TypeScript types

## Function Design

**Size:**
- Server actions typically 30-60 lines
- CRUD operations are concise and focused
- Complex functions like `getActivityData` (~130 lines) use helper functions internally

**Parameters:**
- Options pattern for functions with multiple optional params:
```typescript
export async function getBooks(options?: {
  status?: string
  search?: string
  sort?: string
  limit?: number
  offset?: number
})
```

**Return Values:**
- Server actions return `{ success: boolean, data?: T, error?: string }` pattern
- API functions throw on errors, return data on success
- Null returns for "not found" cases: `posterUrl()` returns `string | null`

## Module Design

**Exports:**
- Named exports preferred: `export function`, `export const`
- Default exports for React components and pages
- Re-exports from barrel files: `export { Button, buttonVariants }`

**Barrel Files:**
- `src/db/index.ts` exports database and schema
- `src/lib/actions/` exports all server actions

**Server/Client Boundary:**
- `"use server"` directive for server actions
- `"use client"` directive for interactive components
- Clear separation between server and client code

## Component Patterns

**UI Components:**
```typescript
// class-variance-authority for variants
const buttonVariants = cva("base-styles", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
})

function Button({ variant, size, asChild, ...props }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp className={cn(buttonVariants({ variant, size }))} {...props} />
}
```

**Client Components with Hooks:**
```typescript
"use client"

export function LoginForm({ next }: LoginFormProps) {
  const { t } = useI18n()
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return <form action={formAction}>...</form>
}
```

**I18n Pattern:**
```typescript
import { useI18n } from "@/components/i18n/i18n-provider"

const { t } = useI18n()
const label = t("login.title")
const withParam = t("greeting", { name: "World" })
```

## Database Patterns

**Drizzle ORM Schema:**
```typescript
export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  ...timestamps,
}, (table) => ({
  userIdx: index("books_user_idx").on(table.userId),
}))
```

**CRUD Operations:**
```typescript
// Create
const [book] = await db.insert(books).values({ ...data }).returning()

// Read
const books = await db.query.books.findMany({
  where: eq(books.userId, user.id),
  orderBy: [desc(books.createdAt)],
  limit: 50,
})

// Update
const [book] = await db.update(books)
  .set(data)
  .where(and(eq(books.id, id), eq(books.userId, user.id)))
  .returning()

// Delete
await db.delete(books).where(and(eq(books.id, id), eq(books.userId, user.id)))
```

**Validation with drizzle-zod:**
```typescript
export const bookSchema = createInsertSchema(books, {
  title: (s) => s.min(1, "标题不能为空"),
  coverUrl: (s) => s.url().nullable().or(z.literal("")).optional(),
}).omit({ id: true, userId: true, createdAt: true, updatedAt: true })

// Usage
const result = bookSchema.safeParse(data)
if (!result.success) {
  return { success: false, error: result.error.issues[0].message }
}
```

---

*Convention analysis: 2026-03-06*
