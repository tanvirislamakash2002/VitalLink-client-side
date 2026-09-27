import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import DoctorsList from '@/components/modules/Consultation/DoctorsList';
import { getDoctors } from '@/services/doctor.services';

const ConsultationPage = async () => {

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorsList />
    </HydrationBoundary>
  )
}

export default ConsultationPage