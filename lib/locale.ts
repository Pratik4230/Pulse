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
  ].join("\n")
}
