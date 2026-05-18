import { type RequestHandler, Router } from 'express'
import helmet, { type HelmetOptions } from 'helmet'
import httpMocks from 'node-mocks-http'
import setUpWebSecurity from './setUpWebSecurity'
import config from '../config'

jest.mock('helmet', () => jest.fn())
jest.mock('express', () => {
  return {
    Router: jest.fn(() => {
      return {
        use: jest.fn(),
      }
    }),
  }
})

const mockRouter = jest.mocked(Router)
const mockHelmet = jest.mocked(helmet)

const setUpRouter = () => {
  mockHelmet.mockReturnValue('helmetMiddleware' as unknown as RequestHandler)

  const result = setUpWebSecurity()
  const routerInstance = mockRouter.mock.results[0].value
  const useMock = jest.mocked(routerInstance.use)

  return { result, routerInstance, useMock }
}

describe('setUpWebSecurity', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set cspNonce', () => {
    const { result, routerInstance, useMock } = setUpRouter()

    expect(result).toBe(routerInstance)
    expect(mockRouter).toHaveBeenCalledWith()
    expect(useMock).toHaveBeenCalledTimes(2)

    const cspMiddleware = useMock.mock.calls[0][0] as RequestHandler

    const req = httpMocks.createRequest()
    const res = httpMocks.createResponse({ locals: {} })
    const next = jest.fn()

    cspMiddleware(req, res, next)

    expect(typeof res.locals.cspNonce).toBe('string')
    expect(res.locals.cspNonce).toHaveLength(32)
    expect(next).toHaveBeenCalled()
  })

  it('should configure helmet CSP directives', () => {
    const { useMock } = setUpRouter()

    expect(mockHelmet).toHaveBeenCalledTimes(1)
    const helmetOptions = mockHelmet.mock.calls[0][0] as HelmetOptions

    expect(helmetOptions.crossOriginEmbedderPolicy).toBe(true)
    if (typeof helmetOptions.contentSecurityPolicy === 'object') {
      expect(helmetOptions.contentSecurityPolicy.directives.defaultSrc).toEqual(["'self'"])
      expect(helmetOptions.contentSecurityPolicy.directives.formAction).toEqual([
        `'self' ${config.apis.hmppsAuth.externalUrl}`,
      ])
      expect(helmetOptions.contentSecurityPolicy.directives.upgradeInsecureRequests).toBeNull()
    }

    expect(useMock.mock.calls[1][0]).toBe('helmetMiddleware')
  })
})
