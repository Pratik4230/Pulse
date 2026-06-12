import { generateOAuthUrl } from "corsair/oauth"

import { corsair } from "@/features/integrations/core/corsair/corsair"
import { getCorsairOAuthRedirectUri } from "@/features/integrations/core/lib/oauth"
import type { IntegrationId } from "@/features/integrations/core/types"

import { ensureCorsairTenant } from "./tenant"

export async function startIntegrationOAuth(
  pluginId: IntegrationId,
  tenantId: string,
) {
  await ensureCorsairTenant(tenantId)

  return generateOAuthUrl(corsair, pluginId, {
    tenantId,
    redirectUri: getCorsairOAuthRedirectUri(),
  })
}
