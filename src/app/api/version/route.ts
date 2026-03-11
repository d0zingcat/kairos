import { NextResponse } from "next/server"
import pkg from "@/../package.json"
import {
  compareVersions,
  fetchLatestGithubVersion,
  normalizeVersion,
  VERSION_ROUTE_REVALIDATE_SECONDS,
} from "@/lib/version-check"

export const dynamic = "force-dynamic"

function getGithubRepo(): string | null {
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO
  if (!repo || !/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(repo)) {
    return null
  }

  return repo
}

const PACKAGE_VERSION = normalizeVersion(pkg.version || "") || "0.0.0"

export async function GET() {
  const currentVersion = PACKAGE_VERSION
  const githubRepo = getGithubRepo()

  if (!githubRepo) {
    return NextResponse.json({
      current: currentVersion,
      latest: currentVersion,
      hasUpdate: false,
      releaseUrl: null,
      publishedAt: null,
      status: "unknown",
      error: "GITHUB_REPO not configured",
    })
  }

  try {
    const latestVersionInfo = await fetchLatestGithubVersion(githubRepo)
    const latestVersion = latestVersionInfo.latest
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0

    return NextResponse.json(
      {
        current: currentVersion,
        latest: latestVersion,
        hasUpdate,
        releaseUrl: latestVersionInfo.releaseUrl,
        publishedAt: latestVersionInfo.publishedAt,
        status: hasUpdate ? "update-available" : "up-to-date",
      },
      {
        headers: {
          "Cache-Control": `s-maxage=${VERSION_ROUTE_REVALIDATE_SECONDS}, stale-while-revalidate=${VERSION_ROUTE_REVALIDATE_SECONDS}`,
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        current: currentVersion,
        latest: currentVersion,
        hasUpdate: false,
        releaseUrl: null,
        publishedAt: null,
        status: "unknown",
        error: error instanceof Error ? error.message : "Failed to check for updates",
      },
      {
        headers: {
          "Cache-Control": `s-maxage=${VERSION_ROUTE_REVALIDATE_SECONDS}, stale-while-revalidate=${VERSION_ROUTE_REVALIDATE_SECONDS}`,
        },
      }
    )
  }
}
