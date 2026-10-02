"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  bookAppointmentAction,
  bookAppointmentPayLaterAction,
  getAvailableDoctorSchedules,
} from "@/services/appointment.services"
import { getPublicDoctorById } from "@/services/doctor.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft, CalendarDays, Clock, CreditCard, UserRound } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface AppointmentBookingConfirmationProps {
  doctorId: string
  scheduleId: string
}

const AppointmentBookingConfirmation = ({ doctorId, scheduleId }: AppointmentBookingConfirmationProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: doctorResponse, isLoading: doctorLoading, isError: doctorError } = useQuery({
    queryKey: ["public-doctor-profile", doctorId],
    queryFn: () => getPublicDoctorById(doctorId),
  })
  const { data: schedulesResponse, isLoading: schedulesLoading, isError: schedulesError } = useQuery({
    queryKey: ["doctor-available-schedules", doctorId],
    queryFn: () => getAvailableDoctorSchedules(doctorId),
  })
  const doctor = doctorResponse?.data
  const schedule = schedulesResponse?.data.find((item) => item.id === scheduleId)
  const bookingPayload = { doctorId, scheduleId }
  const payNowMutation = useMutation({ mutationFn: bookAppointmentAction })
  const payLaterMutation = useMutation({ mutationFn: bookAppointmentPayLaterAction })
  const isPending = payNowMutation.isPending || payLaterMutation.isPending

  const payNow = async () => {
    setErrorMessage(null)
    try {
      const result = await payNowMutation.mutateAsync(bookingPayload)
      if (!result.success) {
        setErrorMessage(result.message)
        return
      }
      if (!result.data.paymentUrl) {
        setErrorMessage("The appointment was created but checkout did not return a payment link. You can retry payment from My appointments.")
        void queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
        return
      }
      window.location.assign(result.data.paymentUrl)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not start payment.")
    }
  }

  const payLater = async () => {
    setErrorMessage(null)
    try {
      const result = await payLaterMutation.mutateAsync(bookingPayload)
      if (!result.success) {
        setErrorMessage(result.message)
        return
      }
      void queryClient.invalidateQueries({ queryKey: ["my-appointments"] })
      router.push("/dashboard/my-appointments?booking=confirmed")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not book this appointment.")
    }
  }

  if (doctorLoading || schedulesLoading) {
    return <p role="status" className="py-16 text-center text-sm text-muted-foreground">Loading appointment details...</p>
  }
  if (doctorError || schedulesError || !doctor) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-sm text-destructive">Could not load appointment details.</p>
        <Link href="/consultation" className="text-sm underline underline-offset-4">Browse doctors</Link>
      </div>
    )
  }
  if (!schedule) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">That time is no longer available. Choose another slot.</p>
        <Link href={`/consultation/doctor/${encodeURIComponent(doctorId)}`} className="text-sm underline underline-offset-4">
          View available times
        </Link>
      </div>
    )
  }

  const doctorInitials = doctor.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6">
      <Link href={`/consultation/doctor/${encodeURIComponent(doctorId)}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to doctor
      </Link>
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Appointment</p>
        <h1 className="text-2xl font-semibold">Review and confirm</h1>
        <p className="text-sm text-muted-foreground">Check the doctor and appointment time before confirming.</p>
      </header>

      <section className="space-y-5 rounded-lg border p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4 border-b pb-5">
          <Avatar size="lg" className="size-16">
            <AvatarImage src={doctor.profilePhoto ?? undefined} alt={doctor.name} />
            <AvatarFallback>{doctorInitials || "D"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">{doctor.name}</h2>
            <p className="text-sm text-muted-foreground">{doctor.designation}</p>
          </div>
          <Badge variant="secondary">${doctor.appointmentFee.toFixed(2)}</Badge>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <CalendarDays aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
            <div><dt className="text-sm text-muted-foreground">Date</dt><dd className="mt-1 text-sm font-medium">{format(new Date(schedule.startDateTime), "EEEE, MMMM d, yyyy")}</dd></div>
          </div>
          <div className="flex items-start gap-3">
            <Clock aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
            <div><dt className="text-sm text-muted-foreground">Time</dt><dd className="mt-1 text-sm font-medium">{format(new Date(schedule.startDateTime), "h:mm a")} - {format(new Date(schedule.endDateTime), "h:mm a")}</dd></div>
          </div>
          <div className="flex items-start gap-3">
            <UserRound aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />
            <div><dt className="text-sm text-muted-foreground">Consultation</dt><dd className="mt-1 text-sm font-medium">{doctor.qualification}</dd></div>
          </div>
        </dl>
      </section>

      {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => void payLater()} disabled={isPending}>
          <UserRound aria-hidden="true" className="size-4" />
          {payLaterMutation.isPending ? "Booking..." : "Pay later"}
        </Button>
        <Button type="button" onClick={() => void payNow()} disabled={isPending}>
          <CreditCard aria-hidden="true" className="size-4" />
          {payNowMutation.isPending ? "Opening checkout..." : "Pay now"}
        </Button>
      </div>
    </main>
  )
}

export default AppointmentBookingConfirmation