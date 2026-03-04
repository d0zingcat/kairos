"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

type Locale = "zh" | "en";

type Messages = {
  [key: string]: string | Messages;
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | null>(null);

import zhMessages from "@/messages/zh.json";
import enMessages from "@/messages/en.json";

const allMessages: Record<Locale, Messages> = {
  zh: zhMessages as Messages,
  en: enMessages as Messages,
};

const LOCALE_STORAGE_KEY = "kairos-locale";

function getNestedValue(obj: Messages, path: string): string | undefined {
  const keys = path.split(".");
  let current: Messages | string = obj;
  for (const key of keys) {
    if (typeof current === "object" && current !== null && key in current) {
      current = current[key] as Messages | string;
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

function getInitialLocale(): Locale {
  return "zh"; // Default to Chinese for SSR consistency
}

export function I18nProvider({
  children,
  initialLocale = "zh"
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Sync with localStorage and cookies after mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "en" || stored === "zh") {
      if (stored !== locale) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(stored);
      }
      return;
    }

    // Fall back to browser language
    const browserLang = navigator.language.toLowerCase();
    let initial: Locale = "zh";
    if (browserLang.startsWith("en")) {
      initial = "en";
    }
    setLocaleState(initial);
    document.cookie = `${LOCALE_STORAGE_KEY}=${initial}; path=/; max-age=31536000`;
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    document.cookie = `${LOCALE_STORAGE_KEY}=${newLocale}; path=/; max-age=31536000`;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const messages = allMessages[locale];
      let value = getNestedValue(messages, key);

      if (value === undefined) {
        console.warn(`Missing translation for key: ${key}`);
        return key;
      }

      // Replace parameters like {type} with actual values
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value?.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
        });
      }

      return value;
    },
    [locale]
  );

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    messages: allMessages[locale],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Return a fallback no-op implementation for SSR/error boundaries
    return {
      locale: "zh" as Locale,
      setLocale: () => { },
      t: (key: string) => key,
      messages: {},
    };
  }
  return context;
}

// Hook for components to get translation
export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}