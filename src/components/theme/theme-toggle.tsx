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

const themeOptions: { mode: ThemeMode; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { mode: "light", label: "白天", icon: Sun },
  { mode: "dark", label: "暗夜", icon: Moon },
  { mode: "system", label: "自动", icon: Laptop },
]

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className={compact ? "text-muted-foreground" : "gap-2 text-muted-foreground hover:text-foreground"}
          aria-label="切换主题"
          title="切换主题"
        >
          <CurrentThemeIcon mode={mode} resolvedTheme={resolvedTheme} />
          {!compact ? <span>{mode === "system" ? "自动" : resolvedTheme === "dark" ? "暗夜" : "白天"}</span> : null}
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
