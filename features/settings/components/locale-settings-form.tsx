"use client"

import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { LocaleFields } from "@/features/auth/components/locale-fields"
import { localeOnboardingSchema } from "@/features/auth/validations"
import { updateUser } from "@/lib/auth-client"
import { getCurrencyByCountry } from "@/lib/currencies"
import { getDefaultTimezone } from "@/lib/timezones"

type LocaleSettingsFormProps = {
  country: string
  timezone: string
}

export function LocaleSettingsForm({
  country,
  timezone,
}: LocaleSettingsFormProps) {
  const router = useRouter()

  const form = useForm({
    defaultValues: { country, timezone },
    validators: {
      onSubmit: localeOnboardingSchema,
      onChange: localeOnboardingSchema,
    },
    onSubmit: async ({ value }) => {
      await updateUser(
        {
          country: value.country,
          timezone: value.timezone,
        },
        {
          onSuccess: () => {
            const currency = getCurrencyByCountry(value.country).code
            toast.success(`Locale updated (${currency})`)
            router.refresh()
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Could not update locale")
          },
        },
      )
    },
  })

  const selectedCountry = form.state.values.country
  const currentCurrency = getCurrencyByCountry(selectedCountry).code

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locale and currency</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Currency is derived from country. Current currency: {currentCurrency}.
        </p>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <form.Field name="country">
              {(countryField) => (
                <form.Field name="timezone">
                  {(timezoneField) => (
                    <LocaleFields
                      country={countryField.state.value}
                      timezone={timezoneField.state.value}
                      onCountryChange={(nextCountry) => {
                        countryField.handleChange(nextCountry)
                        timezoneField.handleChange(getDefaultTimezone(nextCountry))
                      }}
                      onTimezoneChange={timezoneField.handleChange}
                      countryInvalid={
                        countryField.state.meta.isDirty &&
                        !countryField.state.meta.isValid
                      }
                      timezoneInvalid={
                        timezoneField.state.meta.isDirty &&
                        !timezoneField.state.meta.isValid
                      }
                      countryErrors={countryField.state.meta.errors}
                      timezoneErrors={timezoneField.state.meta.errors}
                      idPrefix="settings-locale"
                    />
                  )}
                </form.Field>
              )}
            </form.Field>
          </FieldGroup>
          <Button type="submit" disabled={form.state.isSubmitting}>
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
