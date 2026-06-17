import type { Metadata } from "next"

import { LegalPage } from "@/features/marketing/components/legal-page"
import { PRIVACY_SECTIONS } from "@/features/marketing/content/privacy"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: `How ${SITE_NAME} collects, uses, and protects your data.`,
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description={SITE_DESCRIPTION}
      updated="June 17, 2026"
      sections={PRIVACY_SECTIONS}
    />
  )
}
