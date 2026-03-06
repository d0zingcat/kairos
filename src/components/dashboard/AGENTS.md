# src/components/dashboard — Dashboard UI Components

**Location**: `src/components/dashboard/`  
**Purpose**: Dashboard page components (media grids, filters, stats, settings)

## STRUCTURE

```
dashboard/
├── books-grid.tsx          # Book cards grid with bulk actions
├── dashboard-header.tsx    # Page headers with actions
├── filter-bar.tsx          # Filter/sort controls
├── games-grid.tsx          # Game cards grid
├── media-card.tsx          # Base card component (books/music/watch/games)
├── music-grid.tsx          # Music cards grid
├── nav.tsx                 # Dashboard navigation sidebar
├── plaza-client.tsx        # Dashboard plaza view (not public plaza)
├── profile-visibility-form.tsx  # Privacy settings form
├── selection-toolbar.tsx   # Bulk selection toolbar
├── stats-cards.tsx         # Statistics summary cards
├── watches-grid.tsx        # Movie/TV cards grid
└── goodreads-import-card.tsx  # Goodreads CSV import UI
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add media type grid | `*-grid.tsx` | Pattern: books-grid, music-grid, games-grid, watches-grid |
| Card component | `media-card.tsx` | Base card with click-to-edit, delete action |
| Filter logic | `filter-bar.tsx` | Status, rating, date filters |
| Bulk actions | `selection-toolbar.tsx` | Multi-select delete, favorite toggle |
| Navigation | `nav.tsx` | Dashboard sidebar nav (books/music/games/watches/settings) |
| Settings forms | `profile-visibility-form.tsx` | Account privacy settings |
| Import UI | `goodreads-import-card.tsx` | CSV upload, progress tracking |

## CONVENTIONS

**Grid Pattern**:
```typescript
export function BooksGrid({ userId }: { userId: string }) {
  const [books, setBooks] = useState<Book[]>([])
  
  // Fetch books (server action or API)
  // Handle bulk selection
  // Handle delete (optimistic update)
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map(book => (
        <MediaCard key={book.id} data={book} type="book" onSelect={handleSelect} />
      ))}
    </div>
  )
}
```

**Card Pattern** (`media-card.tsx`):
- Click card → opens edit dialog (`EntryDialog`)
- Long press / checkbox → bulk selection mode
- Delete icon → optimistic update with toast
- Shows: cover image, title, authors/artists, rating, status badge

**Bulk Actions**:
- `selection-toolbar.tsx` appears when items selected
- Actions: delete (bulk), toggle favorite, change status
- Optimistic updates with rollback on error

**Error Handling**:
- All mutations use try/catch with toast notifications
- Console.error used (violates logging rule — TODO: fix to use logger)
- `logger.error("Bulk delete failed:", error)` preferred

## ANTI-PATTERNS

- ❌ `console.error()` in grid components — Use `@/lib/logger` instead (5 violations)
- ❌ Direct API calls — Use server actions from `@/lib/actions`
- ❌ Missing loading states — Show skeletons during fetch
- ❌ Hard-coded media types — Use enum from `@/db/schema`
- ❌ Inline delete handlers — Extract to server actions

## UNIQUE STYLES

- **Card grids**: Responsive grid (1 col mobile, 2 tablet, 3 desktop)
- **Click-to-edit**: Cards are buttons, open `EntryDialog` on click
- **Selection mode**: Checkbox appears on hover / long press
- **Status badges**: Color-coded (want_to_read=gray, reading=blue, finished=green, abandoned=red)
- **Rating display**: Stars (★) or numeric (1-10) based on media type

## TESTING

- E2E tests: `e2e/home-ui.spec.ts` tests dashboard interactions
- Test hydration errors via Playwright console tracking
- No unit tests currently (consider adding for card rendering logic)

## NOTES

- **15 components total** — All dashboard-specific (not reused elsewhere)
- **EntryDialog** — Shared component in `@/components/entry-dialog/` for all media types
- **Cmd+K** — Command palette (`@/components/command-palette/`) can also create/edit entries
- **Privacy settings** — Forms update `users.isPublicProfile` and `users.publishToPlaza`
- **Goodreads import** — Handled by `@/db/import-goodreads.ts` script, UI just triggers it
- **Stats cards** — Shows counts by status (want_to_read, reading, finished, etc.)
- **Infinite scroll** — Plaza feed uses infinite scroll (dashboard-plaza-client.tsx)
