# Agent Workflow Instructions

## Default Post-change Workflow (Codex / Claude Code)

After any code change is completed, unless the user explicitly says to skip:

1. Update relevant documentation (`README.md` and/or feature docs).
2. Update `CHANGELOG.md` under `## [Unreleased]`.
3. Bump version in `package.json` using SemVer (`patch` by default).
4. Commit with a clear conventional commit message.
5. Push the current branch to `origin`.
6. Create or update the GitHub PR with a concise summary and test notes.

## Shortcut Trigger

If the user says any of the following, run the full workflow above immediately:

- `执行收尾流程`
- `/ship`

## Branch Protection Rule

- Never commit directly to `main`.
- All changes must go through a Pull Request workflow.
