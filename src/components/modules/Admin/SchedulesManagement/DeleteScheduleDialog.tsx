"use client"

import { deleteScheduleAction } from "@/services/schedule.services"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ISchedule } from "@/types/schedule.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { AlertTriangle, X } from "lucide-react"
import { useState } from "react"

interface DeleteScheduleDialogProps {
  schedule: ISchedule
  onClose: () => void
}

const DeleteScheduleDialog = ({ schedule, onClose }: DeleteScheduleDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => deleteScheduleAction(schedule.id),
  })

  const handleDelete = async () => {
    setErrorMessage(null)
    try {
      const result = await mutateAsync()
      if (!result.success) {
        setErrorMessage(result.message)
        return
      }
      onClose()
      void queryClient.invalidateQueries({ queryKey: ["schedules"] })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete the schedule.")
    }
  }

  const slotDate = `${format(new Date(schedule.startDateTime), "PPP p")} to ${format(new Date(schedule.endDateTime), "p")}`
  const hasRelations = schedule.appointments.length > 0 || schedule.doctorSchedules.length > 0

  return (
    <Dialog open onOpenChange={(nextOpen) => { if (!nextOpen && !isPending) onClose() }}>
      <DialogContent className="max-w-md" aria-describedby="delete-schedule-description">
        <DialogHeader className="relative pr-12">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle aria-hidden="true" className="size-5 text-destructive" />
            Delete schedule
          </DialogTitle>
          <DialogDescription id="delete-schedule-description">
            Delete the schedule slot on {slotDate}?
          </DialogDescription>
          <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-3" onClick={onClose} disabled={isPending} aria-label="Close delete confirmation">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {hasRelations && (
            <Alert variant="destructive">
              <AlertDescription>
                This slot has {schedule.appointments.length} appointment(s) and {schedule.doctorSchedules.length} doctor assignment(s). Deleting it also deletes those linked records.
              </AlertDescription>
            </Alert>
          )}
          {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete schedule"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteScheduleDialog