import { Providers } from "@/components/providers"
import { AppHeader } from "@/components/pulse/app-header"
import { AppSidebar } from "@/components/pulse/app-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex h-svh flex-col bg-background">
        <AppHeader />
        <div className="flex min-h-0 flex-1">
          <AppSidebar />
          {children}
        </div>
      </div>
    </Providers>
  )
}
