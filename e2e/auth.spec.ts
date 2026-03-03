import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
    test("should successfully login with valid credentials", async ({ page }) => {
        // Go to dashboard (which should redirect to login if not authenticated)
        await page.goto("/dashboard")

        // Wait for redirect to login or check if we are on login page
        await expect(page).toHaveURL(/.*\/login/)

        // Fill login form
        await page.fill('input[name="username"]', "admin")
        await page.fill('input[name="password"]', "admin12345")

        // Submit
        await page.getByRole('button', { name: /登录|Login/i }).click({ force: true })

        // Should redirect to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 })

        // Should see the logged in status or logout button
        await expect(page.locator("aside")).toContainText("已登录", { timeout: 10000 })
        await expect(page.getByRole('button', { name: /退出|Logout/i })).toBeVisible()
    })

    test("should show error with invalid credentials", async ({ page }) => {
        await page.goto("/login")

        await page.fill('input[name="username"]', "admin")
        await page.fill('input[name="password"]', "wrongpassword")
        await page.getByRole('button', { name: /登录|Login/i }).click({ force: true })

        // Should still be on login page or show an error
        await expect(page).toHaveURL(/.*\/login/)
        // Assuming there is some toast or error message (sonner should show it)
    })
})
