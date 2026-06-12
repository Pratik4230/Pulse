import type { NextRequest } from "next/server"

import { auth } from "@/lib/auth"

export async function getSessionFromRequest(request: Request | NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  })
}
