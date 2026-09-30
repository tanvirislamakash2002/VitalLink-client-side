"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { IDoctor } from "@/types/doctor.types"
import { createDoctorPayloadSchema } from "@/zod/doctor.validation"

export type CreateDoctorResult =
  | { success: true; message: string; data: IDoctor }
  | { success: false; message: string }

export async function createDoctorAction(formData: FormData): Promise<CreateDoctorResult> {
  const serializedPayload = formData.get("data")
  if (typeof serializedPayload !== "string") {
    return { success: false, message: "Doctor information is missing." }
  }

  let payload: unknown
  try {
    payload = JSON.parse(serializedPayload)
  } catch {
    return { success: false, message: "Doctor information is invalid." }
  }

  const parsedPayload = createDoctorPayloadSchema.safeParse(payload)
  if (!parsedPayload.success) {
    return { success: false, message: parsedPayload.error.issues[0]?.message ?? "Please check the doctor details." }
  }

  const requestData = new FormData()
  requestData.append("data", JSON.stringify({
    ...parsedPayload.data,
    doctor: {
      ...parsedPayload.data.doctor,
      address: parsedPayload.data.doctor.address || undefined,
    },
  }))

  const file = formData.get("file")
  if (file instanceof File && file.size > 0) {
    requestData.append("file", file, file.name)
  }

  try {
    const response = await httpClient.postFormData<IDoctor>("/users/create-doctor", requestData)
    return { success: true, message: response.message, data: response.data }
  } catch (error) {
    const responseError = error as { response?: { data?: { message?: string } }; message?: string }
    return {
      success: false,
      message: responseError.response?.data?.message ?? responseError.message ?? "Could not create the doctor.",
    }
  }
}