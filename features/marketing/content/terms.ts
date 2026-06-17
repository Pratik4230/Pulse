import type { LegalSection } from "@/features/marketing/content/types"
import { SUPPORT_EMAIL } from "@/lib/site"

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to terms",
    paragraphs: [
      "These Terms of Service (\"Terms\") govern your access to and use of Pulse, operated at pulse.app and associated subdomains. By creating an account or using the service, you agree to these Terms.",
      "If you do not agree, do not use Pulse.",
    ],
  },
  {
    id: "service",
    title: "The service",
    paragraphs: [
      "Pulse provides a web application that connects to your Gmail and Google Calendar accounts to offer inbox management, calendar views, AI-assisted workflows, and real-time synchronization.",
      "We may modify, suspend, or discontinue features at any time. We will make reasonable efforts to notify users of material changes.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts and eligibility",
    paragraphs: [
      "You must provide accurate information when registering. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.",
      "You must be at least 16 years old to use Pulse. You must have the authority to connect any Google account you link to the service.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    paragraphs: ["You agree not to:"],
    bullets: [
      "Use Pulse for unlawful purposes or to violate others' rights.",
      "Attempt to gain unauthorized access to our systems or other users' data.",
      "Reverse engineer, scrape, or overload the service.",
      "Use Pulse to send spam or malicious content through connected Gmail accounts.",
      "Resell or sublicense access to Pulse without written permission.",
    ],
  },
  {
    id: "third-party",
    title: "Third-party services",
    paragraphs: [
      "Pulse integrates with Google Gmail and Google Calendar via OAuth. Your use of those services is subject to Google's terms and policies. We are not responsible for third-party services.",
      "Pulse AI features may use third-party AI providers. Do not submit sensitive information you are not authorized to share.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    paragraphs: [
      "Pulse, including its design, code, and branding, is owned by us and protected by applicable intellectual property laws. You retain ownership of your email and calendar content.",
      "You grant us a limited license to process your content solely to provide the service.",
    ],
  },
  {
    id: "disclaimer",
    title: "Disclaimer of warranties",
    paragraphs: [
      "Pulse is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.",
      "We do not guarantee uninterrupted, error-free, or perfectly synchronized service. Email and calendar data depend on Google APIs and network conditions.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by law, Pulse and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill arising from your use of the service.",
      "Our total liability for any claim related to Pulse shall not exceed the amount you paid us in the twelve months preceding the claim, or one hundred US dollars, whichever is greater.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    paragraphs: [
      "You may stop using Pulse at any time. We may suspend or terminate your account if you violate these Terms or if we reasonably believe your use poses risk to the service or other users.",
      "Upon termination, your right to use Pulse ceases. Provisions that by their nature should survive termination will remain in effect.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing law",
    paragraphs: [
      "These Terms are governed by the laws of India, without regard to conflict of law principles. Disputes shall be resolved in the courts of competent jurisdiction in India, unless otherwise required by applicable consumer protection law.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    paragraphs: [
      `For questions about these Terms, contact us at ${SUPPORT_EMAIL}.`,
    ],
  },
]
