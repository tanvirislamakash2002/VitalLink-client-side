import SchedulesTable from '@/components/modules/Admin/SchedulesManagement/SchedulesTable';
import { getSchedules } from '@/services/schedule.services';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import React from 'react'

async function SchedulesManagementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const queryParamsObject = await searchParams;
  const params = new URLSearchParams();

  Object.entries(queryParamsObject).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  });

  const queryString = params.toString();
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["schedules", queryParamsObject],
    queryFn: () => getSchedules(queryString),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SchedulesTable />
    </HydrationBoundary>
  );
}

export default SchedulesManagementPage
