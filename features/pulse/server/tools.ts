import { tool, type Tool } from "ai"
import { z } from "zod"

import type {
  IntegrationId,
  IntegrationStatus,
} from "@/features/integrations/core/types"
import { gmailRawSendMessage } from "@/features/inbox/server/gmail-raw"

import { scheduleAndNotify } from "./schedule-and-notify"

type CreatePulseToolsInput = {
  tenantId: string
  senderEmail: string
  integrations: Record<IntegrationId, IntegrationStatus>
}

export function createPulseTools({
  tenantId,
  senderEmail,
  integrations,
}: CreatePulseToolsInput) {
  const from = senderEmail.trim()
  if (!from) return {}

  const tools = {} as Record<string, Tool>

  if (integrations.gmail === "connected") {
    tools.pulse_send_email = tool({
      description:
        "Send a plain-text email through the user's Gmail. Use this instead of gmail messages.send.",
      inputSchema: z.object({
        to: z.email(),
        subject: z.string().min(1),
        body: z.string().min(1),
      }),
      execute: async ({ to, subject, body }) => {
        const result = await gmailRawSendMessage(tenantId, {
          from,
          to,
          subject,
          body,
        })

        return {
          success: true,
          to,
          subject,
          messageId: result.id ?? null,
        }
      },
    })
  }

  if (
    integrations.gmail === "connected" &&
    integrations.googlecalendar === "connected"
  ) {
    tools.pulse_schedule_and_email = tool({
      description:
        "Schedule exactly one calendar event with an attendee and send a confirmation email. Use for interview/meeting booking when the user wants calendar + email. Prevents duplicate events.",
      inputSchema: z.object({
        title: z.string().min(1),
        start: z.string().describe("ISO 8601 start datetime"),
        end: z.string().describe("ISO 8601 end datetime"),
        attendeeEmail: z.email(),
        emailSubject: z.string().min(1),
        emailBody: z.string().min(1),
        location: z.string().optional(),
        description: z.string().optional(),
      }),
      execute: async (input) => {
        return scheduleAndNotify(tenantId, from, input)
      },
    })
  }

  return tools
}
