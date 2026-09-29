"use client"

import DataTable from '@/components/shared/table/DataTable';
import { getDoctors } from '@/services/doctor.services';
import { IDoctor } from '@/types/doctor.types';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { doctorColumns } from './doctorsColumns';

const DoctorsTable = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const currentPage = Math.max(Number(pageParam) || 1, 1);
    const currentLimit = Math.max(Number(limitParam) || 10, 1);
    const [optimisticPagination, setOptimisticPagination] = useOptimistic<PaginationState | null, PaginationState>(
        null,
        (_, nextPagination) => nextPagination
    );
    const [isNavigationPending, startTransition] = useTransition();

    const queryParamsObject = Object.fromEntries(
        [...new Set(searchParams.keys())].map((key) => {
            const values = searchParams.getAll(key);
            return [key, values.length > 1 ? values : values[0]];
        })
    );

    const sortFieldByColumnId: Record<string, string> = {
        name: 'name',
        contactNumber: 'contactNumber',
        experience: 'experience',
        appointmentFee: 'appointmentFee',
        averageRating: 'averageRating',
        gender: 'gender',
        status: 'user.status',
        createdAt: 'createdAt',
    };

    const sortByParam = searchParams.get('sortBy');
    const sortOrderParam = searchParams.get('sortOrder');
    const sortingColumnId = Object.entries(sortFieldByColumnId)
        .find(([, sortBy]) => sortBy === sortByParam)?.[0];
    const sortingState: SortingState = sortingColumnId && (sortOrderParam === 'asc' || sortOrderParam === 'desc')
        ? [{ id: sortingColumnId, desc: sortOrderParam === 'desc' }]
        : [];

    const { data: doctorDataResponse, isFetching } = useQuery({
        queryKey: ["doctors", queryParamsObject],
        queryFn: () => getDoctors(queryString),
        staleTime: 1000 * 60 * 60,
    })

    const doctors = doctorDataResponse?.data ?? [];
    const paginationState = optimisticPagination ?? {
        pageIndex: (doctorDataResponse?.meta?.page ?? currentPage) - 1,
        pageSize: doctorDataResponse?.meta?.limit ?? currentLimit,
    };

    const handleSortingChange = (sorting: SortingState) => {
        const params = new URLSearchParams(searchParams.toString());
        const nextSort = sorting[0];
        const sortBy = nextSort && sortFieldByColumnId[nextSort.id];

        if (sortBy) {
            params.set('sortBy', sortBy);
            params.set('sortOrder', nextSort.desc ? 'desc' : 'asc');
        } else {
            params.delete('sortBy');
            params.delete('sortOrder');
        }
        params.set('page', '1');

        const query = params.toString();
        const nextUrl = query ? `${pathname}?${query}` : pathname;
        window.history.pushState(null, '', nextUrl);
    };

    const handlePaginationChange = (nextPagination: PaginationState) => {
        const nextPageIndex = nextPagination.pageSize !== paginationState.pageSize
            ? 0
            : nextPagination.pageIndex;
        const nextState = { ...nextPagination, pageIndex: nextPageIndex };

        if (nextState.pageIndex === paginationState.pageIndex && nextState.pageSize === paginationState.pageSize) {
            return;
        }

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextState.pageIndex + 1));
        params.set('limit', String(nextState.pageSize));

        const query = params.toString();
        const nextUrl = query ? `${pathname}?${query}` : pathname;
        startTransition(() => {
            setOptimisticPagination(nextState);
            router.push(nextUrl, { scroll: false });
        });
    };

    const handleView = (doctor: IDoctor) => {
        console.log("View doctor", doctor)
    }
    const handleEdit = (doctor: IDoctor) => {
        console.log("Edit doctor", doctor)
    }
    const handleDelete = (doctor: IDoctor) => {
        console.log("Delete doctor", doctor)
    }
    // const { getHeaderGroups, getRowModel } = useReactTable({
    //     data: doctors,
    //     columns: doctorColumns,
    //     getCoreRowModel: getCoreRowModel()
    // })

    // return (
    // <Table>
    //     <TableHeader>
    //         {getHeaderGroups().map((hg) => (
    //             <TableRow key={hg.id}>
    //                 {hg.headers.map((header) => (
    //                     <TableHead key={header.id}>
    //                         {flexRender(
    //                             header.column.columnDef.header,
    //                             header.getContext()
    //                         )}
    //                     </TableHead>
    //                 ))}
    //             </TableRow>
    //         ))}
    //     </TableHeader>
    //     <TableBody>
    //         {getRowModel().rows.map((row) => (
    //             <TableRow key={row.id}>
    //                 {row.getVisibleCells().map((cell) => (
    //                     <TableCell key={cell.id}>
    //                         {flexRender(cell.column.columnDef.cell, cell.getContext())}
    //                     </TableCell>
    //                 ))}
    //             </TableRow>
    //         ))}
    //     </TableBody>
    // </Table>
    // );

    return (
        <DataTable
            data={doctors}
            columns={doctorColumns}
            sorting={{ state: sortingState, onSortingChange: handleSortingChange }}
            pagination={{
                state: paginationState,
                pageCount: Math.max(doctorDataResponse?.meta?.totalPages ?? 1, 1),
                onPaginationChange: handlePaginationChange,
                disabled: isFetching || isNavigationPending,
            }}
            isLoading={isFetching || isNavigationPending}
            emptyMessage='No doctors found.'
            actions={
                {
                    onView: handleView,
                    onEdit: handleEdit,
                    onDelete: handleDelete,
                }
            }
        />
    )
};

export default DoctorsTable;