export async function register() {
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== "nodejs") {
    return
  }

  const { ensureDatabaseMigrated } = await import("@/db/auto-migrate")
  await ensureDatabaseMigrated()
}
