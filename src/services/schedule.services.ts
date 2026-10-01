"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { ISchedule, ScheduleFormPayload } from "@/types/schedule.types"

export async function getSchedules(queryString: string) {
  const endpoint = queryString ? `/schedules?${queryString}` : "/schedules"
  return httpClient.get<ISchedule[]>(endpoint)
}

export type ScheduleActionResult<T = undefined> =
  | { success: true; message: string; data: T }
  | { success: false; message: string }

function getErrorMessage(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { message?: string } }; message?: string }
  return responseError.response?.data?.message ?? responseError.message ?? fallback
}

export async function createScheduleAction(payload: ScheduleFormPayload): Promise<ScheduleActionResult<ISchedule[]>> {
  try {
    const response = await httpClient.post<ISchedule[]>("/schedules", payload)
    return { success: true, message: response.message, data: response.data }
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Could not create schedules.") }
  }
}

export async function updateScheduleAction(scheduleId: string, payload: ScheduleFormPayload): Promise<ScheduleActionResult<ISchedule>> {
  try {
    const response = await httpClient.patch<ISchedule>(`/schedules/${encodeURIComponent(scheduleId)}`, payload)
    return { success: true, message: response.message, data: response.data }
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Could not update the schedule.") }
  }
}

export async function deleteScheduleAction(scheduleId: string): Promise<ScheduleActionResult> {
  try {
    const response = await httpClient.delete<void>(`/schedules/${encodeURIComponent(scheduleId)}`)
    return { success: true, message: response.message, data: undefined }
  } catch (error) {
    return { success: false, message: getErrorMessage(error, "Could not delete the schedule.") }
  }
}