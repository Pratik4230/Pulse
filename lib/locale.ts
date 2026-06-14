import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  getCurrencyByCountry,
} from "@/lib/currencies"
import { getDefaultTimezone } from "@/lib/timezones"

export type UserLocale = {
  country: string
  currency: string
  timezone: string
}

export function resolveUserLocale(fields: {
  country?: string | null
  currency?: string | null
  timezone?: string | null
}): UserLocale {
  const country = fields.country?.trim() || DEFAULT_COUNTRY
  const currency =
    fields.currency?.trim() || getCurrencyByCountry(country).code || DEFAULT_CURRENCY
  const timezone = fields.timezone?.trim() || getDefaultTimezone(country)

  return { country, currency, timezone }
}

export function userHasLocale(fields: {
  country?: string | null
  timezone?: string | null
}) {
  return Boolean(fields.country?.trim() && fields.timezone?.trim())
}

export function buildLocaleContext(locale: UserLocale) {
  const countryEntry = getCurrencyByCountry(locale.country)

  return [
    `Country: ${locale.country} (${countryEntry.flag} ${countryEntry.name})`,
    `Timezone: ${locale.timezone}`,
    `Currency: ${locale.currency} (${countryEntry.symbol})`,
    buildTemporalContext(locale.timezone),
  ].join("\n")
}

const WEEKDAY_TO_NUM: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

function getPartsInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: WEEKDAY_TO_NUM[get("weekday")] ?? 0,
  }
}

function dateAtUtcNoon(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
}

function addDaysYmd(year: number, month: number, day: number, days: number) {
  const date = dateAtUtcNoon(year, month, day)
  date.setUTCDate(date.getUTCDate() + days)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

function formatLongDateInTimezone(
  year: number,
  month: number,
  day: number,
  timezone: string,
) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateAtUtcNoon(year, month, day))
}

export function buildTemporalContext(timezone: string) {
  const today = getPartsInTimezone(new Date(), timezone)
  const tomorrow = addDaysYmd(today.year, today.month, today.day, 1)

  const daysFromMonday = (today.weekday + 6) % 7
  const weekStart = addDaysYmd(
    today.year,
    today.month,
    today.day,
    -daysFromMonday,
  )
  const weekEnd = addDaysYmd(weekStart.year, weekStart.month, weekStart.day, 6)

  const daysUntilSaturday = (6 - today.weekday + 7) % 7
  const nextSaturday = addDaysYmd(
    today.year,
    today.month,
    today.day,
    daysUntilSaturday,
  )

  const upcomingWeekdays = WEEKDAY_NAMES.map((name, index) => {
    const daysAhead = (index - today.weekday + 7) % 7
    const date = addDaysYmd(today.year, today.month, today.day, daysAhead)
    return `${name}: ${formatLongDateInTimezone(date.year, date.month, date.day, timezone)}`
  })

  return [
    `Today: ${formatLongDateInTimezone(today.year, today.month, today.day, timezone)}`,
    `Tomorrow: ${formatLongDateInTimezone(tomorrow.year, tomorrow.month, tomorrow.day, timezone)}`,
    `This week (Mon-Sun): ${formatLongDateInTimezone(weekStart.year, weekStart.month, weekStart.day, timezone)} through ${formatLongDateInTimezone(weekEnd.year, weekEnd.month, weekEnd.day, timezone)}`,
    `Next Saturday: ${formatLongDateInTimezone(nextSaturday.year, nextSaturday.month, nextSaturday.day, timezone)}`,
    "Upcoming weekdays from today:",
    ...upcomingWeekdays.map((line) => `  ${line}`),
  ].join("\n")
}
