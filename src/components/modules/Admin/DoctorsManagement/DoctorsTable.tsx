"use client"

import { getDoctors } from '@/services/doctor.services';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

const DoctorsTable = () => {
    const { data: doctorDataResponse } = useQuery({
        queryKey: ["doctors"],
        queryFn: getDoctors
    })

    const { data: doctors } = doctorDataResponse! || []

    return (
        <div>

        </div>
    );
};

export default DoctorsTable;