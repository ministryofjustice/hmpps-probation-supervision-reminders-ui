import request from 'supertest'
import { LocalDate } from '@js-joda/core'
import { appWithAllRoutes, user } from './testutils/appSetup'
import { Services } from '../services'
import { Page } from '../services/auditService'

jest.mock('../utils/notifyUtils', () => {
  return jest.fn().mockResolvedValue([
    {
      id: 'test-id-1',
      phone_number: '0800-test',
      reference: 'ABC123',
      body: 'Test reminder message',
      sent_at: '2026-03-24T10:00:00.000Z',
      status: 'delivered',
      template: { id: 'template-1' },
    },
  ])
})

jest.mock('notifications-node-client', () => ({
  NotifyClient: jest.fn().mockImplementation(() => {
    return {
      getNotificationById: jest.fn().mockResolvedValue({
        data: {
          id: 'test-id-1',
          phone_number: '0800-test',
          reference: 'ABC123',
          body: 'Test reminder message',
          sent_at: '2026-03-24T10:00:00.000Z',
          status: 'delivered',
          template: { id: 'template-1' },
        },
      }),
      getTemplateById: jest.fn().mockResolvedValue({ data: { name: 'Test Template' } }),
      getNotifications: jest.fn().mockResolvedValue({
        data: {
          notifications: [
            {
              id: 'test-id-1',
              phone_number: '0800-test',
              reference: 'ABC123',
              body: 'Test reminder message',
              sent_at: '2026-03-24T10:00:00.000Z',
              status: 'delivered',
              template: { id: 'template-1' },
            },
          ],
        },
      }),
    }
  }),
}))

LocalDate.now = jest.fn(() => LocalDate.of(2026, 3, 24))

const mockAuditService = {
  logPageView: jest.fn().mockResolvedValue(undefined),
}

const mockServices = {
  auditService: mockAuditService,
  applicationInfo: {},
} as unknown as Services

const mockApp = appWithAllRoutes({
  production: false,
  services: mockServices,
  userSupplier: () => user,
  correlationId: '123',
})

const renderPageWithRoute = (path: string) => {
  return request(mockApp).get(path)
}

describe('Reminders routes', () => {
  describe('GET /', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('responds with HTML', async () => {
      await renderPageWithRoute('/').expect('Content-Type', /html/)
    })

    it('calls auditService.logPageView with correct args', async () => {
      await renderPageWithRoute('/')

      expect(mockAuditService.logPageView).toHaveBeenCalledTimes(1)
      expect(mockAuditService.logPageView).toHaveBeenCalledWith(Page.HOME_PAGE, {
        correlationId: '123',
        who: user.username,
      })
    })

    it('renders the notifications table', async () => {
      const notificationRes = await renderPageWithRoute('/')

      expect(notificationRes.text).toContain('ABC123')
    })

    it('renders the correct link to a notification', async () => {
      const notificationRes = await renderPageWithRoute('/')

      expect(notificationRes.text).toContain('href="/notification/test-id-1"')
    })

    describe('filter validation errors', () => {
      afterEach(() => {
        jest.clearAllMocks()
      })

      test.each`
        a                                               | b                                          | expected
        ${'"from" is after today'}                      | ${'/?from=25%2F3%2F2026&to=24%2F3%2F2026'} | ${'Please select a date in the past'}
        ${'"from" is after "to"'}                       | ${'/?from=24%2F3%2F2026&to=23%2F3%2F2026'} | ${'Must be on or after the'}
        ${'"to" is after today'}                        | ${'/?from=23%2F3%2F2026&to=25%2F3%2F2026'} | ${'Please select a date in the past'}
        ${'shows error when range is more than 7 days'} | ${'/?from=16%2F3%2F2026&to=24%2F3%2F2026'} | ${'Must be within 7 days of the'}
      `('should show error "$expected" when $a', async ({ _, b, expected }) => {
        const errorMessage = await renderPageWithRoute(b)
        expect(errorMessage.text).toContain(expected)
      })
    })
  })

  describe('GET /notification/:id', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('responds with HTML', async () => {
      await renderPageWithRoute('/notification/test-id-1').expect('Content-Type', /html/)
    })

    it('calls auditService.logPageView with correct args', async () => {
      await renderPageWithRoute('/notification/test-id-1')

      expect(mockAuditService.logPageView).toHaveBeenCalledTimes(1)
      expect(mockAuditService.logPageView).toHaveBeenCalledWith(Page.NOTIFICATION, {
        correlationId: '123',
        who: user.username,
      })
    })

    it('sets the href on the back button to the previous page', async () => {
      const persistentRequest = request.agent(mockApp)

      await persistentRequest.get('/?from=23%2F3%2F2026&to=24%2F3%2F2026')

      const notificationRes = await persistentRequest.get(`/notification/test-id-1`)

      expect(notificationRes.text).toContain('href="/?from=23%2F3%2F2026&amp;to=24%2F3%2F2026"')
    })

    it('sets the href on the back button to / if there is no previous page', async () => {
      const notificationRes = await renderPageWithRoute('/notification/test-id-1')

      expect(notificationRes.text).toContain('href="/"')
    })
  })
})
