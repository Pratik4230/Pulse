import { useMutation } from "@tanstack/react-query"

import { voiceRecordingFilename } from "@/features/pulse/validations"
import { throwApiError, type ApiErrorBody } from "@/lib/api-client"

type TranscribeResponse = {
  transcript: string
  languageCode: string | null
}

async function transcribeAudio(blob: Blob): Promise<TranscribeResponse> {
  const formData = new FormData()
  formData.append("audio", blob, voiceRecordingFilename(blob.type))

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  })

  const body = (await response.json()) as TranscribeResponse & ApiErrorBody

  if (!response.ok) {
    throwApiError(response.status, body)
  }

  return body
}

export function useTranscribeAudio() {
  return useMutation({
    mutationFn: transcribeAudio,
  })
}
