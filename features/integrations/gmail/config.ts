import type { IntegrationId } from "@/features/integrations/core/types"

export const gmailIntegration = {
  id: "gmail" satisfies IntegrationId,
  name: "Gmail",
  description: "Read, search, draft, and send email from Pulse.",
  connectPath: "/api/integrations/gmail/connect",
} as const
