import * as z from "zod"

import { COUNTRY_CODES } from "@/lib/currencies"

export const countrySchema = z.enum(COUNTRY_CODES as [string, ...string[]], {
  error: "Select your country",
})

export const timezoneSchema = z
  .string()
  .min(1, "Select a timezone")
  .max(100, "Timezone is too long")

export const localeSchema = z.object({
  country: countrySchema,
  timezone: timezoneSchema,
})

export const emailSchema = z
  .email("Enter a valid email address")
  .max(255, "Email must be at most 255 characters")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be at most 50 characters")

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be at most 128 characters"),
})

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirm your password")
      .max(128, "Password must be at most 128 characters"),
    country: countrySchema,
    timezone: timezoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const localeOnboardingSchema = localeSchema

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirm your password")
      .max(128, "Password must be at most 128 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .max(128, "Password must be at most 128 characters"),
    newPassword: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "Confirm your new password")
      .max(128, "Password must be at most 128 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d+$/, "Code must contain only numbers"),
})

export const verifyEmailSearchSchema = z.object({
  email: emailSchema.optional(),
})

export const resetPasswordSearchSchema = z.object({
  token: z.string().min(1).max(2048).optional(),
  error: z.string().max(200).optional(),
})

export type LoginValues = z.infer<typeof loginSchema>
export type SignupValues = z.infer<typeof signupSchema>
export type LocaleOnboardingValues = z.infer<typeof localeOnboardingSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>
export type VerifyEmailSearchValues = z.infer<typeof verifyEmailSearchSchema>
export type ResetPasswordSearchValues = z.infer<
  typeof resetPasswordSearchSchema
>
