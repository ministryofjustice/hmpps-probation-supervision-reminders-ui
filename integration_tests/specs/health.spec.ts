import { expect, test } from '@playwright/test'
import hmppsAuth from '../mockApis/hmppsAuth'
import tokenVerification from '../mockApis/tokenVerification'
import probationFrontendComponentsApi from '../mockApis/probationFrontendComponentsApi'
import cookies from '../mockApis/cookies'
import accessibility from '../mockApis/accessibility'
import privacyPolicy from '../mockApis/privacyPolicy'

import { resetStubs } from '../testUtils'

test.describe('Health', () => {
  test.afterEach(async () => {
    await resetStubs()
  })

  test.describe('All healthy', () => {
    test.beforeEach(async () => {
      await Promise.all([
        hmppsAuth.stubPing(),
        tokenVerification.stubPing(),
        probationFrontendComponentsApi.stubPing(),
        cookies.stubPing(),
        accessibility.stubPing(),
        privacyPolicy.stubPing(),
      ])
    })

    test('Health check is accessible and status is UP', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.status).toBe('UP')
    })

    test('Ping is accessible and status is UP', async ({ page }) => {
      const response = await page.request.get('/ping')
      const payload = await response.json()
      expect(payload.status).toBe('UP')
    })

    test('Info is accessible', async ({ page }) => {
      const response = await page.request.get('/info')
      const payload = await response.json()
      expect(payload.build.name).toBe('hmpps-probation-supervision-reminders-ui')
    })
  })

  test.describe('Some unhealthy', () => {
    test.beforeEach(async () => {
      await Promise.all([hmppsAuth.stubPing(), tokenVerification.stubPing(500)])
    })

    test('Health check status is down', async ({ page }) => {
      const response = await page.request.get('/health')
      const payload = await response.json()
      expect(payload.status).toBe('DOWN')
      expect(payload.components.hmppsAuth.status).toBe('UP')
      expect(payload.components.tokenVerification.status).toBe('DOWN')
      expect(payload.components.tokenVerification.details.status).toBe(500)
      expect(payload.components.tokenVerification.details.attempts).toBe(3)
    })
  })
})
