"use client";

import { useI18n } from "@/components/i18n/i18n-provider";
import { Globe2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LocaleSwitcherProps {
  compact?: boolean;
}

const localeLabels: Record<"zh" | "en", string> = {
  zh: "中文",
  en: "English",
};

export function LocaleSwitcher({ compact }: LocaleSwitcherProps) {
  const { locale, setLocale } = useI18n();

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label={locale === "zh" ? "切换语言" : "Switch Language"}
            title={locale === "zh" ? "切换语言" : "Switch Language"}
          >
            <Globe2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() => setLocale("zh")}
            className={locale === "zh" ? "bg-accent" : ""}
          >
            中文
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLocale("en")}
            className={locale === "en" ? "bg-accent" : ""}
          >
            English
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 px-3 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={locale === "zh" ? "切换语言" : "Switch Language"}
          title={locale === "zh" ? "切换语言" : "Switch Language"}
        >
          <Globe2 className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">{localeLabels[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-32">
        <DropdownMenuItem
          onClick={() => setLocale("zh")}
          className={locale === "zh" ? "bg-accent" : ""}
        >
          中文
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className={locale === "en" ? "bg-accent" : ""}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
