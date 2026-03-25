import session from 'express-session'
import { RedisStore } from 'connect-redis'
import express from 'express'
import setUpWebSession from './setUpWebSession'
import config from '../config'
import { createRedisClient } from '../data/redisClient'

jest.mock('express-session')
jest.mock('express')
jest.mock('../config')
jest.mock('connect-redis', () => ({
  RedisStore: jest.fn(),
}))
jest.mock('../../logger', () => ({
  logger: jest.fn(),
}))
jest.mock('../data/redisClient', () => ({
  createRedisClient: jest.fn(),
}))

const mockSession = jest.mocked(session)
const mockExpress = jest.mocked(express)
const mockConfig = jest.mocked(config)
const mockRedisStore = jest.mocked(RedisStore)
const mockedRedisClient = jest.mocked(createRedisClient)
const mockClient = { connect: jest.fn().mockResolvedValue(undefined) }

const mockRouter = {
  use: jest.fn(),
}

describe('setUpWebSession', () => {
  beforeEach(() => {
    mockExpress.Router = jest.fn().mockReturnValue(mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a router', () => {
    const router = setUpWebSession()
    expect(router).toBe(mockRouter)
  })

  it('should use MemoryStore when redis is disabled', () => {
    mockConfig.redis.enabled = false

    mockedRedisClient.mockReturnValue(mockClient as unknown as ReturnType<typeof createRedisClient>)

    setUpWebSession()

    expect(mockSession).toHaveBeenCalledWith(expect.objectContaining({ store: expect.any(Object) }))
    expect(mockedRedisClient).not.toHaveBeenCalled()
    expect(mockRedisStore).not.toHaveBeenCalled()
  })

  it('should use RedisStore when redis is enabled', () => {
    mockConfig.redis.enabled = true

    mockedRedisClient.mockReturnValue(mockClient as unknown as ReturnType<typeof createRedisClient>)

    setUpWebSession()

    expect(mockSession).toHaveBeenCalledWith(expect.objectContaining({ store: expect.any(Object) }))
    expect(mockedRedisClient).toHaveBeenCalledTimes(1)
    expect(mockRedisStore).toHaveBeenCalledWith({ client: mockClient })
  })
})
