import { NextResponse } from "next/server"
import { db } from "@/db"
import { books, music, watches, games } from "@/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function GET() {
    const user = await getCurrentUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const [userBooks, userMusic, userWatches, userGames] = await Promise.all([
            db.select().from(books).where(eq(books.userId, user.id)),
            db.select().from(music).where(eq(music.userId, user.id)),
            db.select().from(watches).where(eq(watches.userId, user.id)),
            db.select().from(games).where(eq(games.userId, user.id)),
        ])

        const exportData = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            user: {
                username: user.username,
            },
            data: {
                books: userBooks,
                music: userMusic,
                watches: userWatches,
                games: userGames,
            },
        }

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="kairos-export-${new Date().toISOString().split("T")[0]}.json"`,
            },
        })
    } catch (error) {
        console.error("Export error:", error)
        return NextResponse.json({ error: "Export failed" }, { status: 500 })
    }
}
