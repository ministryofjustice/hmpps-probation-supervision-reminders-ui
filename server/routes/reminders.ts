import { Router } from 'express'
import { LocalDate } from '@js-joda/core'
import { NotifyClient } from 'notifications-node-client'
import type { Services } from '../services'
import { Page } from '../services/auditService'
import { filterByKeywords, Filters, mapStatus } from '../utils/filterUtils'
import { asArray, asDate } from '../utils/url'
import getAllNotifications from '../utils/notifyUtils'
import { formatDate, parseDate } from '../utils/utils'
import config from '../config'

export default function reminderRoutes(router: Router, { auditService }: Services): Router {
  const notifyClient = config.notify.customUrl
    ? new NotifyClient(config.notify.customUrl, config.notify.apiKey)
    : new NotifyClient(config.notify.apiKey)

  router.get('/', async (req, res, next) => {
    await auditService.logPageView(Page.HOME_PAGE, { who: res.locals.user.username, correlationId: req.id })

    const filters: Filters = {
      from: asDate(req.query.from),
      to: asDate(req.query.to),
      keywords: req.query.keywords as string,
      status: asArray(req.query.status),
      template: asArray(req.query.template),
    }

    const minDate = LocalDate.now().minusDays(90)
    const maxDate = LocalDate.now()
    const errors = {} as Record<string, string>
    if (filters.from.isBefore(minDate)) errors.from = 'Cannot be more than 90 days in the past'
    if (filters.from.isAfter(maxDate)) errors.from = 'Please select a date in the past'
    if (filters.from.isAfter(filters.to)) errors.to = 'Must be on or after the "From" date'
    if (filters.from.isBefore(filters.to.minusDays(7))) errors.from = 'Must be within 7 days of the "To" date'
    if (filters.to.isAfter(maxDate)) errors.to = 'Please select a date in the past'
    if (Object.keys(errors).length > 0) {
      res.render('pages/list', { filters, minDate, maxDate, errors })
      return
    }

    const notifications = await getAllNotifications(filters.from, filters.to)
    const headers = [{ text: 'To' }, { text: 'Message' }, { text: 'Status' }]
    const results = notifications
      .filter(n => filterByKeywords(n, filters.keywords))
      .filter(n => filters.status.length === 0 || filters.status.includes(n.status))
      .filter(n => filters.template.length === 0 || filters.template.includes(n.template.id))
      .map(n => [
        {
          html: `<a href="/notification/${n.id}" class="govuk-!-font-weight-bold govuk-!-margin-bottom-1">${n.phone_number}</a><div class="secondary-text">${n.reference}</div>`,
        },
        {
          html: `<p class="govuk-!-margin-bottom-1">${n.body}</p>
          <time class="secondary-text" datetime="${n.sent_at}" title="${n.sent_at}">
            Sent on ${formatDate(parseDate(n.sent_at))}
          </time>`,
        },
        { text: mapStatus(n.status) },
      ])

    res.render('pages/list', { headers, results, filters, minDate, maxDate })
  })

  router.get('/notification/:id', async (req, res, next) => {
    await auditService.logPageView(Page.NOTIFICATION, { who: res.locals.user.username, correlationId: req.id })

    const notification = (await notifyClient.getNotificationById(req.params.id)).data
    const templateName = (await notifyClient.getTemplateById(notification.template.id)).data.name
    const crn = notification.reference
    const previousNotifications = (await notifyClient.getNotifications('sms', null, crn, req.params.id)).data
      .notifications
    res.render('pages/notification', { notification, templateName, previousNotifications })
  })
  return router
}
