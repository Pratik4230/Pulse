"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { toast } from "sonner"

import { FormShortcuts } from "@/components/auth/form-shortcuts"
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Kbd } from "@/components/ui/kbd"
import { useFormKeyboard } from "@/hooks/use-form-keyboard"
import { emailOtp } from "@/lib/auth-client"
import { verifyOtpSchema } from "@/lib/validations/auth"

const FORM_ID = "verify-email-form"

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [isResending, setIsResending] = useState(false)

  const form = useForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onSubmit: verifyOtpSchema,
      onChange: verifyOtpSchema,
    },
    onSubmit: async ({ value }) => {
      if (!email) {
        toast.error("Missing email — sign up again to receive a code")
        return
      }

      await emailOtp.verifyEmail(
        {
          email,
          otp: value.otp,
        },
        {
          onSuccess: () => {
            toast.success("Email verified — you can sign in now")
            router.push("/login")
            router.refresh()
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? "Invalid or expired code")
          },
        },
      )
    },
  })

  useFormKeyboard({
    formId: FORM_ID,
    onEscape: () => form.reset(),
  })

  async function handleResend() {
    if (!email) {
      toast.error("Missing email — sign up again to receive a code")
      return
    }

    setIsResending(true)
    await emailOtp.sendVerificationOtp(
      {
        email,
        type: "email-verification",
      },
      {
        onSuccess: () => {
          toast.success("New code sent")
        },
        onError: (ctx) => {
          toast.error(ctx.error.message ?? "Could not resend code")
        },
      },
    )
    setIsResending(false)
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          {email ? (
            <>
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </>
          ) : (
            "Enter the 6-digit code from your email"
          )}
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
            <form.Field name="otp">
              {(field) => {
                const isInvalid =
                  field.state.meta.isDirty && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={`${FORM_ID}-otp`}>
                      Verification code
                    </FieldLabel>
                    <InputOTP
                      id={`${FORM_ID}-otp`}
                      maxLength={6}
                      autoFocus
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                      onBlur={field.handleBlur}
                      aria-invalid={isInvalid}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    <FieldDescription>
                      Code expires in 5 minutes.
                    </FieldDescription>
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
          disabled={form.state.isSubmitting || !email}
        >
          Verify email
          <Kbd data-icon="inline-end" className="translate-x-0.5">
            ⏎
          </Kbd>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isResending || !email}
          onClick={handleResend}
        >
          {isResending ? "Sending…" : "Resend code"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Wrong email?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up again
          </Link>
        </p>
        <FormShortcuts />
      </CardFooter>
    </Card>
  )
}
