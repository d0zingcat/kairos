export interface SearchResultItem {
    externalId: string
    title: string
    subtitle: string | null
    coverUrl: string | null
    type: string
    meta: Record<string, unknown>
}

function normalizeKeyPart(value: string | null | undefined): string {
    return (value ?? "").toLowerCase().trim()
}

function getBookIsbn(item: SearchResultItem): string | null {
    if (item.type !== "book") return null

    const isbn = item.meta.isbn
    return typeof isbn === "string" && isbn.trim()
        ? normalizeKeyPart(isbn)
        : null
}

/**
 * Deduplicates search results based on type, title, and subtitle to provide a cleaner UI.
 * Prefers items with cover URLs (typically from Spotify) over those without.
 */
export function mergeUniqueResults(items: SearchResultItem[]): SearchResultItem[] {
    const seen = new Map<string, SearchResultItem>()

    for (const item of items) {
        const bookIsbn = getBookIsbn(item)
        const key = bookIsbn
            ? `${item.type}::isbn::${bookIsbn}`
            : `${item.type}::${normalizeKeyPart(item.title)}::${normalizeKeyPart(item.subtitle)}`

        const existing = seen.get(key)
        if (!existing) {
            seen.set(key, item)
        } else if (!existing.coverUrl && item.coverUrl) {
            // Prefer the item with a cover URL if current one doesn't have one
            seen.set(key, item)
        }
    }

    return Array.from(seen.values())
}
