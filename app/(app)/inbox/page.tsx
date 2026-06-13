import { InboxWorkspace } from "@/features/inbox/components/inbox-workspace"
import { AppShell } from "@/features/pulse/components/app-shell"

export default function InboxPage() {
  return (
    <AppShell title="Inbox">
      <InboxWorkspace />
    </AppShell>
  )
}
