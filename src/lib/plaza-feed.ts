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