export type PlazaBookStatus = "want_to_read" | "reading" | "finished" | "abandoned"
export type PlazaWatchStatus = "want_to_watch" | "watching" | "finished" | "abandoned"
export type PlazaGameStatus = "backlog" | "playing" | "completed" | "abandoned" | "platinum"
export type PlazaMediaStatus = PlazaBookStatus | PlazaWatchStatus | PlazaGameStatus

export type PlazaMediaActionInput = {
  mediaType: "book" | "music" | "watch" | "game"
  status?: PlazaMediaStatus
}

export function formatPlazaMediaActionKey(item: PlazaMediaActionInput): string {
  if (item.mediaType === "book" && item.status) {
    return `bookStatus.${item.status}`
  }

  if (item.mediaType === "watch" && item.status) {
    return `watchStatus.${item.status}`
  }

  if (item.mediaType === "game" && item.status) {
    return `gameStatus.${item.status}`
  }

  switch (item.mediaType) {
    case "book":
      return "feed.read"
    case "music":
      return "feed.listened"
    case "watch":
      return "feed.watched"
    case "game":
      return "feed.played"
  }
}

export function formatPlazaWatchSeasonLabel(
  locale: "zh" | "en",
  watchType?: "movie" | "tv",
  seasonNumber?: number | null,
): string | null {
  if (watchType !== "tv" || typeof seasonNumber !== "number" || seasonNumber < 1) {
    return null
  }

  return locale === "zh"
    ? `第 ${seasonNumber} 季`
    : `Season ${seasonNumber}`
}
