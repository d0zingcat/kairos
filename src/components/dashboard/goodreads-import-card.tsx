"use client"

import { useState } from "react"
import { BookUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ImportSummary = {
  total: number
  inserted: number
  skipped: number
  failed: number
}

export function GoodreadsImportCard() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [isPending, setIsPending] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSummary(null)

    if (!file) {
      setError("请先选择 Goodreads 导出 CSV 文件")
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
        setError(payload.error ?? "导入失败")
        return
      }

      setSummary(payload.summary ?? { total: 0, inserted: 0, skipped: 0, failed: 0 })
    } catch {
      setError("导入失败，请稍后重试")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5">
      <div className="flex items-start gap-3">
        <BookUp className="mt-0.5 h-4 w-4 text-amber-300" />
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Goodreads 导入</h2>
          <p className="mt-1 text-xs text-zinc-500">
            上传 Goodreads 导出的 CSV 文件，系统将追加导入并自动跳过重复书籍。
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
            导入完成：新增 {summary.inserted} 条，跳过 {summary.skipped} 条，源数据 {summary.total} 条。
          </p>
        ) : null}

        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">重复判定：Book Id 优先，缺失时使用 书名+作者。</p>
          <Button
            type="submit"
            disabled={isPending || !file}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                导入中...
              </span>
            ) : "导入 Goodreads"}
          </Button>
        </div>
      </form>
    </div>
  )
}
