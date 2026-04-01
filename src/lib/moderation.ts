import { createLogger } from "@/lib/logger"

const logger = createLogger("lib/moderation")

interface ModerationResult {
  flagged: boolean
  categories: Record<string, boolean>
}

interface OpenAIModerationResponse {
  results: Array<{
    flagged: boolean
    categories: Record<string, boolean>
  }>
}

/**
 * Calls the OpenAI Moderation API to check whether the given text contains
 * harmful content.
 *
 * Fallback policy: if OPENAI_API_KEY is not set, the API call fails, or the
 * response is malformed, the function returns { flagged: false } so that
 * content is allowed through rather than blocking the user.
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    logger.warn("OPENAI_API_KEY is not set, skipping moderation")
    return { flagged: false, categories: {} }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: text }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      logger.warn("moderation API returned non-ok status, allowing content", {
        status: response.status,
      })
      return { flagged: false, categories: {} }
    }

    const data = (await response.json()) as OpenAIModerationResponse
    const result = data.results?.[0]

    if (!result) {
      logger.warn("moderation API returned unexpected shape, allowing content")
      return { flagged: false, categories: {} }
    }

    logger.debug("moderation result", { flagged: result.flagged })
    return { flagged: result.flagged, categories: result.categories }
  } catch (error) {
    logger.error("moderation API call failed, allowing content", { error })
    return { flagged: false, categories: {} }
  }
}
