# Agent Workflow Instructions

## Default Post-change Workflow (Codex / Claude Code)

After any code change is completed, unless the user explicitly says to skip:

1. Update relevant documentation (`README.md` and/or feature docs).
2. Commit with a clear [Conventional Commits](https://www.conventionalcommits.org/) message:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `chore:` for maintenance tasks
   - `refactor:` for code refactoring
   - `test:` for test-related changes
3. Create a branch with a descriptive name and push to `origin`.
4. Create a GitHub PR with a concise summary and test notes.

> **Note:** Version bumping and CHANGELOG updates are handled automatically by semantic-release when code is merged to `main`. No manual version management needed.

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

### Standard PR Body Template

When writing PR body content, use this default template unless user asks for a different format:

```markdown
## Summary

- <change 1>
- <change 2>
- <change 3>

## Verification

- <command or test 1>
- <command or test 2>

## Notes

- <risk / migration / follow-up notes>
```

Template rules:

- Keep headings exactly as `Summary`, `Verification`, `Notes`.
- Keep bullets concise and action-oriented.
- Prefer plain text in bullets; avoid shell-sensitive inline composition.
- If there are no notes, still keep the `Notes` section and write `- None`.

## Branch Protection Rule (CRITICAL)

**NEVER commit or push directly to `main`.** This rule is absolute.

- Create a new branch for EVERY change (e.g., `feat/feature-name`, `fix/bug-fix`, `chore/task`)
- All changes must go through a Pull Request workflow
- Merge to `main` only via PR (squash merge preferred)
- semantic-release handles versioning automatically on main merge - do NOT bump versions manually
