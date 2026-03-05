"use client"

import { useState } from "react"
import { BookUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/components/i18n/i18n-provider"

type ImportSummary = {
  total: number
  inserted: number
  skipped: number
  failed: number
}

export function GoodreadsImportCard() {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [isPending, setIsPending] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSummary(null)

    if (!file) {
      setError(t("goodreads.noFile"))
      return
    }

    try {
      setIsPending(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/import/goodreads", {
        method: "POST",
        body: formData,
      })

      const payload = await response.json() as {
        error?: string
        summary?: ImportSummary
      }

      if (!response.ok) {
        setError(payload.error ?? t("goodreads.importFailed"))
        return
      }

      setSummary(payload.summary ?? { total: 0, inserted: 0, skipped: 0, failed: 0 })
    } catch {
      setError(t("goodreads.retryImport"))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card/50 p-5">
      <div className="flex items-start gap-3">
        <BookUp className="mt-0.5 h-4 w-4 text-amber-300" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t("goodreads.title")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("goodreads.description")}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={isPending}
        />

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {summary ? (
          <p className="text-sm text-emerald-400">
            {t("goodreads.summary", {
              inserted: summary.inserted,
              skipped: summary.skipped,
              total: summary.total
            })}
          </p>
        ) : null}

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{t("goodreads.duplicateNote")}</p>
          <Button
            type="submit"
            disabled={isPending || !file}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("goodreads.importing")}
              </span>
            ) : t("goodreads.import")}
          </Button>
        </div>
      </form>
    </div>
  )
}
