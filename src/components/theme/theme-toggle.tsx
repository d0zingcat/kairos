"use client"

import type { ComponentType } from "react"
import { Check, Laptop, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useThemeMode, type ThemeMode } from "@/components/theme/theme-provider"
import { useI18n } from "@/components/i18n/i18n-provider"



interface ThemeToggleProps {
  compact?: boolean
}

function CurrentThemeIcon({ mode, resolvedTheme }: { mode: ThemeMode; resolvedTheme: "light" | "dark" }) {
  if (mode === "system") {
    return <Laptop className="h-4 w-4" />
  }

  return resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { mode, resolvedTheme, setMode } = useThemeMode()
  const { t } = useI18n()

  const themeOptions: { mode: ThemeMode; label: string; icon: ComponentType<{ className?: string }> }[] = [
    { mode: "light", label: t("theme.light"), icon: Sun },
    { mode: "dark", label: t("theme.dark"), icon: Moon },
    { mode: "system", label: t("theme.system"), icon: Laptop },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className={compact ? "h-8 w-8 text-muted-foreground hover:text-foreground" : "h-9 gap-2 px-3 text-muted-foreground hover:bg-accent hover:text-foreground"}
          aria-label={t("theme.switch")}
          title={t("theme.switch")}
        >
          <CurrentThemeIcon mode={mode} resolvedTheme={resolvedTheme} />
          {!compact ? <span className="text-xs font-medium uppercase tracking-wider">{mode === "system" ? t("theme.system") : resolvedTheme === "dark" ? t("theme.dark") : t("theme.light")}</span> : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuRadioGroup value={mode} onValueChange={(nextMode) => setMode(nextMode as ThemeMode)}>
          {themeOptions.map(({ mode: optionMode, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={optionMode} value={optionMode}>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {mode === optionMode ? <Check className="ml-auto h-4 w-4" /> : null}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
