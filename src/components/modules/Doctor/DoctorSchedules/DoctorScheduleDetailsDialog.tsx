"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IDoctorSchedule } from "@/types/schedule.types"
import { format } from "date-fns"
import { X } from "lucide-react"

interface DoctorScheduleDetailsDialogProps {
  schedule: IDoctorSchedule
  onClose: () => void
}

function formatDateTime(value: Date | string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Invalid date" : format(date, "PPP p")
}

const DoctorScheduleDetailsDialog = ({ schedule, onClose }: DoctorScheduleDetailsDialogProps) => (
  <Dialog open onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
    <DialogContent className="max-w-md" aria-describedby="doctor-schedule-details-description">
      <DialogHeader className="relative pr-12">
        <DialogTitle>Schedule details</DialogTitle>
        <DialogDescription id="doctor-schedule-details-description">
          Your assigned appointment availability.
        </DialogDescription>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-3"
          onClick={onClose}
          aria-label="Close schedule details"
          title="Close"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </DialogHeader>
      <dl className="space-y-4 px-6 py-5">
        <div>
          <dt className="text-sm text-muted-foreground">Starts</dt>
          <dd className="mt-1 text-sm font-medium">{formatDateTime(schedule.schedule.startDateTime)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Ends</dt>
          <dd className="mt-1 text-sm font-medium">{formatDateTime(schedule.schedule.endDateTime)}</dd>
        </div>
        <div>
          <dt className="mb-1 text-sm text-muted-foreground">Appointment status</dt>
          <dd>
            <Badge variant={schedule.isBooked ? "secondary" : "outline"}>
              {schedule.isBooked ? "Patient booked" : "Open"}
            </Badge>
          </dd>
        </div>
      </dl>
    </DialogContent>
  </Dialog>
)

export default DoctorScheduleDetailsDialog