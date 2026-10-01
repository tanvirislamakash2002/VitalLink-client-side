"use client"

import { getDoctorById } from "@/services/doctor.services"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IDoctorProfile } from "@/types/doctor.types"
import { useQuery } from "@tanstack/react-query"
import { Star, X } from "lucide-react"

interface DoctorProfileDialogProps {
  doctorId: string
  onClose: () => void
}

function formatDateTime(value: Date | string | undefined) {
  if (!value) return "Not available"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="wrap-break-word text-sm">{children || "Not available"}</dd>
    </div>
  )
}

function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h3 className="text-base font-semibold">{children}</h3>
      {count !== undefined && <span className="text-sm text-muted-foreground">({count})</span>}
    </div>
  )
}

function EmptySection({ children }: { children: string }) {
  return <p className="py-4 text-sm text-muted-foreground">{children}</p>
}

function DoctorProfile({ doctor }: { doctor: IDoctorProfile }) {
  const initials = doctor.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()

  return (
    <div className="space-y-6 px-6 py-5">
      <section className="flex flex-wrap items-center gap-4 border-b pb-5">
        <Avatar size="lg" className="size-16">
          <AvatarImage src={doctor.profilePhoto ?? undefined} alt={doctor.name} />
          <AvatarFallback className="text-lg">{initials || "D"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="wrap-break-word text-xl font-semibold">{doctor.name}</h2>
          <p className="break-all text-sm text-muted-foreground">{doctor.email}</p>
          <p className="mt-1 text-sm text-muted-foreground">{doctor.designation} · {doctor.currentWorkingPlace}</p>
        </div>
        <Badge variant={doctor.user.status === "ACTIVE" ? "default" : doctor.user.status === "BLOCKED" ? "destructive" : "secondary"}>
          {doctor.user.status.toLowerCase()}
        </Badge>
      </section>

      <section>
        <SectionTitle>Doctor information</SectionTitle>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Registration number">{doctor.registrationNumber}</Detail>
          <Detail label="Contact number">{doctor.contactNumber}</Detail>
          <Detail label="Gender">{doctor.gender.toLowerCase()}</Detail>
          <Detail label="Experience">{doctor.experience ?? 0} years</Detail>
          <Detail label="Appointment fee">${doctor.appointmentFee.toFixed(2)}</Detail>
          <Detail label="Qualification">{doctor.qualification}</Detail>
          <Detail label="Address">{doctor.address}</Detail>
          <Detail label="Joined">{formatDateTime(doctor.createdAt)}</Detail>
          <Detail label="Average rating">{doctor.averageRating.toFixed(1)} / 5</Detail>
        </dl>
      </section>

      <section className="border-t pt-5">
        <SectionTitle>Account information</SectionTitle>
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Account name">{doctor.user.name}</Detail>
          <Detail label="Account email">{doctor.user.email}</Detail>
          <Detail label="Role">{doctor.user.role.toLowerCase().replaceAll("_", " ")}</Detail>
          <Detail label="Email verified">{doctor.user.emailVerified ? "Yes" : "No"}</Detail>
          <Detail label="Password change required">{doctor.user.needPasswordChange ? "Yes" : "No"}</Detail>
        </dl>
      </section>

      <section className="border-t pt-5">
        <SectionTitle count={doctor.specialties.length}>Specialties</SectionTitle>
        {doctor.specialties.length ? (
          <div className="flex flex-wrap gap-2">
            {doctor.specialties.map(({ specialty }) => <Badge variant="secondary" key={specialty.id}>{specialty.title}</Badge>)}
          </div>
        ) : <EmptySection>No specialties are listed.</EmptySection>}
      </section>

      <section className="border-t pt-5">
        <SectionTitle count={doctor.appointments.length}>Appointments</SectionTitle>
        {doctor.appointments.length ? (
          <div className="divide-y rounded-md border">
            {doctor.appointments.map((appointment) => (
              <article key={appointment.id} className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{appointment.patient.name}</p>
                  <p className="break-all text-xs text-muted-foreground">{appointment.patient.email}</p>
                </div>
                <div className="text-sm">
                  <p>{formatDateTime(appointment.schedule.startDateTime)}</p>
                  <p className="text-xs text-muted-foreground">to {formatDateTime(appointment.schedule.endDateTime)}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:justify-end">
                  <Badge variant="outline">{appointment.status.toLowerCase().replaceAll("_", " ")}</Badge>
                  <Badge variant="secondary">{appointment.paymentStatus.toLowerCase().replaceAll("_", " ")}</Badge>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptySection>No appointments found.</EmptySection>}
      </section>

      <section className="border-t pt-5">
        <SectionTitle count={doctor.doctorSchedules.length}>Doctor schedule</SectionTitle>
        {doctor.doctorSchedules.length ? (
          <div className="divide-y rounded-md border">
            {doctor.doctorSchedules.map(({ schedule, isBooked }) => (
              <div key={schedule.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div>
                  <p className="text-sm font-medium">{formatDateTime(schedule.startDateTime)}</p>
                  <p className="text-xs text-muted-foreground">to {formatDateTime(schedule.endDateTime)}</p>
                </div>
                <Badge variant={isBooked ? "secondary" : "outline"}>{isBooked ? "Booked" : "Available"}</Badge>
              </div>
            ))}
          </div>
        ) : <EmptySection>No schedule entries found.</EmptySection>}
      </section>

      <section className="border-t pt-5">
        <SectionTitle count={doctor.reviews.length}>Reviews</SectionTitle>
        {doctor.reviews.length ? (
          <div className="divide-y rounded-md border">
            {doctor.reviews.map((review) => (
              <article key={review.id} className="space-y-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                    <Star aria-hidden="true" className="size-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{review.rating.toFixed(1)} / 5</span>
                  </div>
                  <time className="text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</time>
                </div>
                <p className="whitespace-pre-wrap wrap-break-word text-sm">{review.comment || "No written comment."}</p>
              </article>
            ))}
          </div>
        ) : <EmptySection>No reviews found.</EmptySection>}
      </section>
    </div>
  )
}

const DoctorProfileDialog = ({ doctorId, onClose }: DoctorProfileDialogProps) => {
  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["doctor-profile", doctorId],
    queryFn: () => getDoctorById(doctorId),
  })
  const doctor = response?.data

  return (
    <Dialog open onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose()
    }}>
      <DialogContent className="max-w-5xl" aria-describedby="doctor-profile-description">
        <DialogHeader className="relative pr-12">
          <DialogTitle>Doctor profile</DialogTitle>
          <DialogDescription id="doctor-profile-description">
            Professional details, account information, appointments, availability, and reviews.
          </DialogDescription>
          <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-3" onClick={onClose} aria-label="Close doctor profile" title="Close">
            <X aria-hidden="true" className="size-4" />
          </Button>
        </DialogHeader>

        <div className="min-h-40 overflow-y-auto">
          {isLoading && <p role="status" className="p-8 text-center text-sm text-muted-foreground">Loading doctor profile…</p>}
          {isError && (
            <div className="space-y-3 p-8 text-center">
              <p className="text-sm text-destructive">{error instanceof Error ? error.message : "Could not load this doctor."}</p>
              <Button type="button" variant="outline" onClick={() => void refetch()}>Retry</Button>
            </div>
          )}
          {!isLoading && !isError && doctor && <DoctorProfile doctor={doctor} />}
          {!isLoading && !isError && !doctor && <p className="p-8 text-center text-sm text-muted-foreground">Doctor not found.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DoctorProfileDialog