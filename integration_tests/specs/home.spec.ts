import { expect, test } from '@playwright/test'
import { login, resetStubs } from '../testUtils'
import dateUtils from '../utils/dateUtil'
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

  test('Calendar "From" date must be before "To" date', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await homePage.filters.from.fill(dateUtils.daysAgo(1))
    await homePage.filters.to.fill(dateUtils.daysAgo(2))

    await homePage.filters.applyButton.click()

    await expect(homePage.errorsContainer).toContainText('To: Must be on or after the "From" date')
  })

  test('Calendar "From" and "To" date can not be in the future', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await homePage.filters.from.fill(dateUtils.daysFromNow(20))
    await homePage.filters.to.fill(dateUtils.daysFromNow(20))

    await homePage.filters.applyButton.click()

    await expect(homePage.errorsContainer).toContainText('From: Please select a date in the past')
    await expect(homePage.errorsContainer).toContainText('To: Please select a date in the past')
  })

  test('Calendar "From" can not be more then 7 days apart from "To" date', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await homePage.filters.from.fill(dateUtils.daysAgo(8))
    await homePage.filters.to.fill(dateUtils.today())

    await homePage.filters.applyButton.click()

    await expect(homePage.errorsContainer).toContainText('From: Must be within 7 days of the "To" date')
  })

  test('Calendar "From" date can not be more then 90 days in the past', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await homePage.filters.from.fill(dateUtils.daysAgo(91))
    await homePage.filters.to.fill(dateUtils.daysAgo(91))

    await homePage.filters.applyButton.click()

    await expect(homePage.errorsContainer).toContainText('From: Cannot be more than 90 days in the past')
  })

  test('Home page should have a list of reminders', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.remindersTable.getByTestId('phone-number-1')).toBeVisible()
    await expect(homePage.remindersTable.getByTestId('phone-number-2')).toBeVisible()
  })

  test('Home page should navigate to notification details when clicking on a phone number', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.remindersTable.getByTestId('phone-number-1')).toBeVisible()
    await homePage.remindersTable.getByTestId('phone-number-1').click()

    await expect(page).toHaveURL(/\/notification\/00000000-0000-0000-0000-000000000001/)
  })

  test('Notification details page is loaded when clicking on a phone number', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await expect(homePage.remindersTable.getByTestId('phone-number-1')).toBeVisible()
    await homePage.remindersTable.getByTestId('phone-number-1').click()

    await expect(page).toHaveURL(/\/notification\/00000000-0000-0000-0000-000000000001/)

    await expect(homePage.notificationHeader).toBeVisible()
  })

  test('Navigating back from notification details page to home page should not reset filters state', async ({
    page,
  }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await homePage.filters.from.fill(dateUtils.daysAgo(3))
    await homePage.filters.to.fill(dateUtils.today())
    await homePage.filters.applyButton.click()

    await expect(homePage.remindersTable.getByTestId('phone-number-1')).toBeVisible()
    await homePage.remindersTable.getByTestId('phone-number-1').click()

    await expect(homePage.notificationHeader).toBeVisible()

    await homePage.backButton.click()

    await HomePage.verifyOnPage(page)

    await expect(homePage.filters.from).toHaveValue(dateUtils.daysAgo(3))
    await expect(homePage.filters.to).toHaveValue(dateUtils.today())
  })

  test('Home page should filter keywords correctly', async ({ page }) => {
    await login(page)

    const homePage = await HomePage.verifyOnPage(page)

    await homePage.filters.keywords.fill('Dear test2')
    await homePage.filters.applyButton.click()

    await expect(homePage.remindersTable.getByTestId('phone-number-1')).toContainText('07700 900 111')
  })
})
