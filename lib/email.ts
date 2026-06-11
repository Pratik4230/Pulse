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
  }
}

type OtpEmailType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email"

const otpSubjects: Record<OtpEmailType, string> = {
  "email-verification": "Verify your Pulse email",
  "sign-in": "Your Pulse sign-in code",
  "forget-password": "Reset your Pulse password",
  "change-email": "Confirm your new Pulse email",
}

export async function sendOtpEmail({
  to,
  otp,
  type,
}: {
  to: string
  otp: string
  type: OtpEmailType
}) {
  const subject = otpSubjects[type]
  const text =
    type === "email-verification"
      ? `Your Pulse verification code is ${otp}. It expires in 5 minutes.`
      : type === "change-email"
        ? `Your Pulse email change code is ${otp}. It expires in 5 minutes.`
        : `Your Pulse code is ${otp}. It expires in 5 minutes.`

  await sendEmail({ to, subject, text })
}
