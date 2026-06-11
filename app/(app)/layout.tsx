import { Providers } from "@/components/providers"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <TooltipProvider>
        <SidebarProvider className="h-svh overflow-hidden">
          {children}
        </SidebarProvider>
      </TooltipProvider>
    </Providers>
  )
}
