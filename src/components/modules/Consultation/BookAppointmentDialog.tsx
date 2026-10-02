"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getAvailableDoctorSchedules } from "@/services/appointment.services"
import { IAvailableDoctorSchedule } from "@/types/appointment.types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarPlus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface BookAppointmentDialogProps {
  doctorId: string
  doctorName: string
}

function formatDateTime(value: Date | string, pattern: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Invalid date" : format(date, pattern)
}

const BookAppointmentDialog = ({ doctorId, doctorName }: BookAppointmentDialogProps) => {
  const [open, setOpen] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState("")
  const router = useRouter()
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["doctor-available-schedules", doctorId],
    queryFn: () => getAvailableDoctorSchedules(doctorId),
    enabled: open,
    staleTime: 30_000,
  })
  const schedules = (response?.data ?? []).filter((schedule: IAvailableDoctorSchedule) =>
    new Date(schedule.startDateTime).getTime() > Date.now()
  )

  const continueBooking = () => {
    if (!selectedScheduleId) return
    const params = new URLSearchParams({ doctorId, scheduleId: selectedScheduleId })
    setOpen(false)
    router.push(`/dashboard/book-appointments?${params.toString()}`)
  }

  return (
    <>
      <Button type="button" onClick={() => {
        setSelectedScheduleId("")
        setOpen(true)
      }}>
        <CalendarPlus aria-hidden="true" className="size-4" />
        Book appointment
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl" aria-describedby="appointment-slot-description">
          <DialogHeader className="relative pr-12">
            <DialogTitle>Choose an appointment time</DialogTitle>
            <DialogDescription id="appointment-slot-description">
              Upcoming available times with {doctorName}.
            </DialogDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-3"
              onClick={() => setOpen(false)}
              aria-label="Close appointment times"
              title="Close"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </DialogHeader>
          <div className="space-y-4 px-6 py-5">
            {isLoading && <p role="status" className="py-8 text-center text-sm text-muted-foreground">Loading available times...</p>}
            {isError && (
              <div className="space-y-3 py-6 text-center">
                <Alert variant="destructive"><AlertDescription>Could not load this doctor’s available times.</AlertDescription></Alert>
                <Button type="button" variant="outline" onClick={() => void refetch()}>Try again</Button>
              </div>
            )}
            {!isLoading && !isError && schedules.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No upcoming times are available right now.</p>
            )}
            {!isLoading && !isError && schedules.length > 0 && (
              <fieldset className="max-h-[50dvh] space-y-2 overflow-y-auto">
                <legend className="mb-2 text-sm font-medium">Available times</legend>
                {schedules.map((schedule) => (
                  <label
                    key={schedule.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 hover:bg-muted/50 has-checked:border-primary"
                  >
                    <input
                      type="radio"
                      name="appointment-schedule"
                      value={schedule.id}
                      checked={selectedScheduleId === schedule.id}
                      onChange={() => setSelectedScheduleId(schedule.id)}
                      className="size-4 accent-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{formatDateTime(schedule.startDateTime, "EEEE, MMMM d, yyyy")}</span>
                      <span className="block text-sm text-muted-foreground">
                        {formatDateTime(schedule.startDateTime, "h:mm a")} - {formatDateTime(schedule.endDateTime, "h:mm a")}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            <div className="flex justify-end border-t pt-4">
              <Button type="button" onClick={continueBooking} disabled={!selectedScheduleId || isLoading || isError}>
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BookAppointmentDialog