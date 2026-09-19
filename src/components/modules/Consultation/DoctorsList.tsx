/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { getDoctors } from '@/src/app/(commonLayout)/consultation/_actions'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

function DoctorsList() {
    const { data } = useQuery({
        queryKey: ["doctors"],
        queryFn: () => getDoctors()
    })
    if (!data) return
    return (
        <div>
            {data.data.map((doctor: any) => (
                <div key={doctor.id}>{doctor.name}</div>
            ))}
        </div>
    )
}

export default DoctorsList
