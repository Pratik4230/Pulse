export type AppShortcut = {
  keys: string[]
  label: string
  scope?: string
}

/** Matches `features/inbox/components/inbox-workspace.tsx` */
export const INBOX_SHORTCUTS: AppShortcut[] = [
  { keys: ["↑", "↓"], label: "Previous / next message", scope: "Inbox" },
  { keys: ["/"], label: "Focus search", scope: "Inbox" },
  { keys: ["R"], label: "Refresh inbox", scope: "Inbox" },
  { keys: ["Esc"], label: "Clear selection", scope: "Inbox" },
]

/** Matches `features/pulse/components/app-shell.tsx` and `components/ui/sidebar.tsx` */
export const GLOBAL_SHORTCUTS: AppShortcut[] = [
  {
    keys: ["⌘", "K"],
    label: "Open command palette",
    scope: "Global",
  },
  {
    keys: ["⌘", "B"],
    label: "Toggle sidebar",
    scope: "Global",
  },
]

/** Matches `components/theme-provider.tsx` */
export const THEME_SHORTCUT: AppShortcut = {
  keys: ["D"],
  label: "Toggle light / dark theme",
  scope: "Global",
}

/** Matches `features/pulse/components/pulse-chat.tsx` */
export const PULSE_SHORTCUTS: AppShortcut[] = [
  {
    keys: ["Esc"],
    label: "Stop AI reply while streaming",
    scope: "Pulse AI",
  },
]

export const LANDING_SHORTCUT_GROUPS = [
  {
    id: "global",
    title: "Everywhere",
    shortcuts: [...GLOBAL_SHORTCUTS, THEME_SHORTCUT],
  },
  {
    id: "inbox",
    title: "Inbox",
    shortcuts: INBOX_SHORTCUTS,
  },
  {
    id: "pulse",
    title: "Pulse AI",
    shortcuts: PULSE_SHORTCUTS,
  },
] as const

export const HERO_MOCKUP_SHORTCUTS: AppShortcut[] = [
  { keys: ["↑", "↓"], label: "Navigate" },
  { keys: ["/"], label: "Search" },
  { keys: ["⌘", "K"], label: "Command palette" },
]
