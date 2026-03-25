import express from 'express'
import { monitoringMiddleware } from '@ministryofjustice/hmpps-monitoring'
import request from 'supertest'
import type { ApplicationInfo } from '../applicationInfo'
import setUpHealthChecks from './setUpHealthChecks'

jest.mock('@ministryofjustice/hmpps-monitoring', () => ({
  monitoringMiddleware: jest.fn(),
  endpointHealthComponent: jest.fn(),
}))

const mockMiddleware = {
  health: jest.fn((_, res) => res.status(200).json({ message: 'test-health' })),
  info: jest.fn((_, res) => res.status(200).json({ message: 'test-info' })),
  ping: jest.fn((_, res) => res.status(200).json({ message: 'test-ping' })),
}

const mockMonitoringMiddleware = jest.mocked(monitoringMiddleware)

const mockApplicationInfo: ApplicationInfo = {
  applicationName: 'test-app',
  buildNumber: '123',
  gitRef: '321',
  gitShortHash: 'test-hash',
  productId: 'testId',
  branchName: 'test-branch',
}

let app: express.Application

describe('setUpHealthChecks', () => {
  beforeEach(() => {
    app = express()
    mockMonitoringMiddleware.mockReturnValue(mockMiddleware as unknown as ReturnType<typeof monitoringMiddleware>)
    app.use(setUpHealthChecks(mockApplicationInfo))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  test.each`
    endpoint            | status   | message
    ${'/health'}        | ${'200'} | ${'test-health'}
    ${'/info'}          | ${'200'} | ${'test-info'}
    ${'/ping'}          | ${'200'} | ${'test-ping'}
    ${'/test-endpoint'} | ${'404'} | ${undefined}
  `('should render $endpoint with status $status', async ({ endpoint, status, message }) => {
    const response = await request(app).get(endpoint)

    if (status === '404') {
      expect(response.body).toEqual({})
    } else {
      expect(response.body).toEqual({ message })
    }

    expect(response.status).toBe(Number(status))
  })
})
