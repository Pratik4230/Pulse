const SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"

type SarvamTranscriptionResponse = {
  transcript: string
  language_code?: string | null
  language_probability?: number | null
}

export async function transcribeAudioWithSarvam(
  audio: Blob,
  filename: string,
): Promise<SarvamTranscriptionResponse> {
  const apiKey = process.env.SARVAM_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("Voice transcription is not configured")
  }

  const formData = new FormData()
  formData.append("file", audio, filename)
  formData.append("model", "saaras:v3")
  formData.append("mode", "codemix")
  formData.append("language_code", "unknown")

  const response = await fetch(SARVAM_STT_URL, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
    },
    body: formData,
  })

  if (!response.ok) {
    let message = "Transcription failed"
    try {
      const body = (await response.json()) as {
        error?: { message?: string }
      }
      message = body.error?.message ?? message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  const body = (await response.json()) as SarvamTranscriptionResponse
  const transcript = body.transcript?.trim()
  if (!transcript) {
    throw new Error("No speech detected")
  }

  return body
}
