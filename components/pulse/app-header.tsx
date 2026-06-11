"use client"

import Link from "next/link"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { signOut, useSession } from "@/lib/auth-client"

export function AppHeader() {
  const router = useRouter()
  const { data: session } = useSession()

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out")
          router.push("/login")
          router.refresh()
        },
      },
    })
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
      <Link
        href="/pulse"
        className="font-heading text-sm font-semibold tracking-tight"
      >
        Pulse
      </Link>
      <div className="flex items-center gap-3">
        {session?.user && (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {session.user.name ?? session.user.email}
          </span>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </header>
  )
}
