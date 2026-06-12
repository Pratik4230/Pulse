export function getAppBaseUrl() {
  const raw =
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"

  return raw.split("#")[0].trim().replace(/\/$/, "")
}

export function getCorsairOAuthRedirectUri() {
  return `${getAppBaseUrl()}/api/integrations/oauth/callback`
}
