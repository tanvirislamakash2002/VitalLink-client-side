/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { ingestDoctorService, queryRagService } from "@/services/rag.services"

export const queryRagAction = async (query: string) => {
    try {
        const response = await queryRagService({ query })

        if (!response?.data?.answer) {
            return {
                success: false,
                error: "No answer received from AI. Please try again."
            }
        }

        let answer = response?.data?.answer;

        // if the answer is an object {doctors:[...]} convert it readable string

        if (typeof answer === "object" && answer !== null) {
            if ("doctors" in answer && Array.isArray(answer.doctors)) {
                const doctors = answer.doctors.slice(0, 5)

                if (doctors.length > 0) {
                    answer = `I found ${doctors.length} doctors who may help you:\n\n` +
                        doctors.map((d: any, i: number) => {
                            let text = ``;
                            if (d.name) text += `${i + 1}. **${d.name}**\n`
                            if (d.specialty) text += `Specialization: **${d.specialty}**\n`
                            if (d.reason) text += `Why: ${d.reason || d.name}\n`
                            return text
                        }).join("\n")
                } else {
                    answer = "I couldn't find any doctors matching your query. Please try another query."
                }
            } else {
                answer = JSON.stringify(answer, null, 2)
            }
        }

        const similarity = response?.data?.sources?.[0]?.similarity
        const sources = typeof similarity === "number"
            ? `${Math.max(0, 100 - Number(similarity) * 100).toFixed(2)}% matched`
            : response?.data?.sources?.length
                ? `${response.data.sources.length} sources matched`
                : null

        return {
            success: true,
            answer: answer as string,
            sources: sources ?? undefined
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            error: "Failed to reach the AI Assistant. Please check your connection and try again."
        }
    }
}

export const ingestDoctorsAction = async () => {
    try {
        const response = await ingestDoctorService()

        return {
            success: true,
            indexedCount: response.data.indexedCount,
            message:
                response.data.message ??
                response.message ??
                "Doctors data synced successfully."
        }
    } catch (error) {

        console.log(error)
        return {
            success: false,
            error: "Failed to sync doctor data. Please try again."
        }
    }
}

export const getUserRoleAction = async () => {
    try {
        const { getUserInfo } = await import("@/services/auth.services")
        const userInfo = await getUserInfo();
        return userInfo?.role ?? null
    } catch (error) {
        console.log(error)
        return null
    }
}