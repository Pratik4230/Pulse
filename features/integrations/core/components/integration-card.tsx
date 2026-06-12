import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type IntegrationCardProps = {
  name: string
  description: string
  icon: LucideIcon
  connected?: boolean
  loading?: boolean
  connectPath?: string
  comingSoon?: boolean
}

export function IntegrationCard({
  name,
  description,
  icon: Icon,
  connected = false,
  loading = false,
  connectPath,
  comingSoon = false,
}: IntegrationCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
          <Icon className="size-5" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{name}</CardTitle>
            {loading ? (
              <Skeleton className="h-5 w-24" />
            ) : comingSoon ? (
              <Badge variant="outline">Coming soon</Badge>
            ) : connected ? (
              <Badge variant="secondary">Connected</Badge>
            ) : (
              <Badge variant="outline">Not connected</Badge>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      {!comingSoon && connectPath ? (
        <CardFooter className="justify-end gap-2 border-t bg-muted/20 px-6 py-4">
          {connected ? (
            <Button variant="outline" asChild>
              <a href={connectPath}>Reconnect</a>
            </Button>
          ) : (
            <Button asChild>
              <a href={connectPath}>Connect</a>
            </Button>
          )}
        </CardFooter>
      ) : null}
    </Card>
  )
}
