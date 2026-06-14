"use client"

import { useEffect, useMemo } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { CURRENCIES, DEFAULT_COUNTRY } from "@/lib/currencies"
import {
  countryHasMultipleTimezones,
  formatTimezoneLabel,
  getDefaultTimezone,
  getTimezoneOptions,
} from "@/lib/timezones"

type LocaleFieldsProps = {
  country: string
  timezone: string
  onCountryChange: (country: string) => void
  onTimezoneChange: (timezone: string) => void
  countryInvalid?: boolean
  timezoneInvalid?: boolean
  countryErrors?: Array<{ message?: string } | undefined>
  timezoneErrors?: Array<{ message?: string } | undefined>
  idPrefix?: string
}

export function LocaleFields({
  country,
  timezone,
  onCountryChange,
  onTimezoneChange,
  countryInvalid = false,
  timezoneInvalid = false,
  countryErrors,
  timezoneErrors,
  idPrefix = "locale",
}: LocaleFieldsProps) {
  const showTimezonePicker = countryHasMultipleTimezones(country)
  const timezoneOptions = useMemo(() => getTimezoneOptions(country), [country])

  useEffect(() => {
    const allowed = new Set(timezoneOptions.map((option) => option.value))
    if (!allowed.has(timezone)) {
      onTimezoneChange(getDefaultTimezone(country))
    }
  }, [country, timezone, timezoneOptions, onTimezoneChange])

  return (
    <>
      <Field data-invalid={countryInvalid}>
        <FieldLabel htmlFor={`${idPrefix}-country`}>Country</FieldLabel>
        <Select
          value={country || DEFAULT_COUNTRY}
          onValueChange={onCountryChange}
        >
          <SelectTrigger id={`${idPrefix}-country`} aria-invalid={countryInvalid}>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {CURRENCIES.map((entry) => (
              <SelectItem key={entry.country} value={entry.country}>
                {entry.flag} {entry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          Used for local time in calendar and AI scheduling.
        </FieldDescription>
        {countryInvalid && <FieldError errors={countryErrors} />}
      </Field>

      {showTimezonePicker ? (
        <Field data-invalid={timezoneInvalid}>
          <FieldLabel htmlFor={`${idPrefix}-timezone`}>Timezone</FieldLabel>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger
              id={`${idPrefix}-timezone`}
              aria-invalid={timezoneInvalid}
            >
              <SelectValue placeholder="Select your timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezoneOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Your country spans multiple timezones. Pick the one you use.
          </FieldDescription>
          {timezoneInvalid && <FieldError errors={timezoneErrors} />}
        </Field>
      ) : (
        <Field>
          <FieldLabel>Timezone</FieldLabel>
          <p className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {formatTimezoneLabel(timezone)}
          </p>
        </Field>
      )}
    </>
  )
}
