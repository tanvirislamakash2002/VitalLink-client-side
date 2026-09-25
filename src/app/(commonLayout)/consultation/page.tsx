import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import React from 'react'
import { getDoctors } from './_actions';
import DoctorsList from '@/components/modules/Consultation/DoctorsList';

const ConsultationPage = async () => {

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  })
  return (
    <div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DoctorsList />
      </HydrationBoundary>
    </div>
  )
}

export default ConsultationPage