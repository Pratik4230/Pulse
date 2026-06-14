import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"

import { db } from "@/db"
import * as authSchema from "@/db/schema/auth"
import { COUNTRY_CODES, getCurrencyByCountry } from "@/lib/currencies"
import { sendEmail, sendOtpEmail } from "@/lib/email"
import { getDefaultTimezone, getTimezoneOptions } from "@/lib/timezones"

function normalizeLocaleFields<T extends Record<string, unknown>>(record: T) {
  const country =
    typeof record.country === "string" ? record.country.trim().toUpperCase() : ""

  if (!country || !COUNTRY_CODES.includes(country)) {
    return record
  }

  const currency = getCurrencyByCountry(country).code
  const timezoneInput =
    typeof record.timezone === "string" ? record.timezone.trim() : ""
  const allowedTimezones = new Set(
    getTimezoneOptions(country).map((option) => option.value),
  )
  const timezone = allowedTimezones.has(timezoneInput)
    ? timezoneInput
    : getDefaultTimezone(country)

  return {
    ...record,
    country,
    currency,
    timezone,
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  user: {
    additionalFields: {
      country: {
        type: "string",
        required: false,
      },
      currency: {
        type: "string",
        required: false,
        input: false,
      },
      timezone: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userRecord) => ({
          data: normalizeLocaleFields(userRecord),
        }),
      },
      update: {
        before: async (userRecord) => ({
          data: normalizeLocaleFields(userRecord),
        }),
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your Pulse password",
        text: `Click the link to reset your password: ${url}`,
      })
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 5,
      async sendVerificationOTP({ email, otp, type }) {
        void sendOtpEmail({ to: email, otp, type })
      },
    }),
    nextCookies(),
  ],
})
