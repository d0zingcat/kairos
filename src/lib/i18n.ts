import { cookies } from "next/headers";
import zhMessages from "@/messages/zh.json";
import enMessages from "@/messages/en.json";

type Locale = "zh" | "en";
type Messages = typeof zhMessages;

const LOCALE_STORAGE_KEY = "kairos-locale";

const allMessages: Record<Locale, Messages> = {
    zh: zhMessages,
    en: enMessages,
};

function getNestedValue(obj: unknown, path: string): string | undefined {
    const keys = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = obj;
    for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }
    return typeof current === "string" ? current : undefined;
}

export async function getI18n() {
    const cookieStore = await cookies();
    const locale = (cookieStore.get(LOCALE_STORAGE_KEY)?.value as Locale) || "zh";

    const t = (key: string, params?: Record<string, string | number>): string => {
        const messages = allMessages[locale] || zhMessages;
        let value = getNestedValue(messages, key);

        if (value === undefined) {
            return key;
        }

        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                value = value?.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
            });
        }

        return value;
    };

    return { t, locale };
}
