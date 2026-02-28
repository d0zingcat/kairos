import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { db } from "@/db"
import { getCurrentUser } from "@/lib/auth"
import { importGoodreadsCsv } from "@/db/goodreads-importer"

const MAX_CSV_SIZE_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传 CSV 文件" }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ error: "仅支持 .csv 文件" }, { status: 400 })
    }

    if (file.size > MAX_CSV_SIZE_BYTES) {
      return NextResponse.json({ error: "文件过大，请保持在 5MB 以内" }, { status: 413 })
    }

    const csvContent = await file.text()
    const summary = await importGoodreadsCsv(db, csvContent, { userId: currentUser.id })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/books")
    revalidatePath("/dashboard/settings")

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error("Goodreads import failed", error)
    return NextResponse.json({ error: "导入失败，请检查 CSV 格式后重试" }, { status: 500 })
  }
}
