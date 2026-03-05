import { db } from "./index"
import { users } from "./schema"
import { eq, and } from "drizzle-orm"

async function migrateExistingPublicUsers() {
  try {
    const result = await db
      .update(users)
      .set({ publishToPlaza: true })
      .where(
        and(
          eq(users.isPublicProfile, true),
          eq(users.publishToPlaza, false)
        )
      )

    console.log(`✅ Migration complete: ${result.length} users updated to publishToPlaza=true`)
  } catch (error) {
    console.error("❌ Migration failed:", error)
    throw error
  }
}

if (require.main === module) {
  migrateExistingPublicUsers()
    .then(() => {
      console.log("Migration script finished")
      process.exit(0)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}

export { migrateExistingPublicUsers }
