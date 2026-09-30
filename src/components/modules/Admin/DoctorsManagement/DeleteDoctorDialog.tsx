"use client"

import { deleteDoctorAction } from "@/app/(dashboardLayout)/admin/dashboard/doctors-management/_actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IDoctor } from "@/types/doctor.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, X } from "lucide-react"
import { useState } from "react"

interface DeleteDoctorDialogProps {
  doctor: IDoctor
  onClose: () => void
}

const DeleteDoctorDialog = ({ doctor, onClose }: DeleteDoctorDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => deleteDoctorAction(String(doctor.id)),
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
      void queryClient.invalidateQueries({ queryKey: ["doctors"] })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete the doctor.")
    }
  }

  return (
    <Dialog open onOpenChange={(nextOpen) => {
      if (!nextOpen && !isPending) onClose()
    }}>
      <DialogContent className="max-w-md" aria-describedby="delete-doctor-description">
        <DialogHeader className="relative pr-12">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle aria-hidden="true" className="size-5 text-destructive" />
            Delete doctor
          </DialogTitle>
          <DialogDescription id="delete-doctor-description">
            Delete {doctor.name}? This doctor will be removed from the active doctors list.
          </DialogDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-3"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close delete confirmation"
            title="Close"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete doctor"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteDoctorDialog