import { DEFAULT_COUNTRY } from "@/lib/currencies"

export type TimezoneOption = {
  value: string
  label: string
}

const COUNTRY_DEFAULT_TIMEZONE: Record<string, string> = {
  IN: "Asia/Kolkata",
  US: "America/New_York",
  DE: "Europe/Berlin",
  FR: "Europe/Paris",
  IT: "Europe/Rome",
  ES: "Europe/Madrid",
  NL: "Europe/Amsterdam",
  IE: "Europe/Dublin",
  AT: "Europe/Vienna",
  BE: "Europe/Brussels",
  PT: "Europe/Lisbon",
  FI: "Europe/Helsinki",
  GB: "Europe/London",
  AE: "Asia/Dubai",
  SG: "Asia/Singapore",
  CA: "America/Toronto",
  AU: "Australia/Sydney",
  JP: "Asia/Tokyo",
  CN: "Asia/Shanghai",
  CH: "Europe/Zurich",
  NZ: "Pacific/Auckland",
  HK: "Asia/Hong_Kong",
  KR: "Asia/Seoul",
  MY: "Asia/Kuala_Lumpur",
  TH: "Asia/Bangkok",
  ID: "Asia/Jakarta",
  PH: "Asia/Manila",
  VN: "Asia/Ho_Chi_Minh",
  TW: "Asia/Taipei",
  SA: "Asia/Riyadh",
  QA: "Asia/Qatar",
  BD: "Asia/Dhaka",
  NP: "Asia/Kathmandu",
  LK: "Asia/Colombo",
  BR: "America/Sao_Paulo",
  MX: "America/Mexico_City",
  SE: "Europe/Stockholm",
  NO: "Europe/Oslo",
  DK: "Europe/Copenhagen",
  PL: "Europe/Warsaw",
  TR: "Europe/Istanbul",
  ZA: "Africa/Johannesburg",
  NG: "Africa/Lagos",
  EG: "Africa/Cairo",
  IL: "Asia/Jerusalem",
}

const MULTI_TIMEZONE_COUNTRIES: Record<string, TimezoneOption[]> = {
  US: [
    { value: "America/New_York", label: "Eastern (ET)" },
    { value: "America/Chicago", label: "Central (CT)" },
    { value: "America/Denver", label: "Mountain (MT)" },
    { value: "America/Los_Angeles", label: "Pacific (PT)" },
    { value: "America/Phoenix", label: "Arizona" },
    { value: "America/Anchorage", label: "Alaska" },
    { value: "Pacific/Honolulu", label: "Hawaii" },
  ],
  CA: [
    { value: "America/Toronto", label: "Eastern" },
    { value: "America/Winnipeg", label: "Central" },
    { value: "America/Edmonton", label: "Mountain" },
    { value: "America/Vancouver", label: "Pacific" },
    { value: "America/Halifax", label: "Atlantic" },
  ],
  AU: [
    { value: "Australia/Sydney", label: "Sydney (AEST)" },
    { value: "Australia/Melbourne", label: "Melbourne" },
    { value: "Australia/Brisbane", label: "Brisbane" },
    { value: "Australia/Adelaide", label: "Adelaide" },
    { value: "Australia/Perth", label: "Perth" },
  ],
  BR: [
    { value: "America/Sao_Paulo", label: "Brasília" },
    { value: "America/Manaus", label: "Amazon" },
    { value: "America/Fortaleza", label: "Fortaleza" },
  ],
  MX: [
    { value: "America/Mexico_City", label: "Central Mexico" },
    { value: "America/Tijuana", label: "Pacific Mexico" },
    { value: "America/Cancun", label: "Eastern Mexico" },
  ],
  ID: [
    { value: "Asia/Jakarta", label: "Western (WIB)" },
    { value: "Asia/Makassar", label: "Central (WITA)" },
    { value: "Asia/Jayapura", label: "Eastern (WIT)" },
  ],
}

export function getDefaultTimezone(country: string) {
  return COUNTRY_DEFAULT_TIMEZONE[country] ?? COUNTRY_DEFAULT_TIMEZONE[DEFAULT_COUNTRY]
}

export function countryHasMultipleTimezones(country: string) {
  return country in MULTI_TIMEZONE_COUNTRIES
}

export function getTimezoneOptions(country: string): TimezoneOption[] {
  const options = MULTI_TIMEZONE_COUNTRIES[country]
  if (options) return options

  const fallback = getDefaultTimezone(country)
  return [{ value: fallback, label: formatTimezoneLabel(fallback) }]
}

export function formatTimezoneLabel(timezone: string) {
  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      timeZoneName: "longGeneric",
    })
    const parts = formatter.formatToParts(new Date())
    const zone = parts.find((part) => part.type === "timeZoneName")?.value
    return zone ? `${timezone} (${zone})` : timezone
  } catch {
    return timezone
  }
}

export function formatDateTimeInTimezone(
  value: string | Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: timezone,
    ...options,
  }).format(date)
}

export function getTimezoneOffsetLabel(timezone: string, date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    })
    const parts = formatter.formatToParts(date)
    return parts.find((part) => part.type === "timeZoneName")?.value ?? timezone
  } catch {
    return timezone
  }
}
