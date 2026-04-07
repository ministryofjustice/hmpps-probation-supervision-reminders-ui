const formatDate = (date: Date): string => `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

const shiftDays = (days: number): Date => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

const today = (): string => formatDate(shiftDays(0))

const daysAgo = (days: number): string => formatDate(shiftDays(-Math.abs(days)))

const daysFromNow = (days: number): string => formatDate(shiftDays(Math.abs(days)))

const dateUtil = {
  today,
  daysAgo,
  daysFromNow,
}

export default dateUtil
