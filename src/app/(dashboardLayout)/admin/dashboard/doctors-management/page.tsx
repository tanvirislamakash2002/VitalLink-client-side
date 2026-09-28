import DoctorsTable from '@/components/modules/Admin/DoctorsManagement/DoctorsTable';
import { getDoctors } from '@/services/doctor.services';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import React from 'react'

const DoctorsManagementPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const queryParamsObjects = await searchParams;

  const queryString = Object.keys(queryParamsObjects)
    .map((key) => {
      const value = queryParamsObjects[key]
      if (Array.isArray(value)) {
        return value.map((v) => `${key}=${v}`).join("&")
      }
      return `${key}=${value}`
    })
    .join("&")

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["doctors", queryParamsObjects],
    queryFn: () => getDoctors(queryString),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DoctorsTable queryString={queryString} queryParamsObject={queryParamsObjects} />
    </HydrationBoundary>
  )
}

export default DoctorsManagementPage
