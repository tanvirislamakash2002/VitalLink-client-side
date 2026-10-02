"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { IDoctorSchedule } from "@/types/schedule.types"

export async function getMyDoctorSchedules(queryString: string) {
  const endpoint = queryString
    ? `/doctor-schedules/my-doctor-schedules?${queryString}`
    : "/doctor-schedules/my-doctor-schedules"
  return httpClient.get<IDoctorSchedule[]>(endpoint)
}

export type DoctorScheduleActionResult<T = undefined> =
  | { success: true; message: string; data: T }
  | { success: false; message: string }

function getErrorMessage(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { message?: string } }; message?: string }
  return responseError.response?.data?.message ?? responseError.message ?? fallback
}

export async function bookDoctorSchedulesAction(scheduleIds: string[]): Promise<DoctorScheduleActionResult<IDoctorSchedule[]>> {
  try {
    const response = await httpClient.post<IDoctorSchedule[]>("/doctor-schedules/create-my-doctor-schedule", { scheduleIds })
    return { success: true, message: response.message, data: response.data }
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Could not book the selected schedules.") }
  }
}

export async function deleteMyDoctorScheduleAction(scheduleId: string): Promise<DoctorScheduleActionResult> {
  try {
    const response = await httpClient.delete<void>(
      `/doctor-schedules/delete-my-doctor-schedule/${encodeURIComponent(scheduleId)}`
    )
    return { success: true, message: response.message, data: undefined }
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Could not remove this schedule.") }
  }
}