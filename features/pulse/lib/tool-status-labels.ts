import { getToolName, isToolUIPart, type ToolUIPart, type UIMessage } from "ai"

/** Internal Corsair discovery tools, no UI noise. */
const HIDDEN_TOOLS = new Set([
  "list_operations",
  "get_schema",
  "corsair_setup",
])

const TOOL_STATUS_LABELS: Record<string, string> = {
  gmail_send_plain: "Sending email",
  web_search: "Researching",
}

const FINISHED_TOOL_STATES: ToolUIPart["state"][] = [
  "output-available",
  "output-denied",
  "approval-responded",
]

function getRunScriptLabel(input: unknown) {
  const code =
    typeof input === "object" &&
    input !== null &&
    "code" in input &&
    typeof input.code === "string"
      ? input.code
      : ""

  if (/events\.create|googlecalendar\.api\.events\.create/i.test(code)) {
    return "Creating calendar event"
  }
  if (/events\.getmany|events\.getMany|getavailability/i.test(code)) {
    return "Checking calendar"
  }
  if (/events\.delete/i.test(code)) {
    return "Removing calendar event"
  }
  if (/events\.update/i.test(code)) {
    return "Updating calendar event"
  }
  if (/gmail|messages\.send|threads\./i.test(code)) {
    return "Working with email"
  }
  if (/labels\.|drafts\./i.test(code)) {
    return "Updating inbox"
  }

  return "Working on your request"
}

export function getToolStatusLabel(
  toolName: string,
  input?: unknown,
) {
  if (toolName === "run_script") {
    return getRunScriptLabel(input)
  }

  return TOOL_STATUS_LABELS[toolName] ?? "Working on your request"
}

export type ActiveToolStatus = {
  label: string
  isError: boolean
}

export function getActiveToolStatusLine(
  parts: UIMessage["parts"],
): ActiveToolStatus | null {
  let active: ActiveToolStatus | null = null

  for (const part of parts) {
    if (!isToolUIPart(part)) continue

    const toolName = getToolName(part)
    if (HIDDEN_TOOLS.has(toolName)) continue

    if (part.state === "output-error") {
      return {
        label: `${getToolStatusLabel(toolName, part.input)} failed`,
        isError: true,
      }
    }

    if (FINISHED_TOOL_STATES.includes(part.state)) {
      continue
    }

    active = {
      label: getToolStatusLabel(toolName, part.input),
      isError: false,
    }
  }

  return active
}
