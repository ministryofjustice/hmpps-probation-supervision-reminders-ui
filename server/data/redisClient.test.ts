import { createClient } from 'redis'
import { createRedisClient } from './redisClient'
import config from '../config'
import logger from '../../logger'

jest.mock('redis')
jest.mock('../config', () => ({
  redis: {
    tls_enabled: 'true',
    host: 'test',
    port: 8080,
  },
}))
jest.mock('../../logger')

const mockCreateClient = jest.mocked(createClient)

const mockClient = {
  on: jest.fn(),
}

describe('createRedisClient', () => {
  beforeEach(() => {
    mockCreateClient.mockReturnValue(mockClient as unknown as ReturnType<typeof createClient>)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create redis client with rediss:// URL when TLS is enabled', () => {
    createRedisClient()

    expect(mockCreateClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'rediss://test:8080',
      }),
    )
  })

  it('should create redis client with redis:// URL when TLS is disabled', () => {
    config.redis.tls_enabled = 'false'

    createRedisClient()

    expect(mockCreateClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'redis://test:8080',
      }),
    )
  })

  it('should attach error event handler to client', () => {
    createRedisClient()

    expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function))
  })

  it('should log error when client encounters an error', () => {
    createRedisClient()

    const errorHandler = mockClient.on.mock.calls[0][1]
    const testError = new Error('Connection failed')

    errorHandler(testError)

    expect(logger.error).toHaveBeenCalledWith('Redis client error', testError)
  })
})
