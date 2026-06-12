import type { IntegrationId } from "@/features/integrations/core/types"

export const calendarIntegration = {
  id: "googlecalendar" satisfies IntegrationId,
  name: "Google Calendar",
  description: "View and manage calendar events and invites.",
  connectPath: "/api/integrations/calendar/connect",
} as const
