import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { readFile } from "node:fs/promises"
import { importGoodreadsCsv } from "./goodreads-importer"

async function main() {
  const csvPath = process.argv[2]
  const userId = process.argv[3]
  const shouldClear = process.argv.includes("--clear")

  if (!csvPath || !userId) {
    console.error("用法: bun run db:import:goodreads -- <csv文件路径> <userId> [--clear]")
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("缺少环境变量 DATABASE_URL")
    process.exit(1)
  }

  const client = postgres(connectionString)
  const db = drizzle(client)

  try {
    const raw = await readFile(csvPath, "utf-8")
    const summary = await importGoodreadsCsv(db, raw, { userId, clear: shouldClear })
    console.log(`导入完成: 新增 ${summary.inserted} 条，跳过 ${summary.skipped} 条，源数据 ${summary.total} 条`)
  } finally {
    await client.end({ timeout: 5 })
  }
}

main().catch((error) => {
  console.error("Goodreads 导入失败:", error)
  process.exit(1)
})
