import { jwtDecode } from 'jwt-decode'
import express from 'express'
import httpMocks from 'node-mocks-http'
import logger from '../../logger'
import setUpCurrentUser from './setUpCurrentUser'

jest.mock('express')
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}))
jest.mock('../../logger', () => ({
  logger: jest.fn(),
  error: jest.fn(),
}))

const mockRouter = {
  use: jest.fn(),
}

const mockJwtDecode = jest.mocked(jwtDecode)
const mockExpress = jest.mocked(express)
mockExpress.Router = jest.fn().mockReturnValue(mockRouter)

const mockRequest = httpMocks.createRequest()
const mockResponse = (authSource: string) =>
  httpMocks.createResponse({
    locals: {
      user: {
        token: 'token',
        authSource,
        username: 'test1',
      },
    },
  })

describe('setUpCurrentUser', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set up current user for nomis authSource', () => {
    mockJwtDecode.mockReturnValue({
      name: 'First Last',
      user_id: '123',
      authorities: ['ROLE_USER'],
    })

    setUpCurrentUser()

    const res = mockResponse('nomis')

    const next = jest.fn()

    const useCallback = mockRouter.use.mock.calls[0][0]
    useCallback(mockRequest, res, next)

    expect(res.locals.user).toEqual({
      token: 'token',
      authSource: 'nomis',
      userId: '123',
      name: 'First Last',
      displayName: 'First Last',
      userRoles: ['USER'],
      username: 'test1',
      staffId: 123,
    })
    expect(next).toHaveBeenCalledWith()
  })

  it('should set up current user for non-nomis authSource', () => {
    mockJwtDecode.mockReturnValue({
      name: 'First Last',
      user_id: '456',
      authorities: ['ROLE_ADMIN'],
    })

    setUpCurrentUser()
    const res = mockResponse('other')

    const next = jest.fn()

    const useCallback = mockRouter.use.mock.calls[0][0]
    useCallback(mockRequest, res, next)

    expect(res.locals.user).toEqual({
      token: 'token',
      authSource: 'other',
      userId: '456',
      name: 'First Last',
      displayName: 'First Last',
      userRoles: ['ADMIN'],
      username: 'test1',
    })
    expect(next).toHaveBeenCalledWith()
  })

  it('should log error and call next with error on jwtDecode failure', () => {
    const error = new Error('Invalid token')
    mockJwtDecode.mockImplementation(() => {
      throw error
    })

    setUpCurrentUser()

    const res = mockResponse('badtoken')

    const next = jest.fn()

    const useCallback = mockRouter.use.mock.calls[0][0]
    useCallback(mockRequest, res, next)

    expect(logger.error).toHaveBeenCalledWith(error, 'Failed to populate user details for: test1')
    expect(next).toHaveBeenCalledWith(error)
  })
})
