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
 */
export function mergeUniqueResults(items: SearchResultItem[]): SearchResultItem[] {
    const seen = new Set<string>()
    return items.filter((item) => {
        // We normalize the key to be case-insensitive for better deduplication
        const key = `${item.type}::${item.title.toLowerCase()}::${(item.subtitle ?? "").toLowerCase()}`
        if (seen.has(key)) {
            return false
        }
        seen.add(key)
        return true
    })
}
