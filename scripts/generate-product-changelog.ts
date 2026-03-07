import { readFile, writeFile } from "fs/promises"
import { join } from "path"

type ProductChangelogTag =
  | "feature"
  | "fix"
  | "improvement"
  | "ux"
  | "performance"
  | "security"
  | "infra"

interface ProductChangelogItem {
  tag: ProductChangelogTag
  text: string
}

interface ProductChangelogEntry {
  version: string
  date: string
  summary: string
  items: ProductChangelogItem[]
}

interface ReleaseSection {
  version: string
  date: string
  markdown: string
}

interface OpenAIResponse {
  choices?: {
    message?: {
      content?: string
    }
  }[]
}

const TAGS: ProductChangelogTag[] = [
  "feature",
  "fix",
  "improvement",
  "ux",
  "performance",
  "security",
  "infra",
]

function assertEntry(value: unknown): ProductChangelogEntry {
  if (!value || typeof value !== "object") {
    throw new Error("entry is not an object")
  }

  const entry = value as Record<string, unknown>
  if (
    typeof entry.version !== "string" ||
    typeof entry.date !== "string" ||
    typeof entry.summary !== "string" ||
    !Array.isArray(entry.items)
  ) {
    throw new Error("entry shape is invalid")
  }

  const items: ProductChangelogItem[] = entry.items.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("item is not an object")
    }

    const record = item as Record<string, unknown>
    if (!TAGS.includes(record.tag as ProductChangelogTag) || typeof record.text !== "string") {
      throw new Error("item shape is invalid")
    }

    return {
      tag: record.tag as ProductChangelogTag,
      text: record.text.trim(),
    }
  })

  return {
    version: entry.version.trim(),
    date: entry.date.trim(),
    summary: entry.summary.trim(),
    items,
  }
}

function normalizeVersion(version: string): string {
  return version.trim().replace(/^v/i, "")
}

function extractLatestReleaseSection(changelog: string): ReleaseSection {
  const lines = changelog.split("\n")
  const releaseHeader = /^(#{1,2})\s+\[?(\d+\.\d+\.\d+)\]?(?:\([^)]+\))?\s+\((\d{4}-\d{2}-\d{2})\)\s*$/

  let startIndex = -1
  let version = ""
  let date = ""

  for (const [index, line] of lines.entries()) {
    const match = line.trim().match(releaseHeader)
    if (!match) {
      continue
    }

    startIndex = index
    version = match[2]
    date = match[3]
    break
  }

  if (startIndex === -1) {
    throw new Error("no released version found in CHANGELOG.md")
  }

  let endIndex = lines.length
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (releaseHeader.test(lines[index].trim())) {
      endIndex = index
      break
    }
  }

  return {
    version,
    date,
    markdown: lines.slice(startIndex, endIndex).join("\n").trim(),
  }
}

async function readExistingEntries(path: string): Promise<ProductChangelogEntry[]> {
  try {
    const content = await readFile(path, "utf-8")
    const parsed = JSON.parse(content) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map(assertEntry)
  } catch {
    return []
  }
}

function formatVersionForLocale(version: string, locale: "zh" | "en", existing: ProductChangelogEntry[]): string {
  const hasVPrefix = existing.some((entry) => entry.version.trim().startsWith("v"))
  if (hasVPrefix || locale === "zh") {
    return `v${normalizeVersion(version)}`
  }

  return normalizeVersion(version)
}

