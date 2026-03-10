export interface SearchResultItem {
    externalId: string
    title: string
    subtitle: string | null
    coverUrl: string | null
    type: string
    meta: Record<string, unknown>
}

/**
 * Deduplicates search results based on type, title, and subtitle to provide a cleaner UI.
 * Prefers items with cover URLs (typically from Spotify) over those without.
 */
export function mergeUniqueResults(items: SearchResultItem[]): SearchResultItem[] {
    const seen = new Map<string, SearchResultItem>()

    for (const item of items) {
        // We normalize the key to be case-insensitive for better deduplication
        const key = `${item.type}::${item.title.toLowerCase().trim()}::${(item.subtitle ?? "").toLowerCase().trim()}`

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
