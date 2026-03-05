# Auto Release on Main Merge

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate versioning and releases when code is merged to `main`.

## How It Works

1. **Trigger**: When code is pushed to the `main` branch, the GitHub Actions workflow (`.github/workflows/release.yml`) runs
2. **Version Bump**: semantic-release analyzes commit messages and determines the next version based on [Conventional Commits](https://www.conventionalcommits.org/)
3. **Changelog**: Automatically updates `CHANGELOG.md` with release notes
4. **Git Tag**: Creates a Git tag (e.g., `v0.3.14`)
5. **GitHub Release**: Creates a GitHub Release with the generated notes

## Optional: Product Changelog Generation

If you want user-facing release notes (instead of raw semantic-release notes), generate:

```bash
OPENAI_API_KEY=your_key bun run changelog:generate:product
```

This command reads `CHANGELOG.md` and writes curated entries to `src/data/product-changelog.json`.
You can optionally set `OPENAI_CHANGELOG_MODEL` (default `gpt-4.1-mini`).

## Version Rules

| Commit Prefix | Version Bump | Example |
|---------------|--------------|---------|
| `fix:` | patch (0.3.13 → 0.3.14) | `fix: 修复登录问题` |
| `feat:` | minor (0.3.13 → 0.4.0) | `feat: 添加阅读记录功能` |
| `BREAKING CHANGE` | major (0.3.13 → 1.0.0) | Breaking API changes |

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional BREAKING CHANGE footer]
```

### Types

- `feat`: New feature (triggers minor version bump)
- `fix`: Bug fix (triggers patch version bump)
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `test`: Adding tests
- `perf`: Performance improvements

### Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the commit footer:

```
feat: remove deprecated API endpoint

BREAKING CHANGE: /api/v1/endpoint is no longer available
```

## Important Rules

**NEVER commit directly to `main`:**
- All changes must go through a Pull Request workflow
- Create a branch for every change (e.g., `feat/feature-name`, `fix/bug-fix`)
- Merge to `main` only via PR
- semantic-release automatically handles versioning on merge

## Configuration Files

- `.releaserc.json` - semantic-release configuration
- `.github/workflows/release.yml` - GitHub Actions workflow
- `package.json` - contains `release` script

## Manual Release

To trigger a release manually (for testing):

```bash
# Run locally (requires GITHUB_TOKEN)
GITHUB_TOKEN=your_token bun run release
```

## Troubleshooting

### Release Not Triggered

1. Check that commit messages follow Conventional Commits format
2. Verify the workflow ran in GitHub Actions
3. Check if there are any unreleased changes since last tag

### Version Skipped

If multiple merges happen quickly, concurrency control may skip releases. Check GitHub Actions for concurrent run limits.

## Secrets Required

The workflow uses `GITHUB_TOKEN` which is automatically provided by GitHub Actions. No additional configuration needed.
