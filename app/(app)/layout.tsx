import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { Providers } from "@/components/providers"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { auth } from "@/lib/auth"
import { userHasLocale } from "@/lib/locale"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null

  try {
    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch {
    redirect("/login?error=db")
  }

  if (session && !userHasLocale(session.user)) {
    redirect("/onboarding/locale")
  }

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
