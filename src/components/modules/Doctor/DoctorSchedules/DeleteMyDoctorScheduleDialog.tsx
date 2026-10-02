"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { deleteMyDoctorScheduleAction } from "@/services/doctorSchedule.services"
import { IDoctorSchedule } from "@/types/schedule.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { AlertTriangle, X } from "lucide-react"
import { useState } from "react"

interface DeleteMyDoctorScheduleDialogProps {
  schedule: IDoctorSchedule
  onClose: () => void
}

const DeleteMyDoctorScheduleDialog = ({ schedule, onClose }: DeleteMyDoctorScheduleDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => deleteMyDoctorScheduleAction(schedule.scheduleId),
  })
  const isBooked = schedule.isBooked

  const handleDelete = async () => {
    setErrorMessage(null)
    try {
      const result = await mutateAsync()
      if (!result.success) {
        setErrorMessage(result.message)
        return
      }
      onClose()
      void queryClient.invalidateQueries({ queryKey: ["my-doctor-schedules"] })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not remove this schedule.")
    }
  }

  return (
    <Dialog open onOpenChange={(nextOpen) => { if (!nextOpen && !isPending) onClose() }}>
      <DialogContent className="max-w-md" aria-describedby="remove-doctor-schedule-description">
        <DialogHeader className="relative pr-12">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle aria-hidden="true" className="size-5 text-destructive" />
            Remove schedule
          </DialogTitle>
          <DialogDescription id="remove-doctor-schedule-description">
            Remove your {format(new Date(schedule.schedule.startDateTime), "PPP p")} slot from your availability?
          </DialogDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-3"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close removal confirmation"
            title="Close"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </DialogHeader>
        <div className="space-y-4 px-6 py-5">
          {isBooked && (
            <Alert variant="destructive">
              <AlertDescription>This slot has a patient appointment and cannot be removed.</AlertDescription>
            </Alert>
          )}
          {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
            {!isBooked && (
              <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={isPending}>
                {isPending ? "Removing..." : "Remove schedule"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteMyDoctorScheduleDialog