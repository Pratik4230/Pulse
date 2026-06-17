import * as z from "zod"

export const CHAT_MAX_MESSAGE_CHARS = 5000

/** Sarvam REST STT accepts ~30s; we stop recording at 27s for safety. */
export const MAX_VOICE_RECORDING_MS = 27_000

/** ~27s of compressed browser audio at typical bitrates. */
export const MAX_VOICE_RECORDING_BYTES = 2 * 1024 * 1024

export function voiceRecordingFilename(mediaType: string) {
  if (mediaType.includes("webm")) return "recording.webm"
  if (mediaType.includes("ogg")) return "recording.ogg"
  if (mediaType.includes("mp4")) return "recording.mp4"
  if (mediaType.includes("wav")) return "recording.wav"
  if (mediaType.includes("mpeg") || mediaType.includes("mp3")) {
    return "recording.mp3"
  }
  return "recording.webm"
}

const uiMessageSchema = z.looseObject({
  id: z.string().max(200).optional(),
  role: z.string().max(32),
  parts: z.array(z.unknown()).max(200),
})

export const chatSessionIdSchema = z.string().trim().min(1).max(200)

export const chatPostBodySchema = z.object({
  sessionId: chatSessionIdSchema,
  messages: z.array(uiMessageSchema).min(1).max(400),
})

export const chatRouteParamsSchema = z.object({
  id: chatSessionIdSchema,
})

export const chatMessagesQuerySchema = z.object({
  before: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})
