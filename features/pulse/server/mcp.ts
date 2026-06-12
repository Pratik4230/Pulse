import { createBaseMcpServer } from "@corsair-dev/mcp"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { corsair } from "@/features/integrations/core/corsair/corsair"
import { ensureCorsairTenant } from "@/features/integrations/core/server/tenant"

type McpSession = {
  server: McpServer
  transport: WebStandardStreamableHTTPServerTransport
}

declare global {
  var __pulseMcpSessions: Map<string, McpSession> | undefined
}

/** Shared across route handlers — in-memory Maps reset per module otherwise. */
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
  return createBaseMcpServer({
    corsair: corsair.withTenant(tenantId),
    setup: false,
    tenantId,
  })
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
