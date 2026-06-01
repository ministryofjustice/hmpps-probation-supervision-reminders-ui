import request from 'supertest'
import { LocalDate } from '@js-joda/core'
import { Notification } from 'notifications-node-client'
import { appWithAllRoutes, user } from './testutils/appSetup'
import { Services } from '../services'
import { Page } from '../services/auditService'

const mockApiNotification: Notification = {
  id: 'test-id-1',
  phone_number: '0800-test',
  reference: 'ABC123',
  body: 'Test reminder message',
  sent_at: '2026-03-24T10:00:00.000Z',
  status: 'delivered',
  template: { id: 'template-1', uri: 'test', version: 1 },
  cost_in_pounds: 0,
  created_at: '2026-03-24T10:00:00.000Z',
  is_cost_data_ready: true,
  type: 'sms',
}

const manualResendNotification: Notification = {
  ...mockApiNotification,
  reference: undefined,
}

const mockGetNotificationById = jest.fn().mockResolvedValue({
  data: mockApiNotification,
})

const mockGetNotifications = jest.fn().mockResolvedValue({
  data: {
    notifications: [mockApiNotification],
  },
})

jest.mock('../utils/notifyUtils', () => {
  return jest.fn().mockResolvedValue([
    {
      id: 'test-id-1',
      phone_number: '0800-test',
      reference: 'ABC123',
      body: 'Test reminder message',
      sent_at: '2026-03-24T10:00:00.000Z',
      status: 'delivered',
      template: { id: 'template-1', uri: 'test', version: 1 },
      cost_in_pounds: 0,
      created_at: '2026-03-24T10:00:00.000Z',
      is_cost_data_ready: true,
      type: 'sms',
    },
  ])
})

jest.mock('notifications-node-client', () => ({
  NotifyClient: jest.fn().mockImplementation(() => {
    return {
      getNotificationById: mockGetNotificationById,
      getTemplateById: jest.fn().mockResolvedValue({ data: { name: 'Test Template' } }),
      getNotifications: mockGetNotifications,
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
  beforeEach(() => {
    mockGetNotificationById.mockResolvedValue({
      data: mockApiNotification,
    })

    mockGetNotifications.mockResolvedValue({
      data: {
        notifications: [mockApiNotification],
      },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /', () => {
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
      test.each`
        a                                               | b                                          | expected
        ${'"from" is after today'}                      | ${'/?from=25%2F3%2F2026&to=24%2F3%2F2026'} | ${'Please select a date in the past'}
        ${'"from" is after "to"'}                       | ${'/?from=24%2F3%2F2026&to=23%2F3%2F2026'} | ${'Must be on or after the'}
        ${'"to" is after today'}                        | ${'/?from=23%2F3%2F2026&to=25%2F3%2F2026'} | ${'Please select a date in the past'}
        ${'shows error when range is more than 7 days'} | ${'/?from=16%2F3%2F2026&to=24%2F3%2F2026'} | ${'Must be within 7 days of the'}
      `('should show error "$expected" when $a', async ({ b, expected }) => {
        const errorMessage = await renderPageWithRoute(b)

        expect(errorMessage.text).toContain(expected)
      })
    })
  })

  describe('GET /notification/:id', () => {
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

    it('gets previous notifications using the notification reference when CRN exists', async () => {
      await renderPageWithRoute('/notification/test-id-1')

      expect(mockGetNotifications).toHaveBeenCalledWith('sms', null, 'ABC123', 'test-id-1')
    })

    it('does not get notification history when CRN is missing for manual resend', async () => {
      mockGetNotificationById.mockResolvedValueOnce({
        data: manualResendNotification,
      })

      await renderPageWithRoute('/notification/test-id-1')

      expect(mockGetNotifications).not.toHaveBeenCalled()
    })

    it('renders only the current notification when CRN is missing for manual resend', async () => {
      mockGetNotificationById.mockResolvedValueOnce({
        data: manualResendNotification,
      })

      const notificationRes = await renderPageWithRoute('/notification/test-id-1')

      expect(notificationRes.text).toContain('Test reminder message')
      expect(mockGetNotifications).not.toHaveBeenCalled()
    })

    it('sets the href on the back button to the previous page', async () => {
      const persistentRequest = request.agent(mockApp)

      await persistentRequest.get('/?from=23%2F3%2F2026&to=24%2F3%2F2026')

      const notificationRes = await persistentRequest.get('/notification/test-id-1')

      expect(notificationRes.text).toContain('href="/?from=23%2F3%2F2026&amp;to=24%2F3%2F2026"')
    })

    it('sets the href on the back button to / if there is no previous page', async () => {
      const notificationRes = await renderPageWithRoute('/notification/test-id-1')

      expect(notificationRes.text).toContain('href="/"')
    })
  })
})
