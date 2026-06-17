import type { LegalSection } from "@/features/marketing/content/types"

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    paragraphs: [
      "Pulse (\"we\", \"our\", or \"us\") provides a keyboard-first workspace for Gmail and Google Calendar. This Privacy Policy explains what information we collect, how we use it, and the choices you have when you use our website and application.",
      "By using Pulse, you agree to the collection and use of information in accordance with this policy.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    paragraphs: ["We collect the following categories of information:"],
    bullets: [
      "Account information: email address, name, and authentication credentials when you sign up or sign in (including via Google or GitHub OAuth).",
      "Profile preferences: country, timezone, and currency settings you provide during onboarding.",
      "Google integration data: when you connect Gmail or Google Calendar, we access email metadata, message content, calendar events, and related data necessary to power inbox, calendar, and AI features, only for your account.",
      "Usage data: basic logs required to operate the service (e.g. API requests, error reports, webhook delivery).",
      "AI interactions: messages you send to Pulse AI and related session data to provide and improve the assistant experience.",
    ],
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    paragraphs: ["We use your information solely to provide and improve Pulse:"],
    bullets: [
      "Display and manage your inbox and calendar within the application.",
      "Send transactional emails (verification codes, password reset).",
      "Power Pulse AI features using your connected Google data when you request it.",
      "Maintain security, prevent abuse, and debug service issues.",
      "Comply with legal obligations.",
    ],
  },
  {
    id: "google-data",
    title: "Google user data",
    paragraphs: [
      "Pulse's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.",
      "We do not sell your Google user data. We do not use Gmail or Calendar data for advertising. We do not allow humans to read your email content except where you explicitly request AI assistance, where you give consent for support, or where required by law.",
      "OAuth tokens are stored encrypted. You can disconnect Gmail or Calendar at any time from Settings, Integrations, which revokes our access to fetch new data.",
    ],
  },
  {
    id: "sharing",
    title: "How we share information",
    paragraphs: [
      "We do not sell your personal information. We share data only with service providers that help us run Pulse (hosting, database, email delivery, AI inference), under contracts that require them to protect your data and use it only to provide services to us.",
      "We may disclose information if required by law or to protect the rights, safety, and security of Pulse and our users.",
    ],
  },
  {
    id: "retention",
    title: "Data retention",
    paragraphs: [
      "We retain account and integration data for as long as your account is active. If you delete your account or disconnect an integration, we delete or anonymize associated data within a reasonable period, except where retention is required by law.",
      "Gmail push notification channels expire periodically and are renewed when you reconnect integrations.",
    ],
  },
  {
    id: "security",
    title: "Security",
    paragraphs: [
      "We use industry-standard measures including encryption in transit (HTTPS), encrypted storage of sensitive integration credentials, and access controls on production systems. No method of transmission or storage is 100% secure; we continuously work to protect your data.",
    ],
  },
  {
    id: "your-rights",
    title: "Your rights and choices",
    paragraphs: ["Depending on your location, you may have the right to:"],
    bullets: [
      "Access, correct, or delete your personal data.",
      "Disconnect Google integrations from Settings, Integrations.",
      "Export your data by contacting support.",
      "Object to or restrict certain processing.",
    ],
  },
  {
    id: "children",
    title: "Children's privacy",
    paragraphs: [
      "Pulse is not intended for users under 16. We do not knowingly collect personal information from children.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. We will post the revised policy on this page and update the \"Last updated\" date. Continued use of Pulse after changes constitutes acceptance of the updated policy.",
    ],
  },
]
