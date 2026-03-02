# Agent Workflow Instructions

**IMPORTANT:** This file references the main `AGENTS.md` in the repository root. Always follow the workflow defined there.

## Quick Reference

After any code change is completed, unless the user explicitly says to skip:

1. Update relevant documentation (`README.md` and/or feature docs)
2. Commit with a clear [Conventional Commits](https://www.conventionalcommits.org/) message:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `chore:` for maintenance tasks
   - `refactor:` for code refactoring
   - `test:` for test-related changes
3. Create a branch with a descriptive name and push to `origin`
4. Create a GitHub PR with a concise summary and test notes

> **Note:** Version bumping and CHANGELOG updates are handled automatically by semantic-release when code is merged to `main`. No manual version management needed.

## Shortcut Trigger

If the user says any of the following, run the full workflow immediately:

- `收尾`
- `ship`

## Critical Rules

1. **Never commit directly to `main`** - All changes must go through a Pull Request workflow
2. **Use `--body-file` for PR creation** - Never pass multi-line Markdown via inline `gh pr create --body "..."`
3. **Verify PR rendering** - After creating/updating PR, verify title/body rendering is correct

## Full Workflow

For the complete workflow instructions, safety constraints, and PR body template, see:

**[AGENTS.md](../AGENTS.md)** in the repository root.
