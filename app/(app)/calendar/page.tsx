import { CalendarWorkspace } from "@/features/calendar/components/calendar-workspace"
import { AppShell } from "@/features/pulse/components/app-shell"

export default function CalendarPage() {
  return (
    <AppShell title="Calendar">
      <CalendarWorkspace />
    </AppShell>
  )
}
