import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const from = process.env.RESEND_FROM_EMAIL ?? "Pulse <onboarding@resend.dev>"

type SendEmailInput = {
  to: string
  subject: string
  text: string
}

export async function sendEmail({ to, subject, text }: SendEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to)
    return
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
  })

  if (error) {
    console.error("[email] Resend error:", error)
    throw new Error(error.message)
  }
}
