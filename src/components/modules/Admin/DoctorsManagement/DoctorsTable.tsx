"use client"

import DataTable from '@/components/shared/table/DataTable';
import CreateDoctorDialog from './CreateDoctorDialog';
import EditDoctorDialog from './EditDoctorDialog';
import { getDoctors } from '@/services/doctor.services';
import { getSpecialties } from '@/services/specialty.services';
import { IDoctor } from '@/types/doctor.types';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useOptimistic, useState, useTransition } from 'react';
import { doctorColumns } from './doctorsColumns';
import { DataTableFilterDefinition, DataTableFilterValue, RangeOperator } from '@/components/shared/table/DataTableFilters';

const DoctorsTable = () => {
    const [doctorToEdit, setDoctorToEdit] = useState<IDoctor | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const searchTerm = searchParams.get('searchTerm') ?? '';
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
    const { data: specialtiesResponse } = useQuery({
        queryKey: ["specialties"],
        queryFn: getSpecialties,
        staleTime: 1000 * 60 * 60,
    })

    const doctors = doctorDataResponse?.data ?? [];
    const paginationState = optimisticPagination ?? {
        pageIndex: (doctorDataResponse?.meta?.page ?? currentPage) - 1,
        pageSize: doctorDataResponse?.meta?.limit ?? currentLimit,
    };
    const specialtyIds = searchParams.getAll('specialties.specialtyId');
    const filterValues: Record<string, DataTableFilterValue> = {
        gender: searchParams.get('gender') ?? undefined,
        'specialties.specialtyId': specialtyIds.length ? specialtyIds : undefined,
        appointmentFee: {
            ...(searchParams.get('appointmentFee[gt]') ? { gt: searchParams.get('appointmentFee[gt]')! } : {}),
            ...(searchParams.get('appointmentFee[gte]') ? { gte: searchParams.get('appointmentFee[gte]')! } : {}),
            ...(searchParams.get('appointmentFee[lt]') ? { lt: searchParams.get('appointmentFee[lt]')! } : {}),
            ...(searchParams.get('appointmentFee[lte]') ? { lte: searchParams.get('appointmentFee[lte]')! } : {}),
        },
    };
    const activeFeeFilters = filterValues.appointmentFee as Partial<Record<RangeOperator, string>>;
    if (Object.keys(activeFeeFilters).length === 0) delete filterValues.appointmentFee;

    const doctorFilters: DataTableFilterDefinition[] = [
        {
            id: 'specialties',
            param: 'specialties.specialtyId',
            label: 'Specialties',
            type: 'multiple',
            options: (specialtiesResponse?.data ?? []).map((specialty) => ({
                label: specialty.title,
                value: specialty.id,
            })),
        },
        {
            id: 'gender',
            param: 'gender',
            label: 'Gender',
            type: 'single',
            options: [
                { label: 'Male', value: 'MALE' },
                { label: 'Female', value: 'FEMALE' },
                { label: 'Other', value: 'OTHER' },
            ],
        },
        {
            id: 'appointmentFee',
            param: 'appointmentFee',
            label: 'Appointment fee',
            type: 'range',
            lowerLabel: 'Minimum fee',
            upperLabel: 'Maximum fee',
        },
    ];

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

    const handleSearchChange = (nextSearchTerm: string) => {
        const normalizedSearchTerm = nextSearchTerm.trim();
        const params = new URLSearchParams(searchParams.toString());

        if (normalizedSearchTerm) {
            params.set('searchTerm', normalizedSearchTerm);
        } else {
            params.delete('searchTerm');
        }
        params.set('page', '1');

        if (
            params.get('searchTerm') === searchParams.get('searchTerm') &&
            searchParams.get('page') === '1'
        ) {
            return;
        }

        const query = params.toString();
        const nextUrl = query ? `${pathname}?${query}` : pathname;
        startTransition(() => {
            setOptimisticPagination({ ...paginationState, pageIndex: 0 });
            router.push(nextUrl, { scroll: false });
        });
    };

    const handleFilterChange = useCallback((param: string, value: DataTableFilterValue) => {
        const params = new URLSearchParams(searchParams.toString());

        if (param === 'appointmentFee') {
            (['gt', 'gte', 'lt', 'lte'] as const).forEach((operator) => params.delete(`appointmentFee[${operator}]`));
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                Object.entries(value).forEach(([operator, amount]) => {
                    if (amount !== undefined && amount !== '') {
                        params.set(`appointmentFee[${operator}]`, amount);
                    }
                });
            }
        } else {
            params.delete(param);
            if (Array.isArray(value)) {
                value.forEach((item) => params.append(param, item));
            } else if (typeof value === 'string' && value) {
                params.set(param, value);
            }
        }

        if (params.toString() === searchParams.toString()) return;
        params.set('page', '1');
        const query = params.toString();
        const nextUrl = query ? `${pathname}?${query}` : pathname;

        startTransition(() => {
            setOptimisticPagination({ pageIndex: 0, pageSize: currentLimit });
            router.push(nextUrl, { scroll: false });
        });
    }, [currentLimit, pathname, router, searchParams, setOptimisticPagination, startTransition]);

    const handleClearAllFilters = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        const filterParams = [
            'gender',
            'specialties.specialtyId',
            'appointmentFee[gt]',
            'appointmentFee[gte]',
            'appointmentFee[lt]',
            'appointmentFee[lte]',
        ];
        const hadAppliedFilters = filterParams.some((param) => params.has(param));

        filterParams.forEach((param) => params.delete(param));
        if (!hadAppliedFilters) return;

        params.set('page', '1');
        const query = params.toString();
        const nextUrl = query ? `${pathname}?${query}` : pathname;

        startTransition(() => {
            setOptimisticPagination({ pageIndex: 0, pageSize: currentLimit });
            router.push(nextUrl, { scroll: false });
        });
    }, [currentLimit, pathname, router, searchParams, setOptimisticPagination, startTransition]);

    const handleView = (doctor: IDoctor) => {
        console.log("View doctor", doctor)
    }
    const handleEdit = (doctor: IDoctor) => {
        setDoctorToEdit(doctor)
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
        <>
        <DataTable
            data={doctors}
            columns={doctorColumns}
            toolbarActions={<CreateDoctorDialog specialties={specialtiesResponse?.data ?? []} />}
            search={{ value: searchTerm, onSearchChange: handleSearchChange }}
            filters={{
                definitions: doctorFilters,
                values: filterValues,
                onFilterChange: handleFilterChange,
                onClearAll: handleClearAllFilters,
                disabled: isFetching || isNavigationPending,
            }}
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
        {doctorToEdit && (
            <EditDoctorDialog
                key={String(doctorToEdit.id)}
                doctor={doctorToEdit}
                specialties={specialtiesResponse?.data ?? []}
                onClose={() => setDoctorToEdit(null)}
            />
        )}
        </>
    )
};

export default DoctorsTable;