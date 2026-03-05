import { test, expect } from "@playwright/test"

test.describe("Home Page UI & Synchronization", () => {
    // Force a specific locale to ensure consistent starting point for tests that expect Chinese
    test.use({ locale: 'zh-CN' })

    test.beforeEach(async ({ page }) => {
        await page.goto("/")
    })

    test("should toggle language and persist after refresh", async ({ page }) => {
        // Initial state (should be Chinese since we forced zh-CN context)
        await expect(page.locator("h1")).toContainText(/Kairos/)
        await expect(page.locator("p").first()).toContainText(/个人生活记录/)

        // Open language switcher and change to English
        const langSwitcher = page.getByRole('button', { name: /切换语言|Switch Language/i })
        await expect(langSwitcher).toBeVisible()
        await langSwitcher.click()

        // Use getByText to be more robust or check for menuitem
        const enOption = page.getByRole('menuitem', { name: "English" })
        await expect(enOption).toBeVisible()
        await enOption.click()

        // Check if text changed
        await expect(page.locator("p").first()).toContainText(/Personal life tracking/)

        // Refresh and check if it's still English
        await page.reload()
        await expect(page.locator("p").first()).toContainText(/Personal life tracking/)

        // Switch back to Chinese
        await page.getByRole('button', { name: /Switch Language/i }).click()
        await page.getByRole('menuitem', { name: "中文" }).click()
        await expect(page.locator("p").first()).toContainText(/个人生活记录/)
    })

    test("should toggle theme and persist after refresh", async ({ page }) => {
        // Change to Dark mode
        const themeToggle = page.getByRole('button', { name: /切换主题|Switch Theme/i })
        await expect(themeToggle).toBeVisible()
        await themeToggle.click()

        // Wait for dropdown content to be visible
        const content = page.locator('[data-slot="dropdown-menu-content"]')
        await expect(content).toBeVisible()

        // Click dark option (correct translation for dark is 暗夜)
        const darkOption = content.locator('div, span, button').filter({ hasText: /^暗夜$|^Dark$/i }).first()
        await expect(darkOption).toBeVisible()
        await darkOption.click()

        // Check if dark class is applied to html
        await expect(page.locator("html")).toHaveClass(/dark/)

        // Refresh and check if it's still dark
        await page.reload()
        // Wait for hydration/sync
        await page.waitForTimeout(500)
        await expect(page.locator("html")).toHaveClass(/dark/)
    })

    test("should synchronize language and theme to Dashboard", async ({ page }) => {
        // Set to English and Dark on Home page
        await page.getByRole('button', { name: /切换语言|Switch Language/i }).click()
        await page.getByRole('menuitem', { name: "English" }).click()

        await page.getByRole('button', { name: /Switch Theme/i }).click()
        const content = page.locator('[data-slot="dropdown-menu-content"]')
        await expect(content).toBeVisible()
        // After switching to English, the text should be "Dark"
        const darkOption = content.locator('div, span, button').filter({ hasText: /^Dark$/i }).first()
        await darkOption.click()

        // Navigate to dashboard
        await page.getByRole('link', { name: /Enter Dashboard|进入仪表盘/i }).click()

        // Should be on login page or dashboard
        await expect(page.locator("html")).toHaveClass(/dark/)

        // Should be in English
        await expect(page.locator("body")).toContainText(/Login|Sign In|Log In|Username/i, { timeout: 10000 })
    })

    test("should not have hydration errors in console", async ({ page }) => {
        const errors: string[] = []
        page.on("console", (msg) => {
            if (msg.type() === "error" && msg.text().includes("Hydration")) {
                errors.push(msg.text())
            }
        })

        await page.goto("/")
        // Wait a bit for potential hydration errors to pop up
        await page.waitForTimeout(2000)

        expect(errors).toHaveLength(0)
    })
})
