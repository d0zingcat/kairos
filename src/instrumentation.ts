import { ensureDatabaseMigrated } from "@/db/auto-migrate"

export async function register() {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") {
    return
  }

  await ensureDatabaseMigrated()
}
