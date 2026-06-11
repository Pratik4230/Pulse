import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6">
      <Link
        href="/"
        className="font-heading text-lg font-semibold tracking-tight transition-opacity hover:opacity-80"
      >
        Pulse
      </Link>
      {children}
    </div>
  )
}
