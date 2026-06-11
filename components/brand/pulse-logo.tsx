import Image from "next/image"

import { cn } from "@/lib/utils"

export const PULSE_ICON_PATH = "/PulseIcon.png"

type PulseLogoProps = {
  size?: number
  className?: string
  imageClassName?: string
  showLabel?: boolean
  labelClassName?: string
  priority?: boolean
}

export function PulseLogo({
  size = 32,
  className,
  imageClassName,
  showLabel = false,
  labelClassName,
  priority = false,
}: PulseLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={PULSE_ICON_PATH}
        alt="Pulse"
        width={size}
        height={size}
        priority={priority}
        className={cn("shrink-0 rounded-lg", imageClassName)}
      />
      {showLabel && (
        <span
          className={cn(
            "font-heading text-lg font-semibold tracking-tight",
            labelClassName,
          )}
        >
          Pulse
        </span>
      )}
    </div>
  )
}
