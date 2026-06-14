/**
 * Compare Corsair Gmail plugin vs raw Gmail REST API.
 *
 * Run:  bun run benchmark:gmail
 *       BENCHMARK_TENANT_ID=your-user-id bun run benchmark:gmail
 *
 * Does NOT change production code, diagnostic only.
 */

import "dotenv/config"

import { eq } from "drizzle-orm"
import { setupCorsair } from "corsair/setup"

import { db } from "@/db"
import { corsairAccounts, corsairIntegrations } from "@/db/schema/corsair"
import { corsair } from "@/features/integrations/core/corsair/corsair"

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1"
const PAGE_SIZE = 12
const SAMPLE_GETS = 3

type TimedResult<T> = {
  label: string
  ms: number
  detail?: string
  data?: T
}

async function time<T>(
  label: string,
  fn: () => Promise<T>,
  detail?: (result: T) => string,
): Promise<TimedResult<T>> {
  const start = performance.now()
  const data = await fn()
  const ms = Math.round(performance.now() - start)
  return { label, ms, detail: detail?.(data), data }
}

function printResult(result: TimedResult<unknown>) {
  const suffix = result.detail ? `, ${result.detail}` : ""
  console.log(`  ${result.label.padEnd(42)} ${String(result.ms).padStart(6)}ms${suffix}`)
}

async function resolveTenantId(): Promise<string> {
  const fromEnv = process.env.BENCHMARK_TENANT_ID?.trim()
  if (fromEnv) return fromEnv

  const rows = await db
    .select({ tenantId: corsairAccounts.tenantId })
    .from(corsairAccounts)
    .innerJoin(
      corsairIntegrations,
      eq(corsairAccounts.integrationId, corsairIntegrations.id),
    )
    .where(eq(corsairIntegrations.name, "gmail"))
    .limit(1)

  const tenantId = rows[0]?.tenantId
  if (!tenantId) {
    throw new Error(
      "No Gmail tenant found. Set BENCHMARK_TENANT_ID to your Better Auth user id.",
    )
  }

  return tenantId
}

async function rawFetch<T>(
  token: string,
  path: string,
  query?: Record<string, string | number | undefined>,
  metadataHeaders?: string[],
): Promise<T> {
  const url = new URL(`${GMAIL_API}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null) url.searchParams.set(key, String(value))
    }
  }
  if (metadataHeaders) {
    for (const header of metadataHeaders) {
      url.searchParams.append("metadataHeaders", header)
    }
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Gmail API ${response.status}: ${await response.text()}`)
  }

  return response.json() as Promise<T>
}

async function main() {
  const tenantId = await resolveTenantId()
  console.log(`\nGmail benchmark, tenant: ${tenantId}\n`)

  const setup = await time("setupCorsair", () =>
    setupCorsair(corsair, { tenantId }),
  )
  printResult(setup)

  const gmail = corsair.withTenant(tenantId).gmail
  const token = await gmail.keys.get_access_token()
  if (!token) {
    throw new Error("No Gmail access token, connect Gmail first.")
  }
  console.log("  access token loaded\n")

  console.log("── messages.list (INBOX, 12 items) ──")
  const corsairList = await time(
    "Corsair  messages.list",
    () =>
      gmail.api.messages.list({
        labelIds: ["INBOX"],
        maxResults: PAGE_SIZE,
      }),
    (r) => `${r.messages?.length ?? 0} stubs`,
  )
  printResult(corsairList)

  const rawList = await time(
    "Raw API  messages.list",
    () =>
      rawFetch<{ messages?: { id?: string }[] }>(
        token,
        "/users/me/messages",
        { labelIds: "INBOX", maxResults: PAGE_SIZE },
      ),
    (r) => `${r.messages?.length ?? 0} stubs`,
  )
  printResult(rawList)

  const ids =
    corsairList.data?.messages
      ?.map((message) => message.id)
      .filter((id): id is string => Boolean(id))
      .slice(0, SAMPLE_GETS) ?? []

  if (ids.length === 0) {
    console.log("\nNo message ids to benchmark gets.")
    return
  }

  console.log(`\n── messages.get x${ids.length} (same ids, sequential) ──`)

  for (const id of ids) {
    const shortId = `${id.slice(0, 8)}…`

    const corsairMinimal = await time(`Corsair  get minimal ${shortId}`, () =>
      gmail.api.messages.get({ id, format: "minimal" }),
    )
    printResult(corsairMinimal)

    const rawMinimal = await time(`Raw API  get minimal ${shortId}`, () =>
      rawFetch(token, `/users/me/messages/${id}`, { format: "minimal" }),
    )
    printResult(rawMinimal)
  }

  console.log(`\n── messages.get metadata (1 id, Corsair vs raw correct params) ──`)
  const metaId = ids[0]

  const corsairMeta = await time("Corsair  get metadata", () =>
    gmail.api.messages.get({
      id: metaId,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    }),
  )
  printResult(corsairMeta)

  const rawMeta = await time("Raw API  get metadata", () =>
    rawFetch(token, `/users/me/messages/${metaId}`, { format: "metadata" }, [
      "From",
      "Subject",
      "Date",
    ]),
  )
  printResult(rawMeta)

  console.log(`\n── messages.get full x${ids.length} (parallel) ──`)

  const corsairFullParallel = await time(
    "Corsair  get full (parallel)",
    () =>
      Promise.all(
        ids.map((id) => gmail.api.messages.get({ id, format: "full" })),
      ),
    (r) => `${r.length} messages`,
  )
  printResult(corsairFullParallel)

  const rawFullParallel = await time(
    "Raw API  get full (parallel)",
    () =>
      Promise.all(
        ids.map((id) =>
          rawFetch(token, `/users/me/messages/${id}`, { format: "full" }),
        ),
      ),
    (r) => `${r.length} messages`,
  )
  printResult(rawFullParallel)

  console.log(`\n── Corsair DB read (findManyByEntityIds) ──`)
  const dbRead = await time("Corsair  db.findManyByEntityIds", () =>
    gmail.db.messages.findManyByEntityIds(ids),
  )
  printResult(dbRead)

  const listRatio = corsairList.ms / Math.max(rawList.ms, 1)
  const fullRatio = corsairFullParallel.ms / Math.max(rawFullParallel.ms, 1)

  console.log(`
── Summary ──
  list:  Corsair is ~${listRatio.toFixed(1)}x slower than raw (${corsairList.ms}ms vs ${rawList.ms}ms)
  full:  Corsair is ~${fullRatio.toFixed(1)}x slower than raw (${corsairFullParallel.ms}ms vs ${rawFullParallel.ms}ms)

Likely Corsair overhead (not Google):
  • Sequential DB upsert after messages.list (one row per message)
  • DB upsert + body/header extraction after every messages.get
  • setupCorsair / credential checks on cold paths
  • Event logging (logEventFromContext)

Raw Gmail API latency alone is usually hundreds of ms, not 5-10s.
Switching inbox to raw API (with stored OAuth tokens) would likely help a lot,
but you'd lose Corsair's automatic DB cache unless you add your own.
`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
