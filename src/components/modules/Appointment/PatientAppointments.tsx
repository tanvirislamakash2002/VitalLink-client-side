"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMyAppointments, initiateAppointmentPaymentAction } from "@/services/appointment.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarDays, Clock, CreditCard, UserRound } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const PatientAppointments = () => {
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [payingAppointmentId, setPayingAppointmentId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: getMyAppointments,
  })
  const paymentMutation = useMutation({ mutationFn: initiateAppointmentPaymentAction })
  const appointments = [...(response?.data ?? [])].sort(
    (first, second) => new Date(first.schedule.startDateTime).getTime() - new Date(second.schedule.startDateTime).getTime()
  )

  const payAppointment = async (appointmentId: string) => {
    setPaymentError(null)
    setPayingAppointmentId(appointmentId)
    try {
      const result = await paymentMutation.mutateAsync(appointmentId)
      if (!result.success) {
        setPaymentError(result.message)
        return
      }
      if (!result.data.paymentUrl) {
        setPaymentError("Could not create a payment link. Please try again.")
        return
      }
      window.location.assign(result.data.paymentUrl)
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Could not start payment.")
    } finally {
      setPayingAppointmentId(null)
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Care history</p>
          <h1 className="text-2xl font-semibold">My appointments</h1>
          <p className="text-sm text-muted-foreground">Review appointment times, payment status, and doctor details.</p>
        </div>
        <Link href="/consultation" className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Book an appointment
        </Link>
      </header>

      {paymentError && <Alert variant="destructive"><AlertDescription>{paymentError}</AlertDescription></Alert>}
      {isLoading ? (
        <p role="status" className="py-12 text-center text-sm text-muted-foreground">Loading appointments...</p>
      ) : isError ? (
        <div className="space-y-3 py-12 text-center">
          <p className="text-sm text-destructive">Could not load your appointments.</p>
          <Button type="button" variant="outline" onClick={() => void refetch()}>Try again</Button>
        </div>
      ) : appointments.length ? (
        <div className="divide-y border-y">
          {appointments.map((appointment) => {
            const isUnpaid = appointment.paymentStatus === "UNPAID"
            const isCancelled = appointment.status === "CANCELED"
            const doctorInitials = appointment.doctor.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
            return (
              <article key={appointment.id} className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.8fr)_auto] md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar>
                    <AvatarImage src={appointment.doctor.profilePhoto ?? undefined} alt={appointment.doctor.name} />
                    <AvatarFallback>{doctorInitials || "D"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{appointment.doctor.name}</h2>
                    <p className="truncate text-sm text-muted-foreground">{appointment.doctor.designation}</p>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <p className="flex items-center gap-2">
                    <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    {format(new Date(appointment.schedule.startDateTime), "EEE, MMM d, yyyy")}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    {format(new Date(appointment.schedule.startDateTime), "h:mm a")} - {format(new Date(appointment.schedule.endDateTime), "h:mm a")}
                  </p>
                  <p className="text-muted-foreground">Fee: ${appointment.doctor.appointmentFee.toFixed(2)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Badge variant={isCancelled ? "destructive" : "outline"}>{appointment.status.toLowerCase().replaceAll("_", " ")}</Badge>
                  <Badge variant={isUnpaid ? "secondary" : "default"}>{appointment.paymentStatus.toLowerCase()}</Badge>
                  {isUnpaid && !isCancelled && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void payAppointment(appointment.id)}
                      disabled={paymentMutation.isPending}
                    >
                      <CreditCard aria-hidden="true" className="size-4" />
                      {payingAppointmentId === appointment.id ? "Opening..." : "Pay now"}
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <section className="space-y-3 py-16 text-center">
          <p className="font-medium">No appointments yet</p>
          <p className="text-sm text-muted-foreground">Your confirmed bookings will appear here.</p>
          <Link href="/consultation" className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted">
            Browse doctors
          </Link>
        </section>
      )}
    </main>
  )
}

export default PatientAppointments