"use client"

import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

import { LocaleFields } from "@/features/auth/components/locale-fields"
import { localeOnboardingSchema } from "@/features/auth/validations"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { Kbd } from "@/components/ui/kbd"
import { APP_HOME_PATH } from "@/lib/constants"
import { DEFAULT_COUNTRY } from "@/lib/currencies"
import { getDefaultTimezone } from "@/lib/timezones"
import { updateUser } from "@/lib/auth-client"

const FORM_ID = "locale-onboarding-form"

export function LocaleOnboardingForm() {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      country: DEFAULT_COUNTRY,
      timezone: getDefaultTimezone(DEFAULT_COUNTRY),
    },
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
            toast.success("Locale saved")
            router.push(APP_HOME_PATH)
            router.refresh()
          },
          onError: (ctx) => {
            const message = ctx.error.message ?? "Could not save locale"
            if (
              message.toLowerCase().includes("session") ||
              ctx.error.status === 401
            ) {
              toast.error(
                "Could not verify your session. Check your connection and try again.",
              )
              return
            }
            toast.error(message)
          },
        },
      )
    },
  })

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Set your locale</CardTitle>
        <CardDescription>
          Pulse uses your country and timezone so &quot;Sunday 7am&quot; means
          your local time, not UTC.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id={FORM_ID}
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="country">
              {(countryField) => (
                <form.Field name="timezone">
                  {(timezoneField) => (
                    <LocaleFields
                      country={countryField.state.value}
                      timezone={timezoneField.state.value}
                      onCountryChange={(country) => {
                        countryField.handleChange(country)
                        timezoneField.handleChange(getDefaultTimezone(country))
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
                      idPrefix={FORM_ID}
                    />
                  )}
                </form.Field>
              )}
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="border-t">
        <Button
          type="submit"
          form={FORM_ID}
          className="w-full"
          disabled={form.state.isSubmitting}
        >
          Continue to Pulse
          <Kbd data-icon="inline-end" className="translate-x-0.5">
            ⏎
          </Kbd>
        </Button>
      </CardFooter>
    </Card>
  )
}
