import httpMocks from 'node-mocks-http'
import baseController from './baseController'
import config from './config'
import { defaultName } from './utils/azureAppInsights'

jest.mock('./config', () => ({
  appInsights: {
    connectionString: 'test-connection-string',
  },
}))

jest.mock('./utils/azureAppInsights', () => ({
  defaultName: jest.fn(),
}))

describe('baseController', () => {
  const next = jest.fn()
  const req = httpMocks.createRequest()
  const res = httpMocks.createResponse()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(defaultName as jest.Mock).mockReturnValue('test-role-name')
  })

  it('should set application insights connection string and role name in res.locals', () => {
    baseController()(req, res, next)

    expect(res.locals.applicationInsightsConnectionString).toBe('test-connection-string')
    expect(res.locals.applicationInsightsRoleName).toBe('test-role-name')
    expect(next).toHaveBeenCalled()
  })

  it('should use connection string from config', () => {
    config.appInsights.connectionString = 'another-connection-string'

    baseController()(req, res, next)

    expect(res.locals.applicationInsightsConnectionString).toBe('another-connection-string')
    expect(next).toHaveBeenCalled()
  })
})
