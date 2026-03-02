import { NextResponse } from "next/server"
import pkg from "@/../package.json"

const CACHE_DURATION_SECONDS = 3600 // 1 hour

// Validate environment variables at runtime (not build time)
const getGithubRepo = () => {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO
  if (!repo || !/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(repo)) {
    return null
  }
  return repo
}

// Use version from package.json
const PACKAGE_VERSION = pkg.version || "0.0.0"

// GitHub release response schema
interface GitHubRelease {
  tag_name: string
  html_url: string
  published_at: string
}

export async function GET() {
  const currentVersion = PACKAGE_VERSION
  const githubRepo = getGithubRepo()

  // If no valid repo configured, return current version info
  if (!githubRepo) {
    return NextResponse.json({
      current: currentVersion,
      latest: currentVersion,
      hasUpdate: false,
      releaseUrl: null,
      publishedAt: null,
      error: "GITHUB_REPO not configured",
    })
  }

  try {
    // Fetch latest release from GitHub
    const response = await fetch(
      `https://api.github.com/repos/${githubRepo}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // GitHub API requires User-Agent
          "User-Agent": "kairos-app",
        },
        // Cache for 1 hour
        next: { revalidate: CACHE_DURATION_SECONDS },
      }
    )

    // 404 means no releases yet - not an error, just return current version
    if (response.status === 404) {
      return NextResponse.json({
        current: currentVersion,
        latest: currentVersion,
        hasUpdate: false,
        releaseUrl: null,
        publishedAt: null,
      })
    }

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`)
    }

    const data = await response.json() as GitHubRelease

    // Validate and sanitize version tag
    const rawVersion = data.tag_name || ""
    const latestVersion = rawVersion.replace(/^v/, "") || currentVersion

    // Validate release URL (must be HTTPS)
    const releaseUrl = data.html_url
    const validatedUrl = releaseUrl && releaseUrl.startsWith("https://github.com/")
      ? releaseUrl
      : null

    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0

    return NextResponse.json({
      current: currentVersion,
      latest: latestVersion,
      hasUpdate,
      releaseUrl: validatedUrl,
      publishedAt: data.published_at,
    })
  } catch (error) {
    // Return current version info on error
    return NextResponse.json({
      current: currentVersion,
      latest: currentVersion,
      hasUpdate: false,
      releaseUrl: null,
      publishedAt: null,
      error: error instanceof Error ? error.message : "Failed to check for updates",
    })
  }
}

/**
 * Compare two semantic versions
 * @returns positive if a > b, negative if a < b, 0 if equal
 */
function compareVersions(a: string, b: string): number {
  const aParts = a.split(".").map(Number)
  const bParts = b.split(".").map(Number)
  const maxLength = Math.max(aParts.length, bParts.length)

  for (let i = 0; i < maxLength; i++) {
    const aNum = aParts[i] || 0
    const bNum = bParts[i] || 0
    if (aNum !== bNum) {
      return aNum - bNum
    }
  }

  return 0
}
