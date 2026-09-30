"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { ISpecialty } from "@/types/specialty.types"

export async function getSpecialties() {
    return httpClient.get<ISpecialty[]>("/specialties")
}