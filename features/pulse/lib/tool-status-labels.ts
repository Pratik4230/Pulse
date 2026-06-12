import { getToolName, type ToolUIPart } from "ai"

/** Internal Corsair discovery tools — no UI noise. */
const HIDDEN_TOOLS = new Set([
  "list_operations",
  "get_schema",
  "corsair_setup",
])

const TOOL_STATUS_LABELS: Record<string, string> = {
  run_script: "Working on your request",
}

export function getToolStatusLabel(toolName: string) {
  return TOOL_STATUS_LABELS[toolName] ?? "Working on your request"
}

export function getToolStatusLabelFromPart(
  part: Parameters<typeof getToolName>[0],
) {
  return getToolStatusLabel(getToolName(part))
}

const HIDDEN_TOOL_STATES: ToolUIPart["state"][] = [
  "output-available",
  "output-denied",
  "approval-responded",
]

export function shouldShowToolActivity(
  toolName: string,
  state: ToolUIPart["state"],
) {
  if (HIDDEN_TOOLS.has(toolName)) return false
  return !HIDDEN_TOOL_STATES.includes(state)
}
