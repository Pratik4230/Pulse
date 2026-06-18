import { auth } from "@/lib/auth"
import {
  MAX_VOICE_RECORDING_BYTES,
  voiceRecordingFilename,
} from "@/features/pulse/validations"
import { transcribeAudioWithSarvam } from "@/features/pulse/server/sarvam-transcribe"
import {
  checkTranscribeRateLimit,
  rateLimitJsonResponse,
} from "@/lib/rate-limit"

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const burstLimit = await checkTranscribeRateLimit(session.user.id)
  if (!burstLimit.ok) {
    return rateLimitJsonResponse(burstLimit.reset)
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: "Invalid upload" }, { status: 400 })
  }

  const audio = formData.get("audio")
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "Audio file is required" }, { status: 400 })
  }

  if (audio.size > MAX_VOICE_RECORDING_BYTES) {
    return Response.json({ error: "Recording is too large" }, { status: 400 })
  }

  const filename =
    typeof formData.get("filename") === "string"
      ? String(formData.get("filename"))
      : voiceRecordingFilename(audio.type)

  try {
    const result = await transcribeAudioWithSarvam(audio, filename)
    return Response.json({
      transcript: result.transcript,
      languageCode: result.language_code ?? null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Transcription failed"
    const status = message.includes("not configured") ? 503 : 502
    return Response.json({ error: message }, { status })
  }
}
