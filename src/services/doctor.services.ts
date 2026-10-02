"use server"
import { httpClient } from "@/lib/axios/httpClient"
import { IDoctor, IDoctorProfile, IPublicDoctor } from "@/types/doctor.types"



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

export const getPublicDoctorById = async (doctorId: string) => {
    return httpClient.get<IPublicDoctor | null>(`/doctors/public/${encodeURIComponent(doctorId)}`)
}

export const getPublicDoctors = async (queryString: string) => {
    const endpoint = queryString ? `/doctors/public?${queryString}` : "/doctors/public"
    return httpClient.get<IPublicDoctor[]>(endpoint)
}