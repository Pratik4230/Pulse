import { nanoid } from "nanoid"

import { corsair } from "@/features/integrations/core/corsair/corsair"
import { getAppBaseUrl } from "@/features/integrations/core/lib/oauth"
import type { IntegrationId } from "@/features/integrations/core/types"

import { ensureCorsairTenant } from "./tenant"

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

type OAuthKeys = {
  get_access_token: () => Promise<string | null>
  get_expires_at: () => Promise<string | null>
  get_refresh_token: () => Promise<string | null>
  get_integration_credentials: () => Promise<{
    client_id?: string
    client_secret?: string
  }>
  set_access_token: (value: string) => Promise<void>
  set_expires_at: (value: string) => Promise<void>
}

function getWebhookUrl() {
  return new URL("/api/webhooks/corsair", getAppBaseUrl()).toString()
}

function getPluginKeys(tenantId: string, plugin: IntegrationId): OAuthKeys {
  const client = corsair.withTenant(tenantId)
  return (plugin === "gmail" ? client.gmail.keys : client.googlecalendar
    .keys) as OAuthKeys
}

async function getPluginAccessToken(
  tenantId: string,
  plugin: IntegrationId,
): Promise<string> {
  const keys = getPluginKeys(tenantId, plugin)
  const accessToken = await keys.get_access_token()
  const expiresAt = Number((await keys.get_expires_at()) ?? 0)
  const now = Math.floor(Date.now() / 1000)

  if (accessToken && expiresAt > now + 300) {
    return accessToken
  }

  const refreshToken = await keys.get_refresh_token()
  const credentials = await keys.get_integration_credentials()

  if (!refreshToken || !credentials.client_id || !credentials.client_secret) {
    throw new Error(`${plugin} OAuth credentials are missing`)
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to refresh ${plugin} access token`)
  }

  const data = (await response.json()) as {
    access_token: string
    expires_in: number
  }

  await keys.set_access_token(data.access_token)
  await keys.set_expires_at(String(now + data.expires_in))

  return data.access_token
}

async function registerGmailWatch(tenantId: string, webhookUrl: string) {
  const topicName = process.env.GOOGLE_PUBSUB_TOPIC
  if (!topicName) return

  const token = await getPluginAccessToken(tenantId, "gmail")
  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/watch",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topicName,
        labelIds: ["INBOX"],
      }),
    },
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gmail watch registration failed (${response.status}): ${body}`)
  }
}

async function registerCalendarWatch(tenantId: string, webhookUrl: string) {
  const token = await getPluginAccessToken(tenantId, "googlecalendar")
  const channelId = `pulse-${tenantId.slice(0, 8)}-${nanoid(8)}`
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events/watch",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: channelId,
        type: "web_hook",
        address: webhookUrl,
      }),
    },
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Calendar watch registration failed (${response.status}): ${body}`,
    )
  }
}

export async function registerIntegrationWebhooks(
  tenantId: string,
  plugin: IntegrationId,
) {
  await ensureCorsairTenant(tenantId)

  const webhookUrl = getWebhookUrl()

  if (plugin === "gmail") {
    await registerGmailWatch(tenantId, webhookUrl)
    return
  }

  await registerCalendarWatch(tenantId, webhookUrl)
}
