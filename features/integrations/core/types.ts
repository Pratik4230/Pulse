/** Corsair plugin ids configured in `core/corsair/corsair.ts`. */
export type IntegrationId = "gmail" | "googlecalendar"

export type IntegrationStatus =
  | "connected"
  | "not_connected"
  | "missing_credentials"
