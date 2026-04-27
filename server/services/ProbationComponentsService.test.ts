import ProbationComponentsService from './ProbationComponentsService'
import ProbationFrontendComponentsApiClient from '../data/probationFrontendComponentsClient'
import createUserToken from '../testutils/createUserToken'

jest.mock('../data/probationFrontendComponentsClient')

describe('ProbationComponentsService', () => {
  const probationFrontendComponentsApiClient: jest.Mocked<ProbationFrontendComponentsApiClient> =
    new ProbationFrontendComponentsApiClient() as jest.Mocked<ProbationFrontendComponentsApiClient>
  const probationComponentsService: ProbationComponentsService = new ProbationComponentsService(
    probationFrontendComponentsApiClient,
  )

  it('retrieves the header and footer', async () => {
    const token = createUserToken({ authorities: [] })
    probationFrontendComponentsApiClient.getComponents.mockResolvedValue({
      header: {
        html: '<div>header</div>',
        css: ['/css/header.css'],
        javascript: ['/js/header.js'],
      },
      footer: {
        html: '<div>footer</div>',
        css: ['/css/footer.css'],
        javascript: ['/js/footer.js'],
      },
    })

    const result = await probationComponentsService.getProbationFEComponents(['header', 'footer'], token)

    expect(result).toEqual({
      header: {
        html: '<div>header</div>',
        css: ['/css/header.css'],
        javascript: ['/js/header.js'],
      },
      footer: {
        html: '<div>footer</div>',
        css: ['/css/footer.css'],
        javascript: ['/js/footer.js'],
      },
    })
  })
})
