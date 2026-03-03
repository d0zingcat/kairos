import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
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

export const metadata: Metadata = {
  title: "Kairos — 记录生命中的每个瞬间",
  description: "个人生活动态记录应用：书、音乐、影视、游戏",
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
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
        <ThemeProvider>
          {children}
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/d0zingcat/kairos"}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-4 right-4 z-50 p-3 bg-background border rounded-full shadow-sm hover:shadow-md transition-all text-muted-foreground hover:text-foreground"
            aria-label="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>
        </ThemeProvider>
      </body>
    </html>
  );
}
