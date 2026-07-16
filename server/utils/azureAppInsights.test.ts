import {
  addOperationNameProcessor,
  cloudRoleProcessor,
  ignoredDependenciesProcessor,
  ignoredRequestsProcessor,
} from './azureAppInsights'

type RequestData = { name: string; success: boolean } & Record<string, unknown>
type RemoteDependencyData = { target: string; success: boolean } & Record<string, unknown>
interface TelemetryItem {
  tags?: Record<string, string>
  data: {
    baseType: string
    baseData: RequestData | RemoteDependencyData | Record<string, unknown>
  }
  time?: unknown
  name?: string
}

interface TestEnvelope {
  tags: Record<string, string>
  data: {
    baseData?: {
      name?: string
    }
  }
}

const createEnvelope = (baseData: RequestData | RemoteDependencyData, baseType = 'RequestData'): TelemetryItem =>
  ({
    data: {
      baseType,
      baseData,
    },
    time: new Date(),
    name: 'test',
  }) as TelemetryItem

describe('azureAppInsights', () => {
  describe('ignoredRequestsProcessor', () => {
    it.each([
      ['GET /assets/some.css', false],
      ['GET /health', false],
      ['GET /ping', false],
      ['GET /info', false],
      ['GET /something-else', true],
      ['GET /something-else/random', true],
      ['GET /sandwich/health/with-something-else', true],
    ])(`Request '%s' logged by app insights when request is successful: '%s'`, (name: string, logged: boolean) => {
      const requestData: RequestData = {
        name,
        success: true,
        duration: '00.00:00:01.000',
        responseCode: '200',
        id: 'id',
      }

      const envelope = createEnvelope(requestData, 'RequestData')

      expect(ignoredRequestsProcessor(envelope)).toBe(logged)
    })

    it.each([
      'GET /assets/some.css',
      'GET /health',
      'GET /ping',
      'GET /info',
      'GET /something-else',
      'GET /something-else/random',
      'GET /sandwich/health/with-something-else',
    ])(`Request '%s' is logged by app insights when request is not successful`, (name: string) => {
      const requestData: RequestData = {
        name,
        success: false,
        duration: '00.00:00:01.000',
        responseCode: '500',
        id: 'id',
      }

      const envelope = createEnvelope(requestData, 'RequestData')

      expect(ignoredRequestsProcessor(envelope)).toBe(true)
    })
  })

  describe('ignoredDependenciesProcessor', () => {
    it.each([
      ['sqs.eu-west-2.amazonaws.com', false],
      ['sqs.us-east-1.amazonaws.com', false],
      ['anything.else', true],
    ])(`Dependency '%s' logged by app insights when request is successful: '%s'`, (target: string, logged: boolean) => {
      const dependencyData: RemoteDependencyData = {
        target,
        success: true,
        name: 'dependency',
        duration: '00.00:00:01.000',
      }

      const envelope = createEnvelope(dependencyData, 'RemoteDependencyData')

      expect(ignoredDependenciesProcessor(envelope)).toBe(logged)
    })

    it.each(['sqs.eu-west-2.amazonaws.com', 'sqs.us-east-1.amazonaws.com', 'anything.else'])(
      `Dependency '%s' is logged by app insights when request is not successful`,
      (target: string) => {
        const dependencyData: RemoteDependencyData = {
          target,
          success: false,
          name: 'dependency',
          duration: '00.00:00:01.000',
        }

        const envelope = createEnvelope(dependencyData, 'RemoteDependencyData')

        expect(ignoredDependenciesProcessor(envelope)).toBe(true)
      },
    )
  })

  describe('cloudRoleProcessor', () => {
    it('should set cloud role name from environment variable', () => {
      const originalRoleName = process.env.APPLICATIONINSIGHTS_ROLE_NAME
      try {
        process.env.APPLICATIONINSIGHTS_ROLE_NAME = 'test-role'
        const envelope = {
          tags: {} as Record<string, string>,
        }

        cloudRoleProcessor(envelope)

        expect(envelope.tags['ai.cloud.role']).toBe('test-role')
      } finally {
        if (originalRoleName === undefined) {
          delete process.env.APPLICATIONINSIGHTS_ROLE_NAME
        } else {
          process.env.APPLICATIONINSIGHTS_ROLE_NAME = originalRoleName
        }
      }
    })
  })

  describe('addOperationNameProcessor', () => {
    it('should update operation name when override is present', () => {
      const envelope: TestEnvelope = {
        tags: { 'ai.operation.name': 'old-name' },
        data: {
          baseData: {
            name: 'old-name',
          },
        },
      }

      const contextObjects = {
        correlationContext: {
          customProperties: {
            getProperty: jest.fn().mockReturnValue('new-name'),
          },
        },
      }

      const result = addOperationNameProcessor(envelope, contextObjects)

      expect(result).toBe(true)
      expect(envelope.tags['ai.operation.name']).toBe('new-name')
      expect(envelope.data.baseData?.name).toBe('new-name')
    })

    it('should not update operation name when override is missing', () => {
      const envelope: TestEnvelope = {
        tags: { 'ai.operation.name': 'old-name' },
        data: {
          baseData: {
            name: 'old-name',
          },
        },
      }

      const contextObjects = {
        correlationContext: {
          customProperties: {
            getProperty: jest.fn().mockReturnValue(undefined),
          },
        },
      }

      const result = addOperationNameProcessor(envelope, contextObjects)

      expect(result).toBe(true)
      expect(envelope.tags['ai.operation.name']).toBe('old-name')
      expect(envelope.data.baseData?.name).toBe('old-name')
    })

    it('should not update operation name when envelope structure is invalid', () => {
      const envelope: TestEnvelope = {
        tags: {},
        data: {},
      }

      const contextObjects = {
        correlationContext: {
          customProperties: {
            getProperty: jest.fn().mockReturnValue('new-name'),
          },
        },
      }

      const result = addOperationNameProcessor(envelope, contextObjects)

      expect(result).toBe(true)
      expect(envelope.tags['ai.operation.name']).toBeUndefined()
    })
  })
})
