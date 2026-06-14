import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "@/lib/auth"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [emailOTPClient(), inferAdditionalFields<typeof auth>()],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset,
  resetPassword,
  changePassword,
  emailOtp,
  updateUser,
} = authClient
