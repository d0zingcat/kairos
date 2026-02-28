import path from "node:path"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { createLogger } from "@/lib/logger"

const logger = createLogger("db/auto-migrate")
const LOCK_NAMESPACE = 40201
const LOCK_KEY = 1

type GlobalMigrationState = typeof globalThis & {
  __kairosAutoMigrationPromise?: Promise<void>
}

function shouldAutoMigrate(): boolean {
  const raw = process.env.DB_AUTO_MIGRATE?.toLowerCase().trim()
  if (!raw) {
    return true
  }

  return !["0", "false", "off", "no"].includes(raw)
}

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for auto migration")
  }

  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client)

  try {
    await client`select pg_advisory_lock(${LOCK_NAMESPACE}, ${LOCK_KEY})`
    const migrationsFolder = path.join(process.cwd(), "drizzle")
    logger.info("running startup migrations", { migrationsFolder })
    await migrate(db, { migrationsFolder })
    logger.info("startup migrations completed")
  } finally {
    try {
      await client`select pg_advisory_unlock(${LOCK_NAMESPACE}, ${LOCK_KEY})`
    } finally {
      await client.end()
    }
  }
}

export function ensureDatabaseMigrated(): Promise<void> {
  if (!shouldAutoMigrate()) {
    logger.info("startup migration disabled", { env: "DB_AUTO_MIGRATE" })
    return Promise.resolve()
  }

  const globalState = globalThis as GlobalMigrationState
  if (!globalState.__kairosAutoMigrationPromise) {
    globalState.__kairosAutoMigrationPromise = runMigrations()
  }

  return globalState.__kairosAutoMigrationPromise
}
