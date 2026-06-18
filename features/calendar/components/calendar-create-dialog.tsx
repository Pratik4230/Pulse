"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useCreateCalendarEvent } from "../hooks/use-calendar-events"

type CalendarCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function defaultStartValue() {
  const date = new Date()
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0)
  return toLocalInputValue(date)
}

function defaultEndValue() {
  const date = new Date()
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0)
  date.setHours(date.getHours() + 1)
  return toLocalInputValue(date)
}

function toLocalInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toIsoFromLocalInput(value: string) {
  return new Date(value).toISOString()
}

export function CalendarCreateDialog({
  open,
  onOpenChange,
}: CalendarCreateDialogProps) {
  const [title, setTitle] = useState("")
  const [start, setStart] = useState(defaultStartValue)
  const [end, setEnd] = useState(defaultEndValue)
  const [attendees, setAttendees] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")

  const createEvent = useCreateCalendarEvent()

  function resetForm() {
    setTitle("")
    setStart(defaultStartValue())
    setEnd(defaultEndValue())
    setAttendees("")
    setLocation("")
    setDescription("")
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm()
    onOpenChange(next)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const startIso = toIsoFromLocalInput(start)
    const endIso = toIsoFromLocalInput(end)

    if (new Date(endIso) <= new Date(startIso)) {
      toast.error("End time must be after start time")
      return
    }

    try {
      await createEvent.mutateAsync({
        title,
        start: startIso,
        end: endIso,
        attendees: attendees
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
      })

      toast.success(
        attendees.trim()
          ? "Event created and invites sent"
          : "Event created",
      )
      handleOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create event",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
          <DialogDescription>
            Schedule a meeting and optionally invite attendees by email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Team sync"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-start">Start</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end">End</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-attendees">Attendees</Label>
            <Input
              id="event-attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="alice@example.com, bob@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Zoom, Room 4, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda or notes"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? "Creating..." : "Create event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
