"use client"

import Link from "next/link"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

import { FormShortcuts } from "@/features/auth/components/form-shortcuts"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { useFormKeyboard } from "@/features/auth/hooks/use-form-keyboard"
import { requestPasswordReset } from "@/lib/auth-client"
import { forgotPasswordSchema } from "@/features/auth/validations"

const FORM_ID = "forgot-password-form"

export function ForgotPasswordForm() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await requestPasswordReset(
        {
          email: value.email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
        {
          onSuccess: () => {
            toast.success("If an account exists, a reset link was sent")
            form.reset()
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Could not send reset email")
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
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to reset your
          password.
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
          Send reset link
          <Kbd data-icon="inline-end" className="translate-x-0.5">
            ⏎
          </Kbd>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
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
