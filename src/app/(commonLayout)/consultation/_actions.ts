import { httpClient } from "@/src/lib/axios/httpClient"

export const getDoctors = async () => {
    const doctors = await httpClient.get("/doctors")
    return doctors
}