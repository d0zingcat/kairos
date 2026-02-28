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

- `收尾`
- `ship`

## `ship` Safety Constraints (Mandatory)

When executing `ship` / `收尾`, enforce the following to avoid malformed PR descriptions:

1. **Never** pass multi-line PR Markdown via inline `gh pr create --body "..."`.
2. **Always** write PR content to a temp file and use:
	- `gh pr create --body-file <file>` or
	- `gh pr edit --body-file <file>`
3. In PR body text, avoid shell-sensitive inline command composition; keep literal Markdown in the file.
4. After creating/updating PR, **must verify** title/body rendering is correct (headings, bullets, line breaks).
5. If formatting is broken, immediately fix by re-running `gh pr edit --body-file <file>` before finishing.

## Branch Protection Rule

- Never commit directly to `main`.
- All changes must go through a Pull Request workflow.
