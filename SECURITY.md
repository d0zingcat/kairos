# Security Policy

## Supported Versions

Security fixes are provided for the latest release on the `main` branch.

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report security issues privately via [GitHub Security Advisories](https://github.com/d0zingcat/kairos/security/advisories/new) or by opening a private security advisory on the repository.

Include:

- A description of the issue and potential impact
- Steps to reproduce
- Affected version or commit SHA

We aim to acknowledge reports within a few business days.

## Deployment Reminders

When self-hosting Kairos:

- Set a strong, unique `JWT_SECRET` (at least 32 random characters). Do not rely on the built-in development fallback.
- Change default database credentials before exposing the instance to the internet.
- Do not run `bun run db:seed` in production; it creates a demo account with a known password.
- Keep third-party API keys in environment variables only; never commit `.env` files.
- Review `SITE_VISIBILITY` and user registration settings for your threat model.
