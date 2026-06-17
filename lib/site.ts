export const SITE_NAME = "Pulse"

export const SITE_TAGLINE =
  "Your keyboard-first command center for email and calendar."

export const SITE_DESCRIPTION =
  "Pulse unifies Gmail, Google Calendar, and AI into one fast workspace. Navigate with shortcuts, use voice input in multiple languages, and let your inbox refresh in real time."

export const SUPPORT_EMAIL = "pratikjadhav9534@gmail.com"

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000"

  return raw.split("#")[0].trim().replace(/\/$/, "")
}
