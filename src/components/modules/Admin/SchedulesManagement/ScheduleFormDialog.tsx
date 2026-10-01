"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import AppField from "@/components/shared/form/AppField"
import { createScheduleAction, updateScheduleAction } from "@/services/schedule.services"
import { ISchedule, ScheduleFormPayload } from "@/types/schedule.types"
import { ScheduleFormValues, scheduleFieldsSchema, scheduleFormSchema } from "@/zod/schedule.validation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { format } from "date-fns"
import { CalendarPlus, X } from "lucide-react"
import { useState } from "react"

type ScheduleFormDialogProps =
  | { mode: "create"; schedule?: never; onClose?: never }
  | { mode: "edit"; schedule: ISchedule; onClose: () => void }

const emptyValues: ScheduleFormValues = {
  startDate: "",
  endDate: "",
  startTime: "09:00",
  endTime: "17:00",
}

function formatDate(value: Date | string) {
  return format(new Date(value), "yyyy-MM-dd")
}

function formatTime(value: Date | string) {
  return format(new Date(value), "HH:mm")
}

const ScheduleFormDialog = (props: ScheduleFormDialogProps) => {
  const [open, setOpen] = useState(props.mode === "edit")
  const [formError, setFormError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const isEditing = props.mode === "edit"
  const schedule = isEditing ? props.schedule : undefined
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: ScheduleFormPayload) => schedule
      ? updateScheduleAction(schedule.id, payload)
      : createScheduleAction(payload),
  })

  const initialValues: ScheduleFormValues = schedule
    ? {
        startDate: formatDate(schedule.startDateTime),
        endDate: formatDate(schedule.endDateTime),
        startTime: formatTime(schedule.startDateTime),
        endTime: formatTime(schedule.endDateTime),
      }
    : emptyValues

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setFormError(null)
      const parsedPayload = scheduleFormSchema.safeParse(value)
      if (!parsedPayload.success) {
        setFormError(parsedPayload.error.issues[0]?.message ?? "Please check the schedule dates and times.")
        return
      }

      if (isEditing) {
        const startDateTime = new Date(`${parsedPayload.data.startDate}T${parsedPayload.data.startTime}:00`)
        const endDateTime = new Date(`${parsedPayload.data.endDate}T${parsedPayload.data.endTime}:00`)
        if (endDateTime.getTime() - startDateTime.getTime() !== 30 * 60 * 1000) {
          setFormError("An individual schedule slot must be exactly 30 minutes.")
          return
        }
      }

      try {
        const result = await mutateAsync(parsedPayload.data)
        if (!result.success) {
          setFormError(result.message)
          return
        }

        if (props.mode === "edit") props.onClose()
        else setOpen(false)
        void queryClient.invalidateQueries({ queryKey: ["schedules"] })
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Could not save the schedule.")
      }
    },
  })

  const closeDialog = () => {
    if (props.mode === "edit") props.onClose()
    else setOpen(false)
  }

  const renderDateTimeField = (name: keyof ScheduleFormValues, label: string, type: "date" | "time") => (
    <form.Field name={name} validators={{ onChange: scheduleFieldsSchema.shape[name] as never }}>
      {(field) => (
        <div className="space-y-1.5">
          <label htmlFor={`${props.mode}-${name}`} className="text-sm font-medium">{label}</label>
          <Input
            id={`${props.mode}-${name}`}
            name={field.name}
            type={type}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(event) => field.handleChange(event.target.value)}
            disabled={isPending}
            aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
          />
          {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
            <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
          )}
        </div>
      )}
    </form.Field>
  )

  return (
    <>
      {props.mode === "create" && (
        <Button type="button" onClick={() => setOpen(true)}>
          <CalendarPlus aria-hidden="true" className="size-4" />
          Create schedules
        </Button>
      )}
      <Dialog open={open} onOpenChange={(nextOpen) => {
        if (!isPending) setOpen(nextOpen)
      }}>
        <DialogContent className="max-w-xl" aria-describedby="schedule-form-description">
          <DialogHeader className="relative pr-12">
            <DialogTitle>{isEditing ? "Edit schedule slot" : "Create schedules"}</DialogTitle>
            <DialogDescription id="schedule-form-description">
              {isEditing
                ? "Update this individual schedule slot."
                : "Create 30-minute schedule slots for each date in the selected range."}
            </DialogDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-3"
              onClick={closeDialog}
              disabled={isPending}
              aria-label="Close schedule dialog"
              title="Close"
            >
              <X aria-hidden="true" className="size-4" />
            </Button>
          </DialogHeader>

          <div className="overflow-y-auto px-6 py-5">
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void form.handleSubmit()
              }}
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {renderDateTimeField("startDate", "Start date", "date")}
                {renderDateTimeField("endDate", "End date", "date")}
                {renderDateTimeField("startTime", "Daily start time", "time")}
                {renderDateTimeField("endTime", "Daily end time", "time")}
              </div>

              {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}

              <div className="flex justify-end border-t pt-4">
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                  {([canSubmit, isSubmitting]) => (
                    <AppSubmitButton
                      className="w-auto min-w-36"
                      isPending={isSubmitting || isPending}
                      pendingLabel={isEditing ? "Saving slot..." : "Creating slots..."}
                      disabled={!canSubmit}
                    >
                      {isEditing ? "Save changes" : "Create schedules"}
                    </AppSubmitButton>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ScheduleFormDialog