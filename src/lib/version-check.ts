import { createLogger } from "@/lib/logger"

const logger = createLogger("version-check")

export const VERSION_ROUTE_REVALIDATE_SECONDS = 3600

const GITHUB_API_BASE_URL = "https://api.github.com"

type Fetcher = typeof fetch

interface GitHubRelease {
  tag_name: string
  html_url: string
  published_at: string
}

interface GitHubTag {
  name: string
}

interface LatestVersionLookup {
  latest: string
  releaseUrl: string | null
  publishedAt: string | null
}

function createGithubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "kairos-app",
  }

  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

function createGithubRequestInit(): RequestInit & { next: { revalidate: number } } {
  return {
    headers: createGithubHeaders(),
    next: { revalidate: VERSION_ROUTE_REVALIDATE_SECONDS },
  }
}

function validateReleaseUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith("https://github.com/")) {
    return null
  }

  return url
}

function buildTagReleaseUrl(repo: string, tagName: string): string {
  return `https://github.com/${repo}/releases/tag/${encodeURIComponent(tagName)}`
}

export function normalizeVersion(value: string): string | null {
  const cleanedValue = value.trim().replace(/^v/i, "").split("-")[0]?.split("+")[0]

  if (!cleanedValue || !/^\d+(\.\d+)*$/.test(cleanedValue)) {
    return null
  }

  return cleanedValue
}

export function compareVersions(a: string, b: string): number {
  const aParts = a.split(".").map((part) => Number(part))
  const bParts = b.split(".").map((part) => Number(part))
  const maxLength = Math.max(aParts.length, bParts.length)

  for (let index = 0; index < maxLength; index += 1) {
    const aNum = aParts[index] || 0
    const bNum = bParts[index] || 0

    if (aNum !== bNum) {
      return aNum - bNum
    }
  }

  return 0
}

export async function fetchLatestGithubVersion(
  repo: string,
  fetcher: Fetcher = fetch
): Promise<LatestVersionLookup> {
  const requestInit = createGithubRequestInit()
  const latestReleaseResponse = await fetcher(
    `${GITHUB_API_BASE_URL}/repos/${repo}/releases/latest`,
    requestInit
  )

  if (latestReleaseResponse.ok) {
    const release = await latestReleaseResponse.json() as GitHubRelease
    const latest = normalizeVersion(release.tag_name)

    if (!latest) {
      throw new Error("GitHub latest release returned an invalid version tag")
    }

    return {
      latest,
      releaseUrl: validateReleaseUrl(release.html_url),
      publishedAt: release.published_at,
    }
  }

  if (latestReleaseResponse.status !== 404) {
    throw new Error(`GitHub latest release API responded with ${latestReleaseResponse.status}`)
  }

  logger.info("latest GitHub release was unavailable; falling back to tags", { repo })

  const tagsResponse = await fetcher(
    `${GITHUB_API_BASE_URL}/repos/${repo}/tags?per_page=1`,
    requestInit
  )

  if (tagsResponse.ok) {
    const tags = await tagsResponse.json() as GitHubTag[]
    const latestTag = tags[0]

    if (!latestTag) {
      throw new Error("GitHub repository has no releases or tags")
    }

    const latest = normalizeVersion(latestTag.name)
    if (!latest) {
      throw new Error("GitHub tags returned an invalid version tag")
    }

    return {
      latest,
      releaseUrl: buildTagReleaseUrl(repo, latestTag.name),
      publishedAt: null,
    }
  }

  if (tagsResponse.status === 404) {
    throw new Error("GitHub repository is inaccessible. Configure GITHUB_TOKEN for private repos.")
  }

  throw new Error(`GitHub tags API responded with ${tagsResponse.status}`)
}
