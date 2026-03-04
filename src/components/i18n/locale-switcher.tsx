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

export function LocaleSwitcher({ compact }: LocaleSwitcherProps) {
  const { locale, setLocale } = useI18n();

  const localeLabels: Record<"zh" | "en", string> = {
    zh: "中文",
    en: "English",
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
          variant="outline"
          className="gap-2 border-border bg-muted/40 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Globe2 className="h-4 w-4" />
          <span>{localeLabels[locale]}</span>
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
