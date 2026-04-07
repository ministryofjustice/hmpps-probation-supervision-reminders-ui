import { expect, test } from '@playwright/test'

import dateUtils from './dateUtil'

const formatDate = (date: Date): string => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

const shiftDays = (days: number): Date => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

test.describe('dateUtils', () => {
  test('today returns current dateUtil in d/m/yyyy format', () => {
    expect(dateUtils.today()).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    expect(dateUtils.today()).toBe(formatDate(shiftDays(0)))
  })

  test('daysAgo returns dateUtil shifted into the past', () => {
    expect(dateUtils.daysAgo(90)).toBe(formatDate(shiftDays(-90)))
  })

  test('daysFromNow returns dateUtil shifted into the future', () => {
    expect(dateUtils.daysFromNow(30)).toBe(formatDate(shiftDays(30)))
  })
})
