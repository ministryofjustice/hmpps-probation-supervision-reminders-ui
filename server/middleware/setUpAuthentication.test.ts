import passport from 'passport'
import flash from 'connect-flash'
import express from 'express'
import { VerificationClient } from '@ministryofjustice/hmpps-auth-clients'
import setupAuthentication from './setUpAuthentication'

jest.mock('connect-flash')
jest.mock('../utils/clientCredentials')
jest.mock('express')
jest.mock('passport', () => ({
  initialize: jest.fn(),
  session: jest.fn(),
  use: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
  authenticate: jest.fn(),
}))
jest.mock('@ministryofjustice/hmpps-auth-clients', () => ({
  VerificationClient: jest.fn(),
}))
jest.mock('../../logger', () => ({
  logger: jest.fn(),
}))

const mockExpress = jest.mocked(express)

const mockRouter = {
  use: jest.fn(),
  get: jest.fn(),
}

const mockPassport = jest.mocked(passport)
const mockFlash = jest.mocked(flash)
const mockedVerificationClient = jest.mocked(VerificationClient)

describe('setupAuthentication', () => {
  beforeEach(() => {
    mockExpress.Router = jest.fn().mockReturnValue(mockRouter)
    mockedVerificationClient.mockImplementation(() => ({ verifyToken: jest.fn() }) as unknown as VerificationClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a router', () => {
    const router = setupAuthentication()
    expect(router).toBe(mockRouter)
  })

  it('should initialize passport, session, and flash on the router', () => {
    const initializeMiddleware = jest.fn()
    const sessionMiddleware = jest.fn()
    const flashMiddleware = jest.fn()

    mockPassport.initialize.mockReturnValue(initializeMiddleware)
    mockPassport.session.mockReturnValue(sessionMiddleware)
    mockFlash.mockReturnValue(flashMiddleware)

    setupAuthentication()

    expect(mockPassport.initialize).toHaveBeenCalledTimes(1)
    expect(mockPassport.session).toHaveBeenCalledTimes(1)
    expect(mockFlash).toHaveBeenCalledTimes(1)

    expect(mockRouter.use).toHaveBeenCalledWith(initializeMiddleware)
    expect(mockRouter.use).toHaveBeenCalledWith(sessionMiddleware)
    expect(mockRouter.use).toHaveBeenCalledWith(flashMiddleware)
  })

  test.each`
    method   | expected
    ${'get'} | ${'/autherror'}
    ${'get'} | ${'/sign-in'}
    ${'get'} | ${'/sign-in/callback'}
    ${'use'} | ${'/sign-out'}
    ${'use'} | ${'/account-details'}
  `('should set up "$expected" route', async ({ method, expected }) => {
    setupAuthentication()
    const callType = method === 'get' ? mockRouter.get : mockRouter.use
    expect(callType.mock.calls.some((call: never[]) => call[0] === expected)).toBe(true)
  })
})
