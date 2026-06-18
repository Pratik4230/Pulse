import { toast } from "sonner"

import { RATE_LIMIT_ERROR_CODE } from "@/lib/rate-limit-constants"

const RATE_LIMIT_TOAST_ID = "pulse-rate-limit"

export type ApiErrorBody = {
  error?: string
  code?: string
  retryAfterSeconds?: number
}

export class ApiError extends Error {
  readonly code?: string
  readonly status: number
  readonly retryAfterSeconds?: number

  constructor(
    message: string,
    options: {
      code?: string
      status: number
      retryAfterSeconds?: number
    },
  ) {
    super(message)
    this.name = "ApiError"
    this.code = options.code
    this.status = options.status
    this.retryAfterSeconds = options.retryAfterSeconds
  }
}

export function isRateLimitError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return (
      error.code === RATE_LIMIT_ERROR_CODE ||
      error.status === 429
    )
  }

  if (error instanceof Error) {
    const extended = error as Error & {
      code?: string
      status?: number
    }

    return (
      extended.code === RATE_LIMIT_ERROR_CODE ||
      extended.status === 429 ||
      error.message.includes("Too many requests")
    )
  }

  return false
}

export function getRateLimitRetrySeconds(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.retryAfterSeconds
  }

  const extended = error as { retryAfterSeconds?: number }
  return extended.retryAfterSeconds
}

export function formatRateLimitMessage(retryAfterSeconds?: number) {
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    const unit = retryAfterSeconds === 1 ? "second" : "seconds"
    return `You're sending requests too quickly. Try again in ${retryAfterSeconds} ${unit}.`
  }

  return "You're sending requests too quickly. Please wait a moment and try again."
}

export function notifyRateLimitError(error?: unknown) {
  const retryAfterSeconds = error
    ? getRateLimitRetrySeconds(error)
    : undefined

  toast.error(formatRateLimitMessage(retryAfterSeconds), {
    id: RATE_LIMIT_TOAST_ID,
    duration: Math.max(4_000, (retryAfterSeconds ?? 5) * 1_000),
  })
}

async function readErrorBody(response: Response): Promise<ApiErrorBody> {
  return (await response.json().catch(() => ({}))) as ApiErrorBody
}

export async function assertOkResponse(response: Response): Promise<void> {
  if (response.ok) {
    return
  }

  const body = await readErrorBody(response)
  throwApiError(response.status, body)
}

export function throwApiError(status: number, body: ApiErrorBody): never {
  throw new ApiError(body.error ?? "Request failed", {
    code: body.code,
    status,
    retryAfterSeconds: body.retryAfterSeconds,
  })
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init)
  await assertOkResponse(response)
  return response.json() as Promise<T>
}
