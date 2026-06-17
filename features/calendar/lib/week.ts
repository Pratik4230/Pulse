export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function startOfWeek(date: Date) {
  const start = new Date(date)
  const weekday = start.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatWeekRangeLabel(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6)
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  })

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${formatter.format(weekStart)} - ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
  }

  return `${formatter.format(weekStart)} - ${formatter.format(weekEnd)}, ${weekEnd.getFullYear()}`
}

export function getEventDayKey(start: string, isAllDay: boolean) {
  if (isAllDay) return start
  return formatDateKey(new Date(start))
}

export function formatEventClockTime(start: string, isAllDay: boolean) {
  if (isAllDay) return "All day"
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(start))
}
