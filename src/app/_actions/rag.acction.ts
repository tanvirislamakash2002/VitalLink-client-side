/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { queryRagService } from "@/services/rag.services"

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
                            if (d.name) text += `${i + 1}.**${d.name}**\n`
                            if (d.specialty) text += `Specialization: **${d.specialty}**\n`
                            if (d.reason) text += `Why:${d.name}\n`
                            return text + "\n"
                        })
                } else {
                    answer = "I couldn't find any doctors matching your query. Please try another query."
                }
            }
        }

        const sources = 100 - Number(response?.data?.sources[0]?.similarity) * 100

        return {
            success: true,
            answer: answer as string,
            sources: `${sources.toFixed(2)}% matched`
        }
    } catch (error) {
        console.log(error)
    }
}