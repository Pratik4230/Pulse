/**
 * Locale + billing currencies aligned with Dodo Payments adaptive currency support
 * (June 2026). Each entry maps one ISO 3166-1 alpha-2 country to its local currency.
 * @see https://docs.dodopayments.com/features/adaptive-currency
 */

export type CurrencyEntry = {
  code: string
  symbol: string
  /** Shown in country pickers */
  name: string
  country: string
  flag: string
}

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "India", country: "IN", flag: "🇮🇳" },
  { code: "USD", symbol: "$", name: "United States", country: "US", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", name: "United Kingdom", country: "GB", flag: "🇬🇧" },
  { code: "EUR", symbol: "€", name: "Germany", country: "DE", flag: "🇩🇪" },
  { code: "EUR", symbol: "€", name: "France", country: "FR", flag: "🇫🇷" },
  { code: "EUR", symbol: "€", name: "Italy", country: "IT", flag: "🇮🇹" },
  { code: "EUR", symbol: "€", name: "Spain", country: "ES", flag: "🇪🇸" },
  { code: "EUR", symbol: "€", name: "Netherlands", country: "NL", flag: "🇳🇱" },
  { code: "EUR", symbol: "€", name: "Ireland", country: "IE", flag: "🇮🇪" },
  { code: "EUR", symbol: "€", name: "Austria", country: "AT", flag: "🇦🇹" },
  { code: "EUR", symbol: "€", name: "Belgium", country: "BE", flag: "🇧🇪" },
  { code: "EUR", symbol: "€", name: "Portugal", country: "PT", flag: "🇵🇹" },
  { code: "EUR", symbol: "€", name: "Finland", country: "FI", flag: "🇫🇮" },
  { code: "AED", symbol: "د.إ", name: "United Arab Emirates", country: "AE", flag: "🇦🇪" },
  { code: "SGD", symbol: "S$", name: "Singapore", country: "SG", flag: "🇸🇬" },
  { code: "CAD", symbol: "CA$", name: "Canada", country: "CA", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australia", country: "AU", flag: "🇦🇺" },
  { code: "JPY", symbol: "¥", name: "Japan", country: "JP", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "China", country: "CN", flag: "🇨🇳" },
  { code: "CHF", symbol: "Fr", name: "Switzerland", country: "CH", flag: "🇨🇭" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand", country: "NZ", flag: "🇳🇿" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong", country: "HK", flag: "🇭🇰" },
  { code: "KRW", symbol: "₩", name: "South Korea", country: "KR", flag: "🇰🇷" },
  { code: "MYR", symbol: "RM", name: "Malaysia", country: "MY", flag: "🇲🇾" },
  { code: "THB", symbol: "฿", name: "Thailand", country: "TH", flag: "🇹🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesia", country: "ID", flag: "🇮🇩" },
  { code: "PHP", symbol: "₱", name: "Philippines", country: "PH", flag: "🇵🇭" },
  { code: "VND", symbol: "₫", name: "Vietnam", country: "VN", flag: "🇻🇳" },
  { code: "TWD", symbol: "NT$", name: "Taiwan", country: "TW", flag: "🇹🇼" },
  { code: "SAR", symbol: "ر.س", name: "Saudi Arabia", country: "SA", flag: "🇸🇦" },
  { code: "QAR", symbol: "ر.ق", name: "Qatar", country: "QA", flag: "🇶🇦" },
  { code: "BDT", symbol: "৳", name: "Bangladesh", country: "BD", flag: "🇧🇩" },
  { code: "NPR", symbol: "Rs", name: "Nepal", country: "NP", flag: "🇳🇵" },
  { code: "LKR", symbol: "Rs", name: "Sri Lanka", country: "LK", flag: "🇱🇰" },
  { code: "BRL", symbol: "R$", name: "Brazil", country: "BR", flag: "🇧🇷" },
  { code: "MXN", symbol: "MX$", name: "Mexico", country: "MX", flag: "🇲🇽" },
  { code: "SEK", symbol: "kr", name: "Sweden", country: "SE", flag: "🇸🇪" },
  { code: "NOK", symbol: "kr", name: "Norway", country: "NO", flag: "🇳🇴" },
  { code: "DKK", symbol: "kr", name: "Denmark", country: "DK", flag: "🇩🇰" },
  { code: "PLN", symbol: "zł", name: "Poland", country: "PL", flag: "🇵🇱" },
  { code: "TRY", symbol: "₺", name: "Turkey", country: "TR", flag: "🇹🇷" },
  { code: "ZAR", symbol: "R", name: "South Africa", country: "ZA", flag: "🇿🇦" },
  { code: "NGN", symbol: "₦", name: "Nigeria", country: "NG", flag: "🇳🇬" },
  { code: "EGP", symbol: "E£", name: "Egypt", country: "EG", flag: "🇪🇬" },
  { code: "ILS", symbol: "₪", name: "Israel", country: "IL", flag: "🇮🇱" },
] as const satisfies readonly CurrencyEntry[]

export type CurrencyCode = (typeof CURRENCIES)[number]["code"]
export type CountryCode = (typeof CURRENCIES)[number]["country"]

export const DEFAULT_CURRENCY = "INR"
export const DEFAULT_COUNTRY = "IN"

export const COUNTRY_CODES: string[] = CURRENCIES.map((entry) => entry.country)

const DODO_SUPPORTED_CURRENCY_CODES = new Set<string>([
  "AED",
  "AUD",
  "BDT",
  "BRL",
  "CAD",
  "CHF",
  "CNY",
  "DKK",
  "EGP",
  "EUR",
  "GBP",
  "HKD",
  "IDR",
  "ILS",
  "INR",
  "JPY",
  "KRW",
  "LKR",
  "MXN",
  "MYR",
  "NGN",
  "NOK",
  "NPR",
  "NZD",
  "PHP",
  "PLN",
  "QAR",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "TWD",
  "USD",
  "VND",
  "ZAR",
])

export function isDodoSupportedCurrency(code: string) {
  return DODO_SUPPORTED_CURRENCY_CODES.has(code.toUpperCase())
}

export function getCurrency(code: string) {
  return (
    CURRENCIES.find((entry) => entry.code === code.toUpperCase()) ?? CURRENCIES[0]
  )
}

export function getCurrencyByCountry(country: string) {
  return (
    CURRENCIES.find((entry) => entry.country === country.toUpperCase()) ??
    CURRENCIES[0]
  )
}

export function getCountryLabel(country: string) {
  const entry = getCurrencyByCountry(country)
  return `${entry.flag} ${entry.name}`
}

/** Format minor units (cents/paise) for display in the user's currency. */
export function formatMoney(
  amountMinor: number,
  currencyCode: string,
  locale = "en",
) {
  const currency = currencyCode.toUpperCase()
  const zeroDecimal = new Set(["JPY", "KRW", "VND", "IDR"])

  const amount = zeroDecimal.has(currency)
    ? amountMinor
    : amountMinor / 100

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: zeroDecimal.has(currency) ? 0 : 2,
  }).format(amount)
}
