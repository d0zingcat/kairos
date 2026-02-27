type LogLevel = "debug" | "info" | "warn" | "error"

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function resolveLogLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase()
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw
  }
  return process.env.NODE_ENV === "development" ? "debug" : "info"
}

const currentLogLevel = resolveLogLevel()

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel]
}

function formatMeta(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) {
    return ""
  }

  try {
    return ` ${JSON.stringify(meta)}`
  } catch {
    return " [meta_unserializable]"
  }
}

function writeLog(level: LogLevel, scope: string, message: string, meta?: Record<string, unknown>) {
  if (!shouldLog(level)) {
    return
  }

  const line = `[${level.toUpperCase()}][${scope}] ${message}${formatMeta(meta)}`

  if (level === "error") {
    console.error(line)
    return
  }

  if (level === "warn") {
    console.warn(line)
    return
  }

  if (level === "info") {
    console.info(line)
    return
  }

  console.debug(line)
}

export function createLogger(scope: string) {
  return {
    debug: (message: string, meta?: Record<string, unknown>) => {
      writeLog("debug", scope, message, meta)
    },
    info: (message: string, meta?: Record<string, unknown>) => {
      writeLog("info", scope, message, meta)
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      writeLog("warn", scope, message, meta)
    },
    error: (message: string, meta?: Record<string, unknown>) => {
      writeLog("error", scope, message, meta)
    },
  }
}
