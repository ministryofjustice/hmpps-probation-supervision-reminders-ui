import { Router } from 'express'
import { csrfSync } from 'csrf-sync'
import setUpCsrf from './setUpCsrf'

jest.mock('csrf-sync', () => ({
  csrfSync: jest.fn(() => ({
    csrfSynchronisedProtection: jest.fn(),
  })),
}))

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
const mockCsrfSync = jest.mocked(csrfSync)
let originalNodeEnv: string | undefined

describe('setUpCsrf', () => {
  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env.NODE_ENV = originalNodeEnv
  })

  it('returns a Router with mergeParams option', () => {
    const result = setUpCsrf()

    expect(mockRouter).toHaveBeenCalledWith({ mergeParams: true })
    expect(result).toBe(mockRouter.mock.results[0].value)
  })

  it('should not call csrfSync if node env is TEST', () => {
    process.env.NODE_ENV = 'test'
    setUpCsrf()

    expect(mockCsrfSync).not.toHaveBeenCalled()
  })

  it('should call csrfSync if node env is LIVE', () => {
    process.env.NODE_ENV = 'live'
    setUpCsrf()

    expect(mockCsrfSync).toHaveBeenCalledTimes(1)
  })
})
