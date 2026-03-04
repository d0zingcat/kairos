import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { Toaster } from "sonner";
import { Github } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getI18n } from "@/lib/i18n";
import { cookies } from "next/headers";

const themeInitScript = `(() => {
  try {
    const key = "kairos-theme";
    const saved = localStorage.getItem(key);
    const mode = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    const isDark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  } catch {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.dataset.themeMode = "system";
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }
})();`;

export async function generateMetadata() {
  const { t } = await getI18n();
  return {
    title: t("site.title"),
    description: t("site.description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("kairos-locale")?.value || "zh";

  const { t } = await getI18n();

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#000000" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", function() {
                  navigator.serviceWorker.register("/sw.js").then(
                    function(registration) {
                      console.log("ServiceWorker registration successful with scope: ", registration.scope);
                    },
                    function(err) {
                      console.log("ServiceWorker registration failed: ", err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
          <ThemeProvider>
            {children}
            <Toaster position="top-center" richColors />
            <a
              href={process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/d0zingcat/kairos"}
              target="_blank"
              rel="noreferrer"
              className="fixed bottom-4 right-4 z-50 p-3 bg-background border rounded-full shadow-sm hover:shadow-md transition-all text-muted-foreground hover:text-foreground"
              aria-label={t("common.github")}
            >
              <Github className="w-5 h-5" />
            </a>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
