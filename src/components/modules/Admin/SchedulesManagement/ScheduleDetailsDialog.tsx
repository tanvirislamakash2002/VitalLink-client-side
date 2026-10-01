"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ISchedule } from "@/types/schedule.types"
import { format } from "date-fns"
import { X } from "lucide-react"

interface ScheduleDetailsDialogProps {
  schedule: ISchedule
  onClose: () => void
}

function dateTime(value: Date | string) {
  return format(new Date(value), "PPP p")
}

const ScheduleDetailsDialog = ({ schedule, onClose }: ScheduleDetailsDialogProps) => (
  <Dialog open onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
    <DialogContent className="max-w-2xl" aria-describedby="schedule-details-description">
      <DialogHeader className="relative pr-12">
        <DialogTitle>Schedule details</DialogTitle>
        <DialogDescription id="schedule-details-description">
          {dateTime(schedule.startDateTime)} to {dateTime(schedule.endDateTime)}
        </DialogDescription>
        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-3" onClick={onClose} aria-label="Close schedule details">
          <X aria-hidden="true" className="size-4" />
        </Button>
      </DialogHeader>

      <div className="max-h-[70dvh] space-y-6 overflow-y-auto px-6 py-5">
        <section>
          <h3 className="mb-3 text-sm font-semibold">Doctor assignments ({schedule.doctorSchedules.length})</h3>
          {schedule.doctorSchedules.length ? (
            <div className="divide-y rounded-md border">
              {schedule.doctorSchedules.map(({ doctorId, isBooked, doctor }) => (
                <div key={doctorId} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doctor.name}</p>
                    <p className="break-all text-xs text-muted-foreground">{doctor.email}</p>
                  </div>
                  <Badge variant={isBooked ? "secondary" : "outline"}>{isBooked ? "Booked" : "Available"}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No doctors are assigned to this slot.</p>}
        </section>

        <section className="border-t pt-5">
          <h3 className="mb-3 text-sm font-semibold">Appointments ({schedule.appointments.length})</h3>
          {schedule.appointments.length ? (
            <div className="divide-y rounded-md border">
              {schedule.appointments.map((appointment) => (
                <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{appointment.patient.name}</p>
                    <p className="break-all text-xs text-muted-foreground">{appointment.patient.email}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="outline">{appointment.status.toLowerCase().replaceAll("_", " ")}</Badge>
                    <Badge variant="secondary">{appointment.paymentStatus.toLowerCase().replaceAll("_", " ")}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No appointments are linked to this slot.</p>}
        </section>
      </div>
    </DialogContent>
  </Dialog>
)

export default ScheduleDetailsDialog