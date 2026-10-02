import AppointmentBookingConfirmation from "@/components/modules/Appointment/AppointmentBookingConfirmation"

async function BookAppointmentsPage({ searchParams }: PageProps<"/dashboard/book-appointments">) {
  const { doctorId, scheduleId } = await searchParams
  if (!doctorId || !scheduleId || Array.isArray(doctorId) || Array.isArray(scheduleId)) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Choose a doctor and time before confirming an appointment.</p>
  }

  return <AppointmentBookingConfirmation doctorId={doctorId} scheduleId={scheduleId} />
}

export default BookAppointmentsPage
