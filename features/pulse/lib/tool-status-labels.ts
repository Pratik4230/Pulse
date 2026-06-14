import { getToolName, type ToolUIPart } from "ai"

/** Internal Corsair discovery tools, no UI noise. */
const HIDDEN_TOOLS = new Set([
  "list_operations",
  "get_schema",
  "corsair_setup",
])

const TOOL_STATUS_LABELS: Record<string, string> = {
  run_script: "Working on your request",
  gmail_send_plain: "Sending email",
  web_search: "Searching the web",
}

const COMPLETED_TOOL_LABELS: Record<string, string> = {
  gmail_send_plain: "Email sent",
  web_search: "Research complete",
}

const VISIBLE_COMPLETED_TOOLS = new Set(Object.keys(COMPLETED_TOOL_LABELS))

export function getToolStatusLabel(toolName: string, state?: ToolUIPart["state"]) {
  if (state === "output-available" && COMPLETED_TOOL_LABELS[toolName]) {
    return COMPLETED_TOOL_LABELS[toolName]
  }

  return TOOL_STATUS_LABELS[toolName] ?? "Working on your request"
}

export function getToolStatusLabelFromPart(
  part: Parameters<typeof getToolName>[0] & { state?: ToolUIPart["state"] },
) {
  return getToolStatusLabel(getToolName(part), part.state)
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
  if (VISIBLE_COMPLETED_TOOLS.has(toolName) && state === "output-available") {
    return true
  }
  return !HIDDEN_TOOL_STATES.includes(state)
}

export function isCompletedToolActivity(
  toolName: string,
  state: ToolUIPart["state"],
) {
  return VISIBLE_COMPLETED_TOOLS.has(toolName) && state === "output-available"
}
