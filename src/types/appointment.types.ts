export interface IAvailableDoctorSchedule {
  id: string
  startDateTime: Date | string
  endDateTime: Date | string
}

export interface IBookAppointmentPayload {
  doctorId: string
  scheduleId: string
}

export interface IBookAppointmentResponse {
  appointment: { id: string }
  payment: { id: string }
  paymentUrl?: string | null
}

export interface IPatientAppointment {
  id: string
  status: string
  paymentStatus: string
  createdAt: Date | string
  doctor: {
    id: string
    name: string
    email: string
    profilePhoto?: string | null
    designation: string
    appointmentFee: number
  }
  schedule: {
    id: string
    startDateTime: Date | string
    endDateTime: Date | string
  }
}

export interface IInitiatePaymentResponse {
  paymentUrl: string | null
}

export interface IConfirmCheckoutResponse {
  appointmentId: string
  paymentStatus: string
}