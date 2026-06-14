import { corsair } from "@/features/integrations/core/corsair/corsair"

const CALENDAR_API = "https://www.googleapis.com/calendar/v3"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

type CalendarKeys = {
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

export type CalendarRawEventTime = {
  date?: string
  dateTime?: string
  timeZone?: string
}

export type CalendarRawAttendee = {
  email?: string
  displayName?: string
}

export type CalendarRawEvent = {
  id?: string
  status?: string
  htmlLink?: string
  summary?: string
  description?: string
  location?: string
  start?: CalendarRawEventTime
  end?: CalendarRawEventTime
  attendees?: CalendarRawAttendee[]
  hangoutLink?: string
}

export type CalendarRawListEventsInput = {
  calendarId?: string
  timeMin?: string
  timeMax?: string
  maxResults?: number
  pageToken?: string
  singleEvents?: boolean
  orderBy?: "startTime" | "updated"
  q?: string
}

export type CalendarRawListEventsResponse = {
  items?: CalendarRawEvent[]
  nextPageToken?: string
}

export type CalendarRawCreateEventInput = {
  calendarId?: string
  event: {
    summary: string
    description?: string
    location?: string
    start: CalendarRawEventTime
    end: CalendarRawEventTime
    attendees?: CalendarRawAttendee[]
  }
  sendUpdates?: "all" | "externalOnly" | "none"
}

function getCalendarKeys(tenantId: string): CalendarKeys {
  return corsair.withTenant(tenantId).googlecalendar.keys as CalendarKeys
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>()
const refreshLocks = new Map<string, Promise<string>>()

async function readStoredCalendarToken(tenantId: string) {
  const keys = getCalendarKeys(tenantId)
  const accessToken = await keys.get_access_token()
  const expiresAt = Number((await keys.get_expires_at()) ?? 0)
  return { accessToken, expiresAt }
}

async function refreshCalendarAccessToken(tenantId: string): Promise<string> {
  const inFlight = refreshLocks.get(tenantId)
  if (inFlight) return inFlight

  const refresh = (async () => {
    const keys = getCalendarKeys(tenantId)
    const refreshToken = await keys.get_refresh_token()
    const credentials = await keys.get_integration_credentials()

    if (!refreshToken || !credentials.client_id || !credentials.client_secret) {
      throw new Error("Google Calendar OAuth credentials are missing")
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
      throw new Error(
        `Calendar token refresh failed: ${await response.text()}`,
      )
    }

    const data = (await response.json()) as {
      access_token: string
      expires_in: number
    }

    const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in
    await keys.set_access_token(data.access_token)
    await keys.set_expires_at(String(expiresAt))

    tokenCache.set(tenantId, {
      token: data.access_token,
      expiresAt,
    })

    return data.access_token
  })().finally(() => {
    refreshLocks.delete(tenantId)
  })

  refreshLocks.set(tenantId, refresh)
  return refresh
}

async function resolveCalendarAccessToken(
  tenantId: string,
  forceRefresh = false,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  if (!forceRefresh) {
    const cached = tokenCache.get(tenantId)
    if (cached && cached.expiresAt > now + 300) {
      return cached.token
    }
  } else {
    tokenCache.delete(tenantId)
  }

  const stored = await readStoredCalendarToken(tenantId)
  if (
    !forceRefresh &&
    stored.accessToken &&
    stored.expiresAt > now + 300
  ) {
    tokenCache.set(tenantId, {
      token: stored.accessToken,
      expiresAt: stored.expiresAt,
    })
    return stored.accessToken
  }

  if (stored.accessToken && !forceRefresh) {
    tokenCache.set(tenantId, {
      token: stored.accessToken,
      expiresAt: stored.expiresAt,
    })
    return stored.accessToken
  }

  try {
    return await refreshCalendarAccessToken(tenantId)
  } catch {
    if (stored.accessToken) {
      return stored.accessToken
    }
    throw new Error("Google Calendar is not connected")
  }
}

type CalendarRawFetchOptions = {
  method?: "GET" | "POST" | "DELETE"
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

async function calendarRawFetch<T>(
  tenantId: string,
  path: string,
  options?: CalendarRawFetchOptions,
): Promise<T> {
  let token = await resolveCalendarAccessToken(tenantId)

  async function request(accessToken: string) {
    const url = new URL(`${CALENDAR_API}${path}`)
    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value != null) url.searchParams.set(key, String(value))
      }
    }

    return fetch(url, {
      method: options?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })
  }

  let response = await request(token)

  if (response.status === 401) {
    token = await resolveCalendarAccessToken(tenantId, true)
    response = await request(token)
  }

  if (!response.ok) {
    throw new Error(
      `Calendar API ${response.status}: ${await response.text()}`,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function calendarRawListEvents(
  tenantId: string,
  input: CalendarRawListEventsInput,
): Promise<CalendarRawListEventsResponse> {
  const calendarId = input.calendarId ?? "primary"

  return calendarRawFetch<CalendarRawListEventsResponse>(
    tenantId,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      query: {
        timeMin: input.timeMin,
        timeMax: input.timeMax,
        maxResults: input.maxResults,
        pageToken: input.pageToken,
        singleEvents: input.singleEvents,
        orderBy: input.orderBy,
        q: input.q,
      },
    },
  )
}

export async function calendarRawCreateEvent(
  tenantId: string,
  input: CalendarRawCreateEventInput,
): Promise<CalendarRawEvent> {
  const calendarId = input.calendarId ?? "primary"

  return calendarRawFetch<CalendarRawEvent>(
    tenantId,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      query: { sendUpdates: input.sendUpdates ?? "all" },
      body: input.event,
    },
  )
}

export async function calendarRawDeleteEvent(
  tenantId: string,
  input: { id: string; calendarId?: string; sendUpdates?: "all" | "externalOnly" | "none" },
) {
  const calendarId = input.calendarId ?? "primary"

  return calendarRawFetch<void>(
    tenantId,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(input.id)}`,
    {
      method: "DELETE",
      query: { sendUpdates: input.sendUpdates ?? "all" },
    },
  )
}
