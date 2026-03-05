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
        await expect(page.locator("aside")).toContainText(/已登录|Logged In/, { timeout: 10000 })
        await expect(page.getByRole('button', { name: /退出|Logout/i })).toBeVisible()
    })

    test("should successfully login with member role and access dashboard", async ({ page }) => {
        // Go to register page to create a member user
        await page.goto("/register")
        const memberUsername = `member_${Math.floor(Math.random() * 10000)}`
        await page.fill('input[name="username"]', memberUsername)
        await page.fill('input[name="password"]', "member12345")
        await page.fill('input[name="confirmPassword"]', "member12345")
        await page.getByRole('button', { name: /注册|Register/i }).click()

        // Should redirect to dashboard
        await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 })

        // Should be able to see dashboard content
        await expect(page.locator("aside")).toContainText(/已登录|Logged In/)

        await page.goto("/dashboard/settings")
        await expect(page).toHaveURL(/.*\/dashboard/)
    })

    test("should show error with invalid credentials", async ({ page }) => {
        await page.goto("/login")

        await page.fill('input[name="username"]', "admin")
        await page.fill('input[name="password"]', "wrongpassword")
        await page.getByRole('button', { name: /登录|Login/i }).click({ force: true })

        // Should still be on login page or show an error
        await expect(page).toHaveURL(/.*\/login/)
    })
})
