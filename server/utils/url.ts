import { DateTimeFormatter, LocalDate } from '@js-joda/core'
import { ParsedQs } from 'qs'

export function asArray(param: undefined | string | ParsedQs | (string | ParsedQs)[]): string[] {
  if (param === undefined) return []
  return Array.isArray(param) ? (param as string[]) : [param as string]
}

export function asDate(
  date: null | undefined | string | ParsedQs | (string | ParsedQs)[],
  defaultValue: LocalDate = LocalDate.now().minusDays(1),
): LocalDate {
  return date ? LocalDate.parse(date as string, DateTimeFormatter.ofPattern('d/M/yyyy')) : defaultValue
}
