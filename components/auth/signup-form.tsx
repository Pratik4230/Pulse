"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

import { FormShortcuts } from "@/components/auth/form-shortcuts"
import { SocialButtons } from "@/components/auth/social-buttons"
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { useFormKeyboard } from "@/hooks/use-form-keyboard"
import { signUp } from "@/lib/auth-client"
import { signupSchema } from "@/lib/validations/auth"

const FORM_ID = "signup-form"

export function SignupForm() {
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signupSchema,
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      await signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            toast.success("Check your email for a verification code")
            router.push(
              `/verify-email?email=${encodeURIComponent(value.email)}`,
            )
            router.refresh()
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Could not create account")
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
        <CardTitle>Create your Pulse account</CardTitle>
        <CardDescription>
          Sign up to unify your inbox, calendar, and notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SocialButtons callbackURL="/" />

        <FieldSeparator>or sign up with email</FieldSeparator>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const isInvalid =
                  field.state.meta.isDirty && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-name`}>Name</FieldLabel>
                    <Input
                      id={`${FORM_ID}-name`}
                      name={field.name}
                      type="text"
                      autoComplete="name"
                      autoFocus
                      placeholder="Alex Chen"
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
                      placeholder="you@example.com"
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
                    <FieldLabel htmlFor={`${FORM_ID}-password`}>
                      Password
                    </FieldLabel>
                    <Input
                      id={`${FORM_ID}-password`}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      At least 8 characters with uppercase, lowercase, and a
                      number.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            </form.Field>
            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  field.state.meta.isDirty && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-confirm-password`}>
                      Confirm password
                    </FieldLabel>
                    <Input
                      id={`${FORM_ID}-confirm-password`}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
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
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t">
        <Button
          type="submit"
          form={FORM_ID}
          className="w-full"
          disabled={form.state.isSubmitting}
        >
          Create account
          <Kbd data-icon="inline-end" className="translate-x-0.5">
            ⏎
          </Kbd>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
        <FormShortcuts />
      </CardFooter>
    </Card>
  )
}
