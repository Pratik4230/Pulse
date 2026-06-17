import { googlecalendar } from "@corsair-dev/googlecalendar"
import { gmail } from "@corsair-dev/gmail"
import { createCorsair } from "corsair"

import { pool } from "@/db"
import { notifyWebhookSync } from "@/features/integrations/core/server/webhook-sync"

function getKek() {
  const kek = process.env.CORSAIR_KEK
  if (!kek) {
    throw new Error("CORSAIR_KEK is not set")
  }
  return kek
}

function webhookAfter(plugin: "gmail" | "googlecalendar") {
  return async (
    ctx: { tenantId?: string },
    response: { success?: boolean } | undefined,
  ) => {
    if (response?.success) {
      notifyWebhookSync(ctx.tenantId, plugin)
    }
  }
}

export const corsair = createCorsair({
  plugins: [
    gmail({
      webhookHooks: {
        messageChanged: {
          after: webhookAfter("gmail"),
        },
      },
    }),
    googlecalendar({
      webhookHooks: {
        onEventChanged: {
          after: webhookAfter("googlecalendar"),
        },
      },
    }),
  ],
  database: pool,
  kek: getKek(),
  multiTenancy: true,
})
