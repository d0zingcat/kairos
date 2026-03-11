import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EntryDialog } from "@/components/entry-dialog/entry-dialog"
import type { SearchResultItem } from "@/lib/search-utils"

const { createWatchMock, updateWatchMock, refreshMock, toastErrorMock, fetchMock } = vi.hoisted(() => ({
  createWatchMock: vi.fn(),
  updateWatchMock: vi.fn(),
  refreshMock: vi.fn(),
  toastErrorMock: vi.fn(),
  fetchMock: vi.fn(),
}))

vi.mock("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <div aria-label={alt ?? "image"} />,
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}))

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
  },
}))

vi.mock("@/components/i18n/i18n-provider", () => ({
  useI18n: () => ({
    locale: "en",
    t: (key: string) => {
      const translations: Record<string, string> = {
        "entry.title": "Entry Detail",
        "entry.rating": "Rating",
        "entry.date": "Date",
        "entry.season": "Season",
        "entry.seasonShort": "Season",
        "entry.seasonNone": "No specific season",
        "entry.seasonLoading": "Loading available seasons...",
        "entry.seasonHint": "Season choices are limited to the TMDB seasons for this show.",
        "entry.seasonUnavailable": "Season data is unavailable for this entry.",
        "entry.status": "Status",
        "entry.note": "Note",
        "entry.notePlaceholder": "Write something...",
        "entry.saveFailed": "Save failed",
        "entry.confirmDelete": "Confirm delete",
        "entry.dateFormat": "yyyy-MM-dd",
        "common.cancel": "Cancel",
        "common.save": "Save",
        "watchStatus.want_to_watch": "Want to Watch",
        "watchStatus.watching": "Watching",
        "watchStatus.finished": "Finished",
        "watchStatus.abandoned": "Abandoned",
      }

      return translations[key] ?? key
    },
  }),
}))

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}))

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}))

vi.mock("@/components/ui/tag-input", () => ({
  TagInput: ({ value }: { value: string[] }) => <div>{value.join(",")}</div>,
}))

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, disabled, onValueChange, value }: {
    children: React.ReactNode
    disabled?: boolean
    onValueChange?: (value: string) => void
    value?: string
  }) => (
    <select disabled={disabled} value={value} onChange={(event) => onValueChange?.(event.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: () => null,
}))

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/ui/calendar", () => ({
  Calendar: () => <div>calendar</div>,
}))

vi.mock("@/lib/actions/entries", () => ({
  createBook: vi.fn(),
  updateBook: vi.fn(),
  createMusic: vi.fn(),
  updateMusic: vi.fn(),
  createWatch: createWatchMock,
  updateWatch: updateWatchMock,
  createGame: vi.fn(),
  updateGame: vi.fn(),
  deleteBook: vi.fn(),
  deleteMusic: vi.fn(),
  deleteWatch: vi.fn(),
  deleteGame: vi.fn(),
}))

function buildWatchItem(type: "movie" | "tv"): SearchResultItem {
  return {
    externalId: type === "tv" ? "123" : "456",
    title: type === "tv" ? "Severance" : "Arrival",
    subtitle: null,
    coverUrl: null,
    type,
    meta: {},
  }
}

describe("EntryDialog watch season support", () => {
  beforeEach(() => {
    createWatchMock.mockReset()
    updateWatchMock.mockReset()
    refreshMock.mockReset()
    toastErrorMock.mockReset()
    fetchMock.mockReset()
    createWatchMock.mockResolvedValue({ success: true })
    vi.stubGlobal("fetch", fetchMock)
  })

  it("shows a bounded season selector for tv entries and saves the selected season", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        seasons: [
          { id: 1, name: "Season 1", seasonNumber: 1 },
          { id: 2, name: "Season 2", seasonNumber: 2 },
          { id: 3, name: "Season 3", seasonNumber: 3 },
        ],
      }),
    })

    render(
      <EntryDialog
        open
        onOpenChange={vi.fn()}
        item={buildWatchItem("tv")}
        mediaType="watch"
      />
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/tmdb/tv/123/seasons")
    })

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Season 3" })).toBeInTheDocument()
    })

    expect(screen.queryByRole("spinbutton")).toBeNull()

    const seasonSelect = screen
      .getAllByRole("combobox")
      .find((element) => within(element).queryByRole("option", { name: "No specific season" }))

    expect(seasonSelect).toBeDefined()

    fireEvent.change(seasonSelect!, { target: { value: "3" } })
    fireEvent.click(screen.getByText("Save"))

    await waitFor(() => {
      expect(createWatchMock).toHaveBeenCalledWith(expect.objectContaining({
        type: "tv",
        seasonNumber: 3,
      }))
    })

    expect(toastErrorMock).not.toHaveBeenCalled()
  })

  it("keeps movie saves unchanged and omits the season selector", async () => {
    render(
      <EntryDialog
        open
        onOpenChange={vi.fn()}
        item={buildWatchItem("movie")}
        mediaType="watch"
      />
    )

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByText("Season")).toBeNull()
    fireEvent.click(screen.getByText("Save"))

    await waitFor(() => {
      expect(createWatchMock).toHaveBeenCalledWith(expect.objectContaining({
        type: "movie",
        seasonNumber: null,
      }))
    })
  })

  it("keeps the season selector enabled for tv entries without a TMDB id", async () => {
    let resolveFetch: ((value: { ok: boolean; json: () => Promise<{ seasons: never[] }> }) => void) | null = null

    fetchMock.mockImplementationOnce(() => new Promise((resolve) => {
      resolveFetch = resolve
    }))

    const { rerender } = render(
      <EntryDialog
        open
        onOpenChange={vi.fn()}
        item={buildWatchItem("tv")}
        mediaType="watch"
      />
    )

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/tmdb/tv/123/seasons")
    })

    rerender(
      <EntryDialog
        open
        onOpenChange={vi.fn()}
        item={{
          ...buildWatchItem("tv"),
          externalId: "legacy-tv",
          meta: { seasonNumber: 2 },
        }}
        mediaType="watch"
      />
    )

    const seasonSelect = screen
      .getAllByRole("combobox")
      .find((element) => within(element).queryByRole("option", { name: "No specific season" }))

    expect(seasonSelect).toBeDefined()
    expect(seasonSelect).not.toBeDisabled()
    expect(within(seasonSelect!).getByRole("option", { name: "S2" })).toBeInTheDocument()

    resolveFetch?.({
      ok: true,
      json: async () => ({ seasons: [] }),
    })
  })
})