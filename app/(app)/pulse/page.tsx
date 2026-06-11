import { ConnectGmailEmpty } from "@/components/pulse/connect-gmail-empty"

export default function PulsePage() {
  return (
    <>
      <section className="flex min-w-0 flex-1 flex-col border-r">
        <div className="flex h-10 shrink-0 items-center border-b px-4">
          <h1 className="text-sm font-medium">Inbox</h1>
        </div>
        <ConnectGmailEmpty />
      </section>
      <section className="hidden min-w-0 flex-1 flex-col lg:flex">
        <div className="flex h-10 shrink-0 items-center border-b px-4">
          <h2 className="text-sm font-medium text-muted-foreground">Preview</h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
          Select a thread to read
        </div>
      </section>
    </>
  )
}
