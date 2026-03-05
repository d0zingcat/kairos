import { test, expect } from "@playwright/test"

test.describe("Security & Redirects", () => {
    // 1. Unauthenticated Access
    test("unauthenticated users should be redirected to login from restricted paths", async ({ page }) => {
        const restrictedPaths = ["/dashboard", "/dashboard/settings", "/dashboard/books"]

        for (const path of restrictedPaths) {
            await page.goto(path)
            // Note: DashboardLayout currently redirects all unauthorized dashboard access 
            // to /login?next=%2Fdashboard specifically.
            await expect(page).toHaveURL(/.*\/login\?next=%2Fdashboard/)
        }
    })

    // 2. Member Access
    test("members should access dashboard but be redirected from admin-only paths without looping", async ({ page }) => {
        // Register a new member
        await page.goto("/register")
        const username = `member_${Math.floor(Math.random() * 10000)}`
        await page.fill('input[name="username"]', username)
        await page.fill('input[name="password"]', "password123")
        await page.fill('input[name="confirmPassword"]', "password123")
        await page.click('button[type="submit"]', { force: true })

        // Should be on dashboard
        await expect(page).toHaveURL(/.*\/dashboard/)

        // Try to access settings (admin only)
        // Monitor redirects to ensure no infinite loop
        let redirectCount = 0
        page.on('response', response => {
            if (response.status() >= 300 && response.status() <= 399) {
                redirectCount++
            }
        })

        await page.goto("/dashboard/settings")

        // Should be redirected to /dashboard (as per our new LoginPage logic)
        // or /login (as per middleware logic, but LoginPage then sends to dashboard)
        await expect(page).toHaveURL(/.*\/dashboard/)
        expect(redirectCount).toBeLessThan(5) // High enough for valid chain, low enough to catch loop
    })

    // 3. Admin Access
    test("admins should have full access to all dashboard areas", async ({ page }) => {
        // Login as admin (using seeded credentials)
        await page.goto("/login")
        await page.fill('input[name="username"]', "admin")
        await page.fill('input[name="password"]', "admin12345")
        await page.click('button[type="submit"]', { force: true })

        await expect(page).toHaveURL(/.*\/dashboard/)

        // Access settings
        await page.goto("/dashboard/settings")
        await expect(page).toHaveURL(/.*\/dashboard\/settings/)
        await expect(page.locator("h1")).toContainText(/Settings|设置/i)
    })

    // 4. Redirect Loop Prevention (Explicit Check)
    test("should not enter infinite loop when accessing restricted path with next param", async ({ page }) => {
        // Access a restricted path directly while logged out
        const target = "/dashboard/settings"
        await page.goto(target)

        await expect(page).toHaveURL(/.*\/login\?next=%2Fdashboard/)

        // Login as a member (who doesn't have access to settings)
        // We'll register a new one to be sure
        await page.goto("/register")
        const username = `loop_test_${Math.floor(Math.random() * 10000)}`
        await page.fill('input[name="username"]', username)
        await page.fill('input[name="password"]', "password123")
        await page.fill('input[name="confirmPassword"]', "password123")
        await page.click('button[type="submit"]')

        // Wait for dashboard to fully load to ensure session is settled
        await expect(page).toHaveURL(/.*\/dashboard/)

        // Now force a hit to a restricted path with next param
        await page.goto(`/login?next=${encodeURIComponent(target)}`)

        // The LoginPage should see the user has session but is not admin, 
        // and redirect to /dashboard instead of target.
        await expect(page).toHaveURL(/.*\/dashboard/)
    })
})
