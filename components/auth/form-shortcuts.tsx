import { Kbd, KbdGroup } from "@/components/ui/kbd"

export function FormShortcuts() {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd>Tab</Kbd>
        </KbdGroup>
        navigate
      </span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd>Enter</Kbd>
        </KbdGroup>
        submit
      </span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd>Esc</Kbd>
        </KbdGroup>
        reset
      </span>
    </p>
  )
}
