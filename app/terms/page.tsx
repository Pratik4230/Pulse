import type { Metadata } from "next"

import { LegalPage } from "@/features/marketing/components/legal-page"
import { TERMS_SECTIONS } from "@/features/marketing/content/terms"
import { SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
  description: `Terms and conditions for using ${SITE_NAME}.`,
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description={`The rules and guidelines for using ${SITE_NAME}.`}
      updated="June 17, 2026"
      sections={TERMS_SECTIONS}
    />
  )
}
