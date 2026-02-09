import { LocalDate, ZonedDateTime } from '@js-joda/core'
import { Notification, NotifyClient } from 'notifications-node-client'
import { parseDate } from './utils'
import config from '../config'

export default async function getAllNotifications(from: LocalDate, to: LocalDate): Promise<Notification[]> {
  const notifications: Notification[] = []
  let olderThanId: string | null = null

  const client = config.notify.customUrl
    ? new NotifyClient(config.notify.customUrl, config.notify.apiKey)
    : new NotifyClient(config.notify.apiKey)

  const fromDay = from.toEpochDay()
  const toDay = to.toEpochDay()

  while (true) {
    const response = await client.getNotifications('sms', null, null, olderThanId) // eslint-disable-line no-await-in-loop
    const pageNotifs = response.data.notifications

    // Single parsing approach everywhere
    const parsed: Array<{ n: Notification; zdt: ZonedDateTime }> = []
    for (const n of pageNotifs) {
      const zdt = parseDate(n.sent_at)
      if (zdt) parsed.push({ n, zdt })
    }

    const page = parsed
      .filter(({ zdt }) => {
        const day = zdt.toLocalDate().toEpochDay()
        return fromDay <= day && day <= toDay
      })
      .map(({ n }) => n)

    notifications.push(...page)

    // Fetch next page if:
    // * this page has results, OR
    // * we haven't yet paged back far enough to reach the "to" date.
    //
    // Notify returns newest-first; "isAfter(to)" means there exist results newer than 'to',
    // so we may still need to page back to reach the requested end.
    const moreResults = page.length > 0 || parsed.some(({ zdt }) => zdt.toLocalDate().isAfter(to))

    if (moreResults && response.data.links.next) {
      olderThanId = new URL(response.data.links.next).searchParams.get('older_than')
      if (!olderThanId) return notifications
    } else {
      return notifications
    }
  }
}
