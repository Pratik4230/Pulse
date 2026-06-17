import type { NextConfig } from "next"

function hostnameFromEnvUrl(value: string | undefined) {
  if (!value) return null
  try {
    return new URL(value).hostname
  } catch {
    return null
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    hostnameFromEnvUrl(process.env.BETTER_AUTH_URL),
    hostnameFromEnvUrl(process.env.NEXT_PUBLIC_APP_URL),
  ].filter((host): host is string => Boolean(host)),
}

export default nextConfig
