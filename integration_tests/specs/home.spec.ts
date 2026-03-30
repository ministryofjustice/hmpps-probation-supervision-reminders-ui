import { expect, test } from '@playwright/test'

import { login, resetStubs } from '../testUtils'
import HomePage from '../pages/homePage'

test.use({ video: 'on' })
test.describe('Home', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test('Home page is loaded', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.header).toContainText('Sent reminders')
  })
})
