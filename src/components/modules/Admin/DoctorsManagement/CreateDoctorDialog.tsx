"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import AppField from "@/components/shared/form/AppField"
import AppSubmitButton from "@/components/shared/form/AppSubmitButton"
import SpecialtyMultiSelect from "@/components/shared/form/SpecialtyMultiSelect"
import { createDoctorAction } from "@/app/(dashboardLayout)/admin/dashboard/doctors-management/_actions"
import { ISpecialty } from "@/types/specialty.types"
import { CreateDoctorFormValues, createDoctorFormSchema, createDoctorPayloadSchema } from "@/zod/doctor.validation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { ImagePlus, X } from "lucide-react"
import { useState } from "react"

interface CreateDoctorDialogProps {
  specialties: ISpecialty[]
}

const initialValues: CreateDoctorFormValues = {
  name: "",
  email: "",
  password: "",
  registrationNumber: "",
  contactNumber: "",
  address: "",
  experience: "",
  gender: "",
  appointmentFee: "",
  qualification: "",
  currentWorkingPlace: "",
  designation: "",
  specialties: [],
}

const CreateDoctorDialog = ({ specialties }: CreateDoctorDialogProps) => {
  const [open, setOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({ mutationFn: createDoctorAction })

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setFormError(null)

      const payload = {
        password: value.password,
        doctor: {
          name: value.name,
          email: value.email,
          registrationNumber: value.registrationNumber,
          contactNumber: value.contactNumber,
          address: value.address || undefined,
          experience: Number(value.experience),
          gender: value.gender,
          appointmentFee: Number(value.appointmentFee),
          qualification: value.qualification,
          currentWorkingPlace: value.currentWorkingPlace,
          designation: value.designation,
        },
        specialties: value.specialties,
      }
      const parsedPayload = createDoctorPayloadSchema.safeParse(payload)
      if (!parsedPayload.success) {
        setFormError(parsedPayload.error.issues[0]?.message ?? "Check the doctor details and try again.")
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

        void queryClient.invalidateQueries({ queryKey: ["doctors"] })
        form.reset()
        setSelectedPhoto(null)
        setOpen(false)
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Could not create the doctor.")
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
    name: keyof CreateDoctorFormValues,
    label: string,
    type: "text" | "email" | "password" | "number" = "text",
    placeholder?: string,
  ) => (
    <form.Field name={name} validators={{ onChange: createDoctorFormSchema.shape[name] as never }}>
      {(field) => (
        <AppField
          field={field}
          label={label}
          type={type}
          placeholder={placeholder}
          disabled={isPending}
        />
      )}
    </form.Field>
  )

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <ImagePlus aria-hidden="true" className="size-4" />
        Create Doctor
      </Button>
      <Dialog open={open} onOpenChange={(nextOpen) => {
        if (!isPending) setOpen(nextOpen)
      }}>
        <DialogContent
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          aria-describedby="create-doctor-description"
        >
          <DialogHeader className="relative pr-12">
            <DialogTitle>Create doctor</DialogTitle>
            <DialogDescription id="create-doctor-description">
              Add the doctor&apos;s account, professional details, specialties, and optional profile image.
            </DialogDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-3"
              onClick={() => setOpen(false)}
              disabled={isPending}
              aria-label="Close create doctor dialog"
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
                {renderTextField("name", "Full name", "text", "Doctor name")}
                {renderTextField("email", "Email", "email", "doctor@example.com")}
                {renderTextField("password", "Temporary password", "password", "At least 6 characters")}
                {renderTextField("registrationNumber", "Registration number")}
                {renderTextField("contactNumber", "Contact number", "text", "+8801...")}
                {renderTextField("experience", "Experience (years)", "number", "0")}
                {renderTextField("appointmentFee", "Appointment fee", "number", "0.00")}
                {renderTextField("qualification", "Qualification")}
                {renderTextField("currentWorkingPlace", "Current workplace")}
                {renderTextField("designation", "Designation")}
                {renderTextField("address", "Address")}

                <form.Field name="gender" validators={{ onChange: createDoctorFormSchema.shape.gender }}>
                  {(field) => (
                    <div className="space-y-1.5">
                      <label htmlFor={field.name}>Gender</label>
                      <select
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        disabled={isPending}
                        aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">{String(field.state.meta.errors[0])}</p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="specialties" validators={{ onChange: createDoctorFormSchema.shape.specialties }}>
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
                <label htmlFor="doctor-profile-photo" className="text-sm font-medium">Profile image (optional)</label>
                <Input
                  id="doctor-profile-photo"
                  type="file"
                  accept="image/*"
                  disabled={isPending}
                  onChange={(event) => handlePhotoChange(event.target.files?.[0])}
                />
                <p className="text-xs text-muted-foreground">Images up to 5 MB.</p>
                {selectedPhoto && <p className="truncate text-sm text-muted-foreground">{selectedPhoto.name}</p>}
              </div>

              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end border-t pt-4">
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                  {([canSubmit, isSubmitting]) => (
                    <AppSubmitButton
                      className="w-auto min-w-36"
                      isPending={isSubmitting || isPending}
                      pendingLabel="Creating doctor..."
                      disabled={!canSubmit}
                    >
                      Create doctor
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

export default CreateDoctorDialog