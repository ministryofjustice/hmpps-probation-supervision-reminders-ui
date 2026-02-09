import { LocalDate } from '@js-joda/core'
import { Notification } from 'notifications-node-client'
import { convertToTitleCase } from './utils'

export interface Filters {
  from: LocalDate
  to: LocalDate
  status: string[]
  template: string[]
  keywords: string
}

export function mapStatus(status: string): string {
  return convertToTitleCase(status).replaceAll('-', ' ')
}

export function filterByKeywords(notification: Notification, keywords?: string): boolean {
  if (!keywords) return true
  return [notification.phone_number, notification.body, notification.reference, mapStatus(notification.status)].some(
    str => str?.toLowerCase()?.includes(keywords.toLowerCase()),
  )
}
