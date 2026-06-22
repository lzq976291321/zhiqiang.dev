import {
  chinaHolidayGroups2026,
  chinaSpecialWorkdays2026,
} from "@/features/tools/data/china-holidays"

export type ChinaDateStatus = "holiday" | "workday" | "weekend"

export type ChinaDateInfo = {
  date: string
  status: ChinaDateStatus
  label: string
  detail: string
  weekday: string
  isWorkday: boolean
}

const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

const holidayByDate = new Map(
  chinaHolidayGroups2026.flatMap((group) =>
    group.dates.map((date) => [date, group.name] as const)
  )
)

const workdayByDate = new Map(
  chinaSpecialWorkdays2026.map((item) => [item.date, item.reason] as const)
)

function parseDate(date: string) {
  return new Date(`${date}T00:00:00+08:00`)
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function addDays(date: string, days: number) {
  const next = parseDate(date)
  next.setDate(next.getDate() + days)
  return formatDate(next)
}

export function classifyChinaDate(date: string): ChinaDateInfo {
  const parsed = parseDate(date)
  const day = parsed.getDay()
  const weekday = weekdayNames[day]
  const specialWorkday = workdayByDate.get(date)

  if (specialWorkday) {
    return {
      date,
      status: "workday",
      label: "调休工作日",
      detail: specialWorkday,
      weekday,
      isWorkday: true,
    }
  }

  const holiday = holidayByDate.get(date)
  if (holiday) {
    return {
      date,
      status: "holiday",
      label: "节假日",
      detail: holiday,
      weekday,
      isWorkday: false,
    }
  }

  const isWeekend = day === 0 || day === 6
  return {
    date,
    status: isWeekend ? "weekend" : "workday",
    label: isWeekend ? "周末" : "工作日",
    detail: isWeekend ? "普通周末" : "普通工作日",
    weekday,
    isWorkday: !isWeekend,
  }
}

export function countChinaWorkdays(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0

  const start = startDate <= endDate ? startDate : endDate
  const end = startDate <= endDate ? endDate : startDate
  let cursor = start
  let count = 0

  while (cursor <= end) {
    if (classifyChinaDate(cursor).isWorkday) count += 1
    cursor = addDays(cursor, 1)
  }

  return count
}

export function getUpcomingChinaHolidays(fromDate: string, limit = 4) {
  return chinaHolidayGroups2026
    .map((group) => ({
      ...group,
      start: group.dates[0],
      end: group.dates[group.dates.length - 1],
      days: group.dates.length,
    }))
    .filter((group) => group.end >= fromDate)
    .slice(0, limit)
}
