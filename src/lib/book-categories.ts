const GENERIC_BOOK_CATEGORY_KEYS = new Set([
  "book",
  "books",
  "ebook",
  "ebooks",
  "e-book",
  "e-books",
  "图书",
  "书籍",
  "书",
  "电子书",
])

function normalizeCategoryKey(value: string): string {
  return value.trim().toLowerCase()
}

export function normalizeBookCategories(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  const categories: string[] = []

  for (const value of values) {
    const trimmed = value?.trim()
    if (!trimmed) continue

    const key = normalizeCategoryKey(trimmed)
    if (GENERIC_BOOK_CATEGORY_KEYS.has(key) || seen.has(key)) continue

    seen.add(key)
    categories.push(trimmed)
  }

  return categories
}
