"use client"

import { updateDoctorAction } from "@/app/(dashboardLayout)/admin/dashboard/doctors-management/_actions"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import SpecialtyMultiSelect from "@/components/shared/form/SpecialtyMultiSelect"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { IDoctor } from "@/types/doctor.types"
import { ISpecialty } from "@/types/specialty.types"
import { EditDoctorFormValues, editDoctorFormSchema, updateDoctorPayloadSchema } from "@/zod/doctor.validation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { X } from "lucide-react"

interface EditDoctorDialogProps {
  doctor: IDoctor
  specialties: ISpecialty[]
  onClose: () => void
}

const EditDoctorDialog = ({ doctor, specialties, onClose }: EditDoctorDialogProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (formData: FormData) => updateDoctorAction(String(doctor.id), formData),
  })

  const initialSpecialtyIds = doctor.specialties.map(({ specialtyId, specialty }) => specialtyId || specialty.id)
  const form = useForm({
    defaultValues: {
      name: doctor.name,
      registrationNumber: doctor.registrationNumber,
      contactNumber: doctor.contactNumber ?? "",
      address: doctor.address ?? "",
      experience: String(doctor.experience ?? 0),
      gender: doctor.gender,
      appointmentFee: String(doctor.appointmentFee),
      qualification: doctor.qualification,
      currentWorkingPlace: doctor.currentWorkingPlace,
      designation: doctor.designation,
      specialties: initialSpecialtyIds,
    } satisfies EditDoctorFormValues,
    onSubmit: async ({ value }) => {
      setFormError(null)
      const parsedForm = editDoctorFormSchema.safeParse(value)
      if (!parsedForm.success) {
        setFormError(parsedForm.error.issues[0]?.message ?? "Please check the doctor details.")
        return
      }

      const updatedSpecialtyIds = new Set(parsedForm.data.specialties)
      const currentSpecialtyIds = new Set(initialSpecialtyIds)
      const specialtyChanges = [
        ...parsedForm.data.specialties
          .filter((specialtyId) => !currentSpecialtyIds.has(specialtyId))
          .map((specialtyId) => ({ specialtyId })),
        ...initialSpecialtyIds
          .filter((specialtyId) => !updatedSpecialtyIds.has(specialtyId))
          .map((specialtyId) => ({ specialtyId, shouldDelete: true })),
      ]

      const payload = {
        doctor: {
          name: parsedForm.data.name,
          registrationNumber: parsedForm.data.registrationNumber,
          contactNumber: parsedForm.data.contactNumber || undefined,
          address: parsedForm.data.address || undefined,
          experience: Number(parsedForm.data.experience),
          gender: parsedForm.data.gender,
          appointmentFee: Number(parsedForm.data.appointmentFee),
          qualification: parsedForm.data.qualification,
          currentWorkingPlace: parsedForm.data.currentWorkingPlace,
          designation: parsedForm.data.designation,
        },
        specialties: specialtyChanges.length ? specialtyChanges : undefined,
      }
      const parsedPayload = updateDoctorPayloadSchema.safeParse(payload)
      if (!parsedPayload.success) {
        setFormError(parsedPayload.error.issues[0]?.message ?? "Please check the doctor details.")
        return
      }

      const requestData = new FormData()
      requestData.append("data", JSON.stringify(parsedPayload.data))
      if (selectedPhoto) requestData.append("file", selectedPhoto, selectedPhoto.name)

      try {
        const result = await mutateAsync(requestData)
        if (!result.success) {
          setFormError(result.message)
          return
        }

        await queryClient.invalidateQueries({ queryKey: ["doctors"] })
        onClose()
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Could not update the doctor.")
      }
    },
  })

  const handlePhotoChange = (file: File | undefined) => {
    setFormError(null)
    if (!file) {
      setSelectedPhoto(null)
      return
    }
    if (!file.type.startsWith("image/")) {
      setFormError("Choose an image file.")
      setSelectedPhoto(null)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("The profile image must be 5 MB or smaller.")
      setSelectedPhoto(null)
      return
    }
    setSelectedPhoto(file)
  }

  const renderTextField = (
    name: keyof EditDoctorFormValues,
    label: string,
    type: "text" | "email" | "password" | "number" = "text",
  ) => (
    <form.Field name={name} validators={{ onChange: editDoctorFormSchema.shape[name] as never }}>
      {(field) => <AppField field={field} label={label} type={type} disabled={isPending} />}
    </form.Field>
  )

  return (
    <Dialog open onOpenChange={(nextOpen) => {
      if (!nextOpen && !isPending) onClose()
    }}>
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        aria-describedby="edit-doctor-description"
      >
        <DialogHeader className="relative pr-12">
          <DialogTitle>Edit doctor</DialogTitle>
          <DialogDescription id="edit-doctor-description">
            Update {doctor.name}&apos;s professional details and specialties.
          </DialogDescription>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-3"
            onClick={onClose}
            disabled={isPending}
            aria-label="Close edit doctor dialog"
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
              {renderTextField("name", "Full name")}
              {renderTextField("registrationNumber", "Registration number")}
              {renderTextField("contactNumber", "Contact number", "text")}
              {renderTextField("experience", "Experience (years)", "number")}
              {renderTextField("appointmentFee", "Appointment fee", "number")}
              {renderTextField("qualification", "Qualification")}
              {renderTextField("currentWorkingPlace", "Current workplace")}
              {renderTextField("designation", "Designation")}
              {renderTextField("address", "Address")}

              <form.Field name="gender" validators={{ onChange: editDoctorFormSchema.shape.gender }}>
                {(field) => (
                  <div className="space-y-1.5">
                    <label htmlFor={field.name}>Gender</label>
                    <select
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={isPending}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="specialties" validators={{ onChange: editDoctorFormSchema.shape.specialties }}>
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specialties</label>
                  <SpecialtyMultiSelect
                    specialties={specialties}
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={isPending}
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            </form.Field>

            <div className="space-y-2">
              <label htmlFor="edit-doctor-profile-photo" className="text-sm font-medium">Replace profile image (optional)</label>
              <Input
                id="edit-doctor-profile-photo"
                type="file"
                accept="image/*"
                disabled={isPending}
                onChange={(event) => handlePhotoChange(event.target.files?.[0])}
              />
              <p className="text-xs text-muted-foreground">
                {selectedPhoto?.name ?? (doctor.profilePhoto ? "Current image will be kept unless replaced. Images up to 5 MB." : "Images up to 5 MB.")}
              </p>
            </div>

            {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}

            <div className="flex justify-end border-t pt-4">
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                {([canSubmit, isSubmitting]) => (
                  <AppSubmitButton
                    className="w-auto min-w-36"
                    isPending={isSubmitting || isPending}
                    pendingLabel="Saving changes..."
                    disabled={!canSubmit}
                  >
                    Save changes
                  </AppSubmitButton>
                )}
              </form.Subscribe>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditDoctorDialog