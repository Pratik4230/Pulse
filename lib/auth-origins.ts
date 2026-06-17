function originFromEnvUrl(value: string | undefined) {
  if (!value) return null

  try {
    return new URL(value.split("#")[0].trim()).origin
  } catch {
    return null
  }
}

export function getAuthTrustedOrigins() {
  const origins = new Set<string>([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ])

  for (const envVar of [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ]) {
    const origin = originFromEnvUrl(envVar)
    if (origin) origins.add(origin)
  }

  return [...origins]
}
