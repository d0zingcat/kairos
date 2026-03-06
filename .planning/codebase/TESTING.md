# Testing Patterns

**Analysis Date:** 2026-03-06

## Test Framework

**Unit/Integration Runner:**
- **Vitest** v4.0.18
- Config: `vitest.config.ts`
- Environment: `jsdom`
- Globals enabled: `describe`, `it`, `expect` available without import

**E2E Runner:**
- **Playwright** v1.58.2
- Config: `playwright.config.ts`
- Browser: Desktop Chrome (extendable)
- Parallel execution enabled

**Assertion Libraries:**
- Vitest's built-in `expect` (Chai-compatible)
- `@testing-library/jest-dom` for DOM assertions
- `@testing-library/react` v16 for React component testing

**Run Commands:**
```bash
bun test                 # Run all unit tests
bun test --watch         # Watch mode
bun test:coverage        # Coverage report (via vitest)
bun test:e2e             # Run all E2E tests
bun test:e2e --ui        # Playwright UI mode
```

## Test File Organization

**Location:**
- Unit tests co-located in `src/test/` directory
- E2E tests in dedicated `e2e/` directory

**Naming:**
- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Test files alongside source: `<feature>.test.ts`

**Structure:**
```
src/
├── lib/
│   ├── search-utils.ts
│   └── api/
│       └── tmdb.ts
├── test/
│   ├── setup.ts
│   ├── search-utils.test.ts
│   └── api-tmdb.test.ts
e2e/
├── auth.spec.ts
├── home-ui.spec.ts
└── security.spec.ts
```

## Test Structure

**Unit Test Suite Organization:**
```typescript
import { describe, it, expect } from "vitest"
import { posterUrl } from "@/lib/api/tmdb"

describe("TMDB API Utils", () => {
  describe("posterUrl", () => {
    it("should format poster URL correctly", () => {
      const path = "/test.jpg"
      const url = posterUrl(path)
      expect(url).toBe("https://image.tmdb.org/t/p/w500/test.jpg")
    })

    it("should use custom size if provided", () => {
      const path = "/test.jpg"
      const url = posterUrl(path, "w200")
      expect(url).toBe("https://image.tmdb.org/t/p/w200/test.jpg")
    })

    it("should return null for empty path", () => {
      expect(posterUrl(null)).toBeNull()
      expect(posterUrl("")).toBeNull()
    })
  })
})
```

**Utility Test Pattern:**
```typescript
import { describe, it, expect } from "vitest"
import { mergeUniqueResults, type SearchResultItem } from "@/lib/search-utils"

describe("Search Utils", () => {
  describe("mergeUniqueResults", () => {
    it("should remove exact duplicates", () => {
      const items: SearchResultItem[] = [
        { externalId: "1", title: "Inception", subtitle: "2010", type: "movie", coverUrl: null, meta: {} },
        { externalId: "1", title: "Inception", subtitle: "2010", type: "movie", coverUrl: null, meta: {} },
      ]
      const merged = mergeUniqueResults(items)
      expect(merged).toHaveLength(1)
    })
  })
})
```

**Setup File (`src/test/setup.ts`):**
```typescript
import { expect, afterEach } from "vitest"
import { cleanup } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})
```

## Mocking

**Current Patterns:**
- Minimal mocking in existing tests (tests focus on pure utility functions)
- For API tests, real API calls are made (requires API keys)

**Recommended Mocking Pattern (for future tests):**
```typescript
import { vi, describe, it, expect, beforeEach } from "vitest"

// Mock external dependencies
vi.mock("@/lib/redis", () => ({
  getCache: vi.fn(),
  setCache: vi.fn(),
}))

// Mock environment variables
const originalEnv = process.env
beforeEach(() => {
  vi.resetModules()
  process.env = { ...originalEnv, TMDB_API_KEY: "test-key" }
})

afterEach(() => {
  process.env = originalEnv
  vi.clearAllMocks()
})
```

**What to Mock:**
- External API calls (TMDB, Spotify, etc.)
- Database operations in unit tests
- Redis cache operations
- Authentication/session functions

**What NOT to Mock:**
- Pure utility functions (test actual behavior)
- Validation schemas (test real validation)
- Type transformations

## Fixtures and Factories

**Test Data Pattern:**
```typescript
// Inline test data for simple cases
const items: SearchResultItem[] = [
  { externalId: "1", title: "Inception", subtitle: "2010", type: "movie", coverUrl: null, meta: {} },
]

// For complex objects, create helper factories
function createTestBook(overrides?: Partial<NewBook>): NewBook {
  return {
    title: "Test Book",
    status: "finished",
    rating: 5,
    ...overrides,
  }
}
```

**Location:**
- Fixtures should be co-located with tests: `src/test/fixtures/`
- Or inline within test files for simple data

## Coverage

**Requirements:**
- No explicit coverage threshold enforced currently
- Target: 80%+ per user's testing.md guidelines

**View Coverage:**
```bash
bun test --coverage
# Coverage report generated in coverage/
```

**Coverage Configuration (to add in vitest.config.ts):**
```typescript
test: {
  coverage: {
    provider: "v8",
    reporter: ["text", "json", "html"],
    threshold: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

## Test Types

**Unit Tests:**
- Located in `src/test/`
- Test pure functions, utilities, validators
- Fast execution, no external dependencies
- Example: `search-utils.test.ts`, `api-tmdb.test.ts`

**Integration Tests:**
- Server actions with mocked database
- API endpoints with test database
- Component rendering with providers

**E2E Tests (Playwright):**
```typescript
import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("should successfully login with valid credentials", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/.*\/login/)

    await page.fill('input[name="username"]', "admin")
    await page.fill('input[name="password"]', "admin12345")
    await page.getByRole('button', { name: /登录 | Login/i }).click({ force: true })

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 })
    await expect(page.locator("aside")).toContainText(/已登录 | Logged In/)
  })
})
```

## Common Patterns

**Async Testing:**
```typescript
it("should fetch data correctly", async () => {
  const result = await asyncFunction()
  expect(result).toEqual(expected)
})
```

**Error Testing:**
```typescript
it("should throw on invalid input", () => {
  expect(() => parseInvalidInput()).toThrow("Expected error message")
})

it("should return error object on validation failure", async () => {
  const result = await action(null, formData)
  expect(result).toEqual({
    success: false,
    error: "Validation error message"
  })
})
```

**Testing with Parameters:**
```typescript
it.each([
  ["input1", "expected1"],
  ["input2", "expected2"],
])("should handle %s correctly", (input, expected) => {
  expect(transform(input)).toBe(expected)
})
```

**Component Testing (React Testing Library):**
```typescript
import { render, screen } from "@testing-library/react"
import { LoginForm } from "@/components/login/login-form"

it("renders login form correctly", () => {
  render(<LoginForm />)
  expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument()
})
```

## E2E Test Patterns

**Page Object Pattern (for larger tests):**
```typescript
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login")
  }

  async login(username: string, password: string) {
    await this.page.fill('input[name="username"]', username)
    await this.page.fill('input[name="password"]', password)
    await this.page.getByRole('button', { name: /login/i }).click()
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible()
  }
}
```

**Test Isolation:**
- Each test starts fresh (no shared state)
- Use random data for unique entities: `member_${Math.floor(Math.random() * 10000)}`
- Clean up created data when possible

---

*Testing analysis: 2026-03-06*
