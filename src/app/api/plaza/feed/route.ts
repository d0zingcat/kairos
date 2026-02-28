import { NextRequest, NextResponse } from "next/server"
import { getPublicPlazaFeed } from "@/lib/actions/plaza"

export async function GET(request: NextRequest) {
  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined
  const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? "20")
  const limit = Number.isFinite(rawLimit) ? rawLimit : 20

  const result = await getPublicPlazaFeed({ limit, cursor })

  return NextResponse.json({
    items: result.items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  })
}
