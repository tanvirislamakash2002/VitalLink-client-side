"use server"

import { httpClient } from "@/lib/axios/httpClient"
import {
  IAvailableDoctorSchedule,
  IBookAppointmentPayload,
  IBookAppointmentResponse,
  IConfirmCheckoutResponse,
  IInitiatePaymentResponse,
  IPatientAppointment,
} from "@/types/appointment.types"

export async function getAvailableDoctorSchedules(doctorId: string) {
  return httpClient.get<IAvailableDoctorSchedule[]>(
    `/doctors/public/${encodeURIComponent(doctorId)}/available-schedules`
  )
}

export async function getMyAppointments() {
  return httpClient.get<IPatientAppointment[]>("/appointments/my-appointments")
}

export type AppointmentActionResult<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string }

function getErrorMessage(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { message?: string } }; message?: string }
  return responseError.response?.data?.message ?? responseError.message ?? fallback
}

export async function bookAppointmentAction(payload: IBookAppointmentPayload) {
  try {
    const response = await httpClient.post<IBookAppointmentResponse>("/appointments/book-appointment", payload)
    return { success: true, message: response.message, data: response.data } as const
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Could not start checkout.") } as const
  }
}

export async function bookAppointmentPayLaterAction(payload: IBookAppointmentPayload) {
  try {
    const response = await httpClient.post<IBookAppointmentResponse>("/appointments/book-appointment-with-pay-later", payload)
    return { success: true, message: response.message, data: response.data } as const
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Could not book this appointment.") } as const
  }
}

export async function initiateAppointmentPaymentAction(appointmentId: string) {
  try {
    const response = await httpClient.post<IInitiatePaymentResponse>(
      `/appointments/initiate-payment/${encodeURIComponent(appointmentId)}`,
      {}
    )
    return { success: true, message: response.message, data: response.data } as const
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Could not start payment.") } as const
  }
}

export async function confirmCheckoutSessionAction(sessionId: string) {
  try {
    const response = await httpClient.post<IConfirmCheckoutResponse>("/payments/confirm-checkout-session", { sessionId })
    return { success: true, message: response.message, data: response.data } as const
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Could not verify checkout payment.") } as const
  }
}