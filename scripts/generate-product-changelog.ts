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

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required")
  }

  const model = process.env.OPENAI_CHANGELOG_MODEL || "gpt-4.1-mini"
  const changelogPath = join(process.cwd(), "CHANGELOG.md")
  const outputPath = join(process.cwd(), "src/data/product-changelog.json")
  const changelog = await readFile(changelogPath, "utf-8")

  const prompt = [
    "You are a release-notes editor.",
    "Convert semantic-release style CHANGELOG markdown into user-facing product changelog JSON.",
    "Output language: Simplified Chinese.",
    "Only include released versions (exclude Unreleased).",
    "Keep newest version first.",
    "Each version requires: version (vX.Y.Z), date (YYYY-MM-DD), summary (one sentence), items (2-5 items when possible).",
    "Each item needs: tag and text.",
    "Allowed tags: feature, fix, improvement, ux, performance, security, infra.",
    "Avoid commit hashes, PR numbers, and engineering jargon.",
    "Preserve factual accuracy; do not invent features.",
    "If a version has very technical changes only, map them to infra/improvement in user language.",
    "Return strict JSON object with key entries.",
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
        content: `${prompt}\n\nCHANGELOG:\n${changelog}`,
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
          required: ["entries"],
          properties: {
            entries: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["version", "date", "summary", "items"],
                properties: {
                  version: { type: "string" },
                  date: { type: "string" },
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
    throw new Error(`OpenAI API failed (${response.status}): ${errorText}`)
  }

  const data = (await response.json()) as OpenAIResponse
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("OpenAI response content is empty")
  }

  const parsed = JSON.parse(content) as { entries?: unknown[] }
  if (!Array.isArray(parsed.entries)) {
    throw new Error("response entries is missing or invalid")
  }

  const normalized = parsed.entries.map(assertEntry)
  await writeFile(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf-8")

  console.log(`Generated ${normalized.length} versions into src/data/product-changelog.json`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "unknown error")
  process.exit(1)
})
