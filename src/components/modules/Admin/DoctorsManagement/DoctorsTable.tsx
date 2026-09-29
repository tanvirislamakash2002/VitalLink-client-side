"use client"

import DataTable from '@/components/shared/table/DataTable';
import { getDoctors } from '@/services/doctor.services';
import { IDoctor } from '@/types/doctor.types';
import { SortingState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { doctorColumns } from './doctorsColumns';

const DoctorsTable = ({ queryString, queryParamsObject }: { queryString: string; queryParamsObject: { [key: string]: string | string[] | undefined } }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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

    const { data: doctorDataResponse, isLoading } = useQuery({
        queryKey: ["doctors", queryParamsObject],
        queryFn: () => getDoctors(queryString)
    })

    const doctors = doctorDataResponse?.data ?? [];

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

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
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
            isLoading={isLoading}
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