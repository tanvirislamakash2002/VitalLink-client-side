"use server"

import { getUserInfo } from "@/services/auth.services"
import { httpClient } from "@/lib/axios/httpClient"

export interface RagDoctorRecommendation {
  name: string
  reason: string
  specialty: string
}

export interface RagSource {
  sourceId: string
  sourceLabel: string | null
}

export interface RagQueryResult {
  answer: string | { doctors?: RagDoctorRecommendation[]; answer?: string }
  sources: RagSource[]
  contextUsed: boolean
}

export type RagActionResult<T> =
  | { success: true; data: T; message: string }
  | { success: false; message: string }

function errorMessage(error: unknown, fallback: string) {
  const responseError = error as { response?: { data?: { message?: string } }; message?: string }
  return responseError.response?.data?.message ?? responseError.message ?? fallback
}

export async function getCanSyncRagDoctorsAction() {
  const user = await getUserInfo()
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
}

export async function queryRagAction(query: string): Promise<RagActionResult<RagQueryResult>> {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return { success: false, message: "Enter a question first." }

  try {
    const response = await httpClient.post<RagQueryResult>("/rag/query", {
      query: normalizedQuery,
      limit: 5,
    })
    return { success: true, data: response.data, message: response.message }
  } catch (error) {
    return { success: false, message: errorMessage(error, "The assistant could not answer right now.") }
  }
}

export async function syncRagDoctorsAction(): Promise<RagActionResult<{ indexedCount?: number }>> {
  const user = await getUserInfo()
  if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
    return { success: false, message: "Only admins can sync doctor data." }
  }

  try {
    const response = await httpClient.post<{ indexedCount?: number }>("/rag/ingest-doctors", {})
    return { success: true, data: response.data, message: response.message }
  } catch (error) {
    return { success: false, message: errorMessage(error, "Doctor data could not be synced.") }
  }
}