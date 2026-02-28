"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

const THEME_STORAGE_KEY = "kairos-theme"

export type ThemeMode = "light" | "dark" | "system"
type ResolvedTheme = Exclude<ThemeMode, "system">

interface ThemeContextValue {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system"
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "dark"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(mode: ThemeMode, resolvedTheme: ResolvedTheme) {
  const root = document.documentElement
  const isDark = resolvedTheme === "dark"

  root.classList.toggle("dark", isDark)
  root.dataset.themeMode = mode
  root.style.colorScheme = resolvedTheme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system"
    }

    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(saved) ? saved : "system"
  })

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme())
  const resolvedTheme = mode === "system" ? systemTheme : mode

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleSystemThemeChange = () => {
      setSystemTheme(getSystemTheme())
    }

    mediaQuery.addEventListener("change", handleSystemThemeChange)
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange)
  }, [])

  useEffect(() => {
    applyTheme(mode, resolvedTheme)
  }, [mode, resolvedTheme])

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode)
    localStorage.setItem(THEME_STORAGE_KEY, nextMode)
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      setMode,
    }),
    [mode, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeMode() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider")
  }

  return context
}
