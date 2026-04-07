import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class HomePage extends AbstractPage {
  readonly header: Locator

  readonly errorsContainer: Locator

  readonly filters: {
    from: Locator
    to: Locator
    keywords: Locator
    applyButton: Locator
  }

  readonly remindersTable: Locator

  readonly notificationHeader: Locator

  readonly backButton: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.locator('h1', { hasText: 'Sent reminders' })
    this.errorsContainer = page.getByRole('alert')
    this.filters = {
      from: page.getByTestId('from').locator('input'),
      to: page.getByTestId('to').locator('input'),
      keywords: page.getByTestId('keywords'),
      applyButton: page.getByTestId('apply-filters-button'),
    }
    this.remindersTable = page.getByTestId('reminders-table')
    this.notificationHeader = page.getByTestId('notification-title')
    this.backButton = page.getByTestId('back-button')
  }

  static async verifyOnPage(page: Page): Promise<HomePage> {
    const homePage = new HomePage(page)
    await expect(homePage.header).toBeVisible()
    return homePage
  }
}
