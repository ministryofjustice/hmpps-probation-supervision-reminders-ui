import { expect, test } from '@playwright/test'
import { resetStubs } from '../mockApis/wiremock'
import { login } from '../testUtils'
import HomePage from '../pages/homePage'

test.describe('Footer', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Can navigate to the Cookies page', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.cookies).toBeVisible()

    await homePage.cookies.click()

    expect(page.url()).toBe('http://localhost:9091/cookies')
  })

  test('Can navigate to the Accessibility page', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.accessibility).toBeVisible()

    await homePage.accessibility.click()

    expect(page.url()).toBe('http://localhost:9091/accessibility')
  })

  test('Can navigate to the Privacy page', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.privacy).toBeVisible()

    await homePage.privacy.click()

    expect(page.url()).toBe('http://localhost:9091/privacy-policy')
  })
})
