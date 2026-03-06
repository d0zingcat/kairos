import { test, expect } from "@playwright/test"

test.describe("Settings Page - UI Changes", () => {
    test("should not have fixed elements at bottom-right on home", async ({ page }) => {
        await page.goto("/")
        await expect(page.locator("h1")).toBeVisible()
        
        const fixedElements = page.locator('.fixed.bottom-4.right-4')
        expect(await fixedElements.count()).toBe(0)
    })
})
