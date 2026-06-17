"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

import { FormShortcuts } from "@/features/auth/components/form-shortcuts"
import { SocialButtons } from "@/features/auth/components/social-buttons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { useFormKeyboard } from "@/features/auth/hooks/use-form-keyboard"
import { signIn } from "@/lib/auth-client"
import { getSafeRedirectPath } from "@/lib/constants"
import { loginSchema } from "@/features/auth/validations"

const FORM_ID = "login-form"

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormContent />
    </Suspense>
  )
}

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = getSafeRedirectPath(searchParams.get("callbackUrl"))

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      await signIn.email(
        {
          email: value.email,
          password: value.password,
          callbackURL: redirectTo,
        },
        {
          onSuccess: () => {
            toast.success("Welcome back")
            router.push(redirectTo)
            router.refresh()
          },
          onError: (ctx) => {
            const message = ctx.error.message ?? "Invalid email or password"
            if (
              ctx.error.status === 403 ||
              message.toLowerCase().includes("not verified")
            ) {
              toast.error("Verify your email before signing in")
              router.push(
                `/verify-email?email=${encodeURIComponent(value.email)}`,
              )
              return
            }
            toast.error(message)
          },
        },
      )
    },
  })

  useFormKeyboard({
    formId: FORM_ID,
    onEscape: () => form.reset(),
  })

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Sign in to Pulse</CardTitle>
        <CardDescription>
          Your keyboard-first command center for email and calendar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SocialButtons callbackURL={redirectTo} />

        <FieldSeparator>or continue with email</FieldSeparator>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isDirty && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-email`}>Email</FieldLabel>
                    <Input
                      id={`${FORM_ID}-email`}
                      name={field.name}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoFocus
                      placeholder="Enter your email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isDirty && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="flex items-center justify-between gap-2">
                      <FieldLabel htmlFor={`${FORM_ID}-password`}>
                        Password
                      </FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id={`${FORM_ID}-password`}
                      name={field.name}
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
          </FieldGroup>
          <Button
            type="button"
            data-form-submit="true"
            className="mt-6 w-full"
            disabled={form.state.isSubmitting}
            onClick={() => void form.handleSubmit()}
          >
            Sign in
            <Kbd data-icon="inline-end" className="translate-x-0.5">
              ⏎
            </Kbd>
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t">
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
        <FormShortcuts />
      </CardFooter>
    </Card>
  )
}
