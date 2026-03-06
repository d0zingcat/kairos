import { readFile } from "fs/promises"
import { join } from "path"
import { createLogger } from "@/lib/logger"

const logger = createLogger("product-changelog")

export type ProductChangelogTag =
  | "feature"
  | "fix"
  | "improvement"
  | "ux"
  | "performance"
  | "security"
  | "infra"

export interface ProductChangelogItem {
  tag: ProductChangelogTag
  text: string
}

export interface ProductChangelogEntry {
  version: string
  date: string
  summary: string
  items: ProductChangelogItem[]
}

function isTag(value: unknown): value is ProductChangelogTag {
  return (
    value === "feature" ||
    value === "fix" ||
    value === "improvement" ||
    value === "ux" ||
    value === "performance" ||
    value === "security" ||
    value === "infra"
  )
}

function isEntry(value: unknown): value is ProductChangelogEntry {
  if (!value || typeof value !== "object") {
    return false
  }

  const item = value as Record<string, unknown>
  if (
    typeof item.version !== "string" ||
    typeof item.date !== "string" ||
    typeof item.summary !== "string" ||
    !Array.isArray(item.items)
  ) {
    return false
  }

  return item.items.every((entry) => {
    if (!entry || typeof entry !== "object") {
      return false
    }

    const record = entry as Record<string, unknown>
    return isTag(record.tag) && typeof record.text === "string"
  })
}

export async function getProductChangelogData(locale: string = "zh"): Promise<ProductChangelogEntry[]> {
  try {
    const lang = locale?.toLowerCase().startsWith("en") ? "en" : "zh"
    const fileName = `product-changelog.${lang}.json`
    const filePath = join(process.cwd(), "src/data", fileName)

    logger.debug(`loading product changelog`, { filePath, locale, lang })

    const content = await readFile(filePath, "utf-8")
    const parsed: unknown = JSON.parse(content)

    if (!Array.isArray(parsed)) {
      logger.warn(`product changelog file ${fileName} is not an array`)
      return []
    }

    const validEntries = parsed.filter(isEntry)
    if (validEntries.length !== parsed.length) {
      logger.warn(`product changelog file ${fileName} contains invalid entries`, {
        total: parsed.length,
        valid: validEntries.length,
      })
    }

    return validEntries
  } catch (error) {
    logger.error("failed to read product changelog", {
      error: error instanceof Error ? error.message : "unknown error",
      locale,
    })
    return []
  }
}
