import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import type { auth } from "@/lib/auth"

function getAuthBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
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
