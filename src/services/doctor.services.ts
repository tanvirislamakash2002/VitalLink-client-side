"use server"
import { httpClient } from "@/lib/axios/httpClient"
import { IDoctor, IDoctorProfile } from "@/types/doctor.types"



export const getDoctors = async (queryString: string) => {
    try {
        const doctors = await httpClient.get<IDoctor[]>(queryString ? `/doctors?${queryString}` : "/doctors")
        return doctors
    } catch (error) {
        console.log("Error fetching doctors:", error)
        throw error;
    }
}

export const getDoctorById = async (doctorId: string) => {
    try {
        return await httpClient.get<IDoctorProfile | null>(`/doctors/${encodeURIComponent(doctorId)}`)
    } catch (error) {
        console.log("Error fetching doctor profile:", error)
        throw error
    }
}