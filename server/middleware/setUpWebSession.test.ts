import session from 'express-session'
import { RedisStore } from 'connect-redis'
import express from 'express'
import { RedisClientType } from 'redis'
import setUpWebSession from './setUpWebSession'
import config from '../config'

jest.mock('express-session')
jest.mock('express')
jest.mock('../config')
jest.mock('../../logger')
jest.mock('connect-redis', () => ({
  RedisStore: jest.fn(),
}))

const createRedisClient = jest.requireActual('../data/redisClient')
const mockSession = jest.mocked(session)
const mockExpress = jest.mocked(express)
const mockConfig = jest.mocked(config)
const mockRedisStore = jest.mocked(RedisStore)
const mockClient = { connect: jest.fn().mockResolvedValue(undefined) }
const createRedisClientSpy = jest
  .spyOn(createRedisClient, 'default')
  .mockReturnValue(mockClient as unknown as RedisClientType)

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

    setUpWebSession()

    expect(mockSession).toHaveBeenCalledWith(expect.objectContaining({ store: expect.any(Object) }))
    expect(createRedisClientSpy).not.toHaveBeenCalled()
    expect(mockRedisStore).not.toHaveBeenCalled()
  })

  it('should use RedisStore when redis is enabled', () => {
    mockConfig.redis.enabled = true

    setUpWebSession()

    expect(mockSession).toHaveBeenCalledWith(expect.objectContaining({ store: expect.any(Object) }))
    expect(createRedisClientSpy).toHaveBeenCalledTimes(1)
    expect(mockRedisStore).toHaveBeenCalledWith({ client: mockClient })
  })
})
