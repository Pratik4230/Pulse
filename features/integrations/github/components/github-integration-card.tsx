import { Code2 } from "lucide-react"

import { IntegrationCard } from "@/features/integrations/core/components/integration-card"

import { githubIntegration } from "../config"

export function GithubIntegrationCard() {
  return (
    <IntegrationCard
      name={githubIntegration.name}
      description={githubIntegration.description}
      icon={Code2}
      comingSoon
    />
  )
}
