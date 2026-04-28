import nock from 'nock'
import config from '../config'
import ProbationFrontendComponentsApiClient from './probationFrontendComponentsClient'

describe('ProbationFrontendComponentsApiClient', () => {
  const probationFrontendComponentsApiClient: ProbationFrontendComponentsApiClient =
    new ProbationFrontendComponentsApiClient()

  afterEach(() => {
    nock.cleanAll()
    jest.resetAllMocks()
  })

  it('should return header and footer from getComponents', async () => {
    nock(config.apis.probationFrontendComponentsApi.url)
      .get('/api/components?component=header&component=footer')
      .matchHeader('x-user-token', 'test-system-token')
      .reply(200, { header: 'header', footer: 'footer' })

    const result = await probationFrontendComponentsApiClient.getComponents(['header', 'footer'], 'test-system-token')

    expect(result).toEqual({ header: 'header', footer: 'footer' })
  })
})
