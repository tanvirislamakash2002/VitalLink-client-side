"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { bookDoctorSchedulesAction, getMyDoctorSchedules } from "@/services/doctorSchedule.services"
import { getSchedules } from "@/services/schedule.services"
import { ISchedule } from "@/types/schedule.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addDays, format } from "date-fns"
import { CalendarPlus, X } from "lucide-react"
import { useState } from "react"

function formatTime(value: Date | string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Invalid time" : format(date, "h:mm a")
}

const BookDoctorSchedulesDialog = () => {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<Set<string>>(new Set())
  const [formError, setFormError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const today = format(new Date(), "yyyy-MM-dd")

  const mySchedulesQuery = useQuery({
    queryKey: ["my-doctor-schedules", "all-for-booking"],
    queryFn: () => getMyDoctorSchedules("limit=1000"),
    enabled: open,
    staleTime: 1000 * 60,
  })

  const availableSchedulesQuery = useQuery({
    queryKey: ["doctor-available-schedules", selectedDate],
    queryFn: () => {
      const now = new Date()
      const date = selectedDate ? new Date(`${selectedDate}T00:00:00`) : now
      const nextDate = selectedDate ? addDays(date, 1) : undefined
      const startDateTime = date > now ? date : now
      const params = new URLSearchParams({
        limit: "1000",
        sortBy: "startDateTime",
        sortOrder: "asc",
        include: "doctorSchedules",
      })
      params.set("startDateTime[gte]", startDateTime.toISOString())
      if (nextDate) params.set("startDateTime[lt]", nextDate.toISOString())
      return getSchedules(params.toString())
    },
    enabled: open,
    staleTime: 30_000,
  })

  const bookSchedulesMutation = useMutation({
    mutationFn: bookDoctorSchedulesAction,
  })

  const ownScheduleIds = new Set((mySchedulesQuery.data?.data ?? []).map(({ scheduleId }) => scheduleId))
  const availableSchedules = (availableSchedulesQuery.data?.data ?? []).filter((schedule: ISchedule) =>
    !ownScheduleIds.has(schedule.id) && new Date(schedule.startDateTime).getTime() > Date.now()
  )

  const handleBookSchedules = async () => {
    setFormError(null)
    try {
      const result = await bookSchedulesMutation.mutateAsync([...selectedScheduleIds])
      if (!result.success) {
        setFormError(result.message)
        return
      }

      setSelectedScheduleIds(new Set())
      setOpen(false)
      void queryClient.invalidateQueries({ queryKey: ["my-doctor-schedules"] })
      void queryClient.invalidateQueries({ queryKey: ["doctor-available-schedules"] })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not book the selected schedules.")
    }
  }

  const isLoading = mySchedulesQuery.isLoading || availableSchedulesQuery.isLoading
  const hasError = mySchedulesQuery.isError || availableSchedulesQuery.isError
  const isPending = bookSchedulesMutation.isPending

  return (
    <>
      <Button type="button" onClick={() => {
        setSelectedDate("")
        setSelectedScheduleIds(new Set())
        setFormError(null)
        setOpen(true)
      }}>
        <CalendarPlus aria-hidden="true" className="size-4" />
        Book schedules
      </Button>
      <Dialog open={open} onOpenChange={(nextOpen) => {
        if (!isPending) setOpen(nextOpen)
      }}>
        <DialogContent className="max-w-2xl" aria-describedby="book-schedules-description">
          <DialogHeader className="relative pr-12">
            <DialogTitle>Book schedule slots</DialogTitle>
            <DialogDescription id="book-schedules-description">
              Browse upcoming slots or filter the list to a specific date.
            </DialogDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-3"
              onClick={() => setOpen(false)}
              disabled={isPending}
              aria-label="Close booking dialog"
              title="Close"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto px-6 py-5">
            <div className="flex flex-wrap items-end gap-3">
              <div className="max-w-xs flex-1 space-y-1.5">
                <label htmlFor="doctor-schedule-date" className="text-sm font-medium">Filter by date</label>
                <Input
                  id="doctor-schedule-date"
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value)
                    setSelectedScheduleIds(new Set())
                  }}
                  disabled={isPending}
                />
              </div>
              <Button
                type="button"
                variant={selectedDate ? "outline" : "secondary"}
                onClick={() => {
                  setSelectedDate("")
                  setSelectedScheduleIds(new Set())
                }}
                disabled={!selectedDate || isPending}
              >
                All upcoming
              </Button>
            </div>

            {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}
            {hasError && (
              <Alert variant="destructive">
                <AlertDescription>Could not load available schedules. Please close the dialog and try again.</AlertDescription>
              </Alert>
            )}
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading available schedules...</p>
            ) : !hasError && availableSchedules.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No remaining schedule slots found.</p>
            ) : !hasError && (
              <div role="group" aria-label="Available schedule slots" className="max-h-72 space-y-2 overflow-y-auto">
                {availableSchedules.map((schedule) => {
                  const isSelected = selectedScheduleIds.has(schedule.id)
                  return (
                    <label
                      key={schedule.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isPending}
                        onChange={(event) => {
                          setSelectedScheduleIds((current) => {
                            const next = new Set(current)
                            if (event.target.checked) next.add(schedule.id)
                            else next.delete(schedule.id)
                            return next
                          })
                        }}
                        className="size-4 accent-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium">
                          {format(new Date(schedule.startDateTime), "EEE, MMM d")}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {formatTime(schedule.startDateTime)} - {formatTime(schedule.endDateTime)}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">{selectedScheduleIds.size} selected</span>
              <Button
                type="button"
                onClick={() => void handleBookSchedules()}
                disabled={selectedScheduleIds.size === 0 || isPending || isLoading || hasError}
              >
                {isPending ? "Booking..." : "Book selected"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BookDoctorSchedulesDialog