async function generateForLocale(
  apiKey: string,
  model: string,
  release: ReleaseSection,
  locale: "zh" | "en"
): Promise<Pick<ProductChangelogEntry, "summary" | "items">> {
  const prompt = [
    "You are a release-notes editor.",
    "Convert a single semantic-release version section into one user-facing product changelog entry.",
    `Output language: ${locale === "zh" ? "Simplified Chinese" : "English"}.`,
    `This release version is ${release.version}.`,
    `This release date is ${release.date}.`,
    "Only summarize this single release section.",
    "Do not mention, regenerate, or revise any older versions.",
    "Return exactly one entry payload for the latest version only.",
    "The entry requires: summary (one sentence), items (2-5 items when possible).",
    "Each item requires: tag and text.",
    "Allowed tags: feature, fix, improvement, ux, performance, security, infra.",
    "CRITICAL: Hide all technical key terms and engineering jargon (Commit hashes, PR numbers, internal variable names, file paths, specific library updates like 'Update dependency X' or 'Refactor Y').",
    "Translate technical changes into user-perceivable benefits or high-level descriptions. Example: 'Add Redis cache' -> 'Improve data loading speed'.",
    "Preserve factual accuracy; do not invent features.",
    "Do not include version or date fields in the response.",
    "Return strict JSON object with key entry.",
  ].join("\n")

  const body = {
    model,
    messages: [
      {
        role: "system",
        content: "You generate strict JSON only.",
      },
      {
        role: "user",
        content: `${prompt}\n\nLATEST RELEASE SECTION:\n${release.markdown}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "product_changelog",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["entry"],
          properties: {
            entry: {
              type: "object",
              additionalProperties: false,
              required: ["summary", "items"],
              properties: {
                summary: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["tag", "text"],
                    properties: {
                      tag: {
                        type: "string",
                        enum: TAGS,
                      },
                      text: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    temperature: 0.2,
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API failed (${response.status}) for ${locale}: ${errorText}`)
  }

  const data = (await response.json()) as OpenAIResponse
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error(`OpenAI response content is empty for ${locale}`)
  }

  const parsed = JSON.parse(content) as { entry?: unknown }
  if (!parsed.entry || typeof parsed.entry !== "object") {
    throw new Error(`response entry is missing or invalid for ${locale}`)
  }

  const entry = parsed.entry as Record<string, unknown>
  const summary = typeof entry.summary === "string" ? entry.summary.trim() : ""
  if (!summary) {
    throw new Error(`response summary is missing or empty for ${locale}`)
  }

  const items = Array.isArray(entry.items)
    ? entry.items.map((item) => {
        if (!item || typeof item !== "object") {
          throw new Error("item is not an object")
        }

        const record = item as Record<string, unknown>
        if (!TAGS.includes(record.tag as ProductChangelogTag) || typeof record.text !== "string") {
          throw new Error("item shape is invalid")
        }

        return {
          tag: record.tag as ProductChangelogTag,
          text: record.text.trim(),
        }
      })
    : []

  if (items.length === 0) {
    throw new Error(`response items is missing or empty for ${locale}`)
  }

  return {
    summary,
    items,
  }
}

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required")
  }

  const model = process.env.OPENAI_CHANGELOG_MODEL || "gpt-4o-mini"
  const changelogPath = join(process.cwd(), "CHANGELOG.md")
  const changelog = await readFile(changelogPath, "utf-8")
  const latestRelease = extractLatestReleaseSection(changelog)

  const locales: ("zh" | "en")[] = ["zh", "en"]

  for (const locale of locales) {
    const outputPath = join(process.cwd(), `src/data/product-changelog.${locale}.json`)
    const existingEntries = await readExistingEntries(outputPath)
    const latestVersion = normalizeVersion(latestRelease.version)
    const alreadyExists = existingEntries.some(
      (entry) => normalizeVersion(entry.version) === latestVersion
    )

    if (alreadyExists) {
      console.log(`Skipped ${outputPath}: ${latestRelease.version} already exists`)
      continue
    }

    const generated = await generateForLocale(apiKey, model, latestRelease, locale)
    const nextEntries: ProductChangelogEntry[] = [
      {
        version: formatVersionForLocale(latestRelease.version, locale, existingEntries),
        date: latestRelease.date,
        summary: generated.summary,
        items: generated.items,
      },
      ...existingEntries,
    ]

    await writeFile(outputPath, `${JSON.stringify(nextEntries, null, 2)}\n`, "utf-8")
    console.log(`Appended ${latestRelease.version} into ${outputPath}`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "unknown error")
  process.exit(1)
})
