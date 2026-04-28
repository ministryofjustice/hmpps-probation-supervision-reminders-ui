import { expect, test } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import HomePage from '../pages/homePage'
import hmppsAuth from '../mockApis/hmppsAuth'

test.describe('Header', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Header is visible', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.phaseBanner).toBeVisible()
  })

  test('User name visible in header', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.usersName).toHaveText('A. Testuser')
  })

  test('User can sign out', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.signOut()

    await expect(page.getByRole('heading')).toHaveText('Sign in')
  })

  test('User can manage their details', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    await hmppsAuth.stubManageDetailsPage()

    const homePage = await HomePage.verifyOnPage(page)
    await homePage.clickManageUserDetails()

    await expect(page.getByRole('heading')).toHaveText('Your account details')
  })
})
