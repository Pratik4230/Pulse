import { createBaseMcpServer } from "@corsair-dev/mcp"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

import { corsair } from "@/features/integrations/core/corsair/corsair"
import { ensureCorsairTenant } from "@/features/integrations/core/server/tenant"

import { sendGmailPlainViaCorsair } from "./gmail-send-plain"

type McpSession = {
  server: McpServer
  transport: WebStandardStreamableHTTPServerTransport
}

declare global {
  var __pulseMcpSessions: Map<string, McpSession> | undefined
}

/** Shared across route handlers, in-memory Maps reset per module otherwise. */
const sessions =
  globalThis.__pulseMcpSessions ?? new Map<string, McpSession>()
globalThis.__pulseMcpSessions = sessions

function cleanup(sessionId: string) {
  const session = sessions.get(sessionId)
  if (!session) return

  session.transport.close()
  session.server.close()
  sessions.delete(sessionId)
}

function createTenantMcpServer(tenantId: string) {
  const server = createBaseMcpServer({
    corsair: corsair.withTenant(tenantId),
    setup: false,
    tenantId,
  })

  server.registerTool(
    "gmail_send_plain",
    {
      description:
        "Send a plain-text Gmail message. Use this instead of gmail.api.messages.send in run_script. Accepts to, subject, and body; builds RFC822 server-side via Corsair.",
      inputSchema: z.object({
        to: z.string().email().describe("Recipient email address"),
        subject: z.string().min(1).describe("Email subject line"),
        body: z.string().min(1).describe("Plain-text email body"),
      }),
    },
    async ({ to, subject, body }) => {
      try {
        const result = await sendGmailPlainViaCorsair(tenantId, {
          to,
          subject,
          body,
        })
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to send email: ${message}` }],
        }
      }
    },
  )

  return server
}

function registerSession(
  sessionId: string,
  server: McpServer,
  transport: WebStandardStreamableHTTPServerTransport,
) {
  sessions.set(sessionId, { server, transport })
}

export async function handleMcpRequest(request: Request, tenantId: string) {
  const sessionId = request.headers.get("mcp-session-id")

  if (request.method === "DELETE") {
    if (sessionId) cleanup(sessionId)
    return new Response(null, { status: 200 })
  }

  if (request.method === "GET") {
    if (!sessionId || !sessions.has(sessionId)) {
      return Response.json(
        { error: "Missing or invalid mcp-session-id" },
        { status: 400 },
      )
    }

    return sessions.get(sessionId)!.transport.handleRequest(request)
  }

  if (request.method === "POST") {
    if (sessionId) {
      const session = sessions.get(sessionId)
      if (!session) {
        return Response.json({ error: "Session not found" }, { status: 404 })
      }
      return session.transport.handleRequest(request)
    }

    await ensureCorsairTenant(tenantId)

    const server = createTenantMcpServer(tenantId)
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
      onsessioninitialized: (id) => {
        registerSession(id, server, transport)
      },
      onsessionclosed: (id) => {
        cleanup(id)
      },
    })

    await server.connect(transport)
    const response = await transport.handleRequest(request)

    if (transport.sessionId) {
      registerSession(transport.sessionId, server, transport)
    }

    return response
  }

  return new Response("Method Not Allowed", { status: 405 })
}
