"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { useFormKeyboard } from "@/features/auth/hooks/use-form-keyboard"
import { resetPassword } from "@/lib/auth-client"
import { resetPasswordSchema } from "@/features/auth/validations"

const FORM_ID = "reset-password-form"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const error = searchParams.get("error")

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Reset link is invalid or expired")
        return
      }

      await resetPassword(
        {
          newPassword: value.password,
          token,
        },
        {
          onSuccess: () => {
            toast.success("Password updated. You can sign in now")
            router.push("/login")
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Could not reset password")
          },
        },
      )
    },
  })

  useFormKeyboard({
    formId: FORM_ID,
    onEscape: () => form.reset(),
  })

  if (error || !token) {
    return (
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Link expired</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired. Request a new
            one to continue.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3 border-t">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
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
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isDirty && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-password`}>
                      New password
                    </FieldLabel>
                    <Input
                      id={`${FORM_ID}-password`}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      autoFocus
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
                      Confirm new password
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
          Update password
          <Kbd data-icon="inline-end" className="translate-x-0.5">
            ⏎
          </Kbd>
        </Button>
        <FormShortcuts />
      </CardFooter>
    </Card>
  )
}
