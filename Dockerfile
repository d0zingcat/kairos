# ── Stage 1: Install dependencies ──────────────────────
FROM oven/bun:1 AS deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN bun run build

# ── Stage 3: Production runner ────────────────────────
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drizzle migrations
COPY --from=builder /app/drizzle ./drizzle

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "server.js"]
