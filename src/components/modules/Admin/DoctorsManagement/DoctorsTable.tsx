"use client"

import DataTable from '@/components/shared/table/DataTable';
import CreateDoctorDialog from './CreateDoctorDialog';
import DeleteDoctorDialog from './DeleteDoctorDialog';
import DoctorProfileDialog from './DoctorProfileDialog';
import EditDoctorDialog from './EditDoctorDialog';
import { getDoctors } from '@/services/doctor.services';
import { getSpecialties } from '@/services/specialty.services';
import { IDoctor } from '@/types/doctor.types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { doctorColumns } from './doctorsColumns';
import { dataTableFilter, DataTableFilterDefinition } from '@/components/shared/table/DataTableFilters';
import { useDataTableUrlState } from '@/hooks/useDataTableUrlState';

const doctorSortFields: Record<string, string> = {
    name: 'name',
    contactNumber: 'contactNumber',
    experience: 'experience',
    appointmentFee: 'appointmentFee',
    averageRating: 'averageRating',
    gender: 'gender',
    status: 'user.status',
    createdAt: 'createdAt',
};

const doctorFilterParams = [
    'gender',
    'specialties.specialtyId',
    'appointmentFee',
];

const DoctorsTable = () => {
    const [doctorToView, setDoctorToView] = useState<IDoctor | null>(null);
    const [doctorToEdit, setDoctorToEdit] = useState<IDoctor | null>(null);
    const [doctorToDelete, setDoctorToDelete] = useState<IDoctor | null>(null);
    const tableUrl = useDataTableUrlState({
        sortFields: doctorSortFields,
        filterParams: doctorFilterParams,
    });

    const { data: doctorDataResponse, isFetching } = useQuery({
        queryKey: ["doctors", tableUrl.queryParamsObject],
        queryFn: () => getDoctors(tableUrl.queryString),
        staleTime: 1000 * 60 * 60,
    })
    const { data: specialtiesResponse } = useQuery({
        queryKey: ["specialties"],
        queryFn: getSpecialties,
        staleTime: 1000 * 60 * 60,
    })

    const doctors = doctorDataResponse?.data ?? [];
    const isTableLoading = isFetching || tableUrl.isNavigationPending;
    const filterValues = tableUrl.filterValues;

    const doctorFilters: DataTableFilterDefinition[] = [
        dataTableFilter.multiple(
            'specialties',
            'Specialties',
            (specialtiesResponse?.data ?? []).map((specialty) => ({
                label: specialty.title,
                value: specialty.id,
            })),
            'specialties.specialtyId',
        ),
        dataTableFilter.single('gender', 'Gender', [
                { label: 'Male', value: 'MALE' },
                { label: 'Female', value: 'FEMALE' },
                { label: 'Other', value: 'OTHER' },
        ]),
        dataTableFilter.range('appointmentFee', 'Appointment fee', {
            lowerLabel: 'Minimum fee',
            upperLabel: 'Maximum fee',
        }),
    ];

    const handleView = (doctor: IDoctor) => {
        setDoctorToView(doctor)
    }
    const handleEdit = (doctor: IDoctor) => {
        setDoctorToEdit(doctor)
    }
    const handleDelete = (doctor: IDoctor) => {
        setDoctorToDelete(doctor)
    }
    return (
        <>
        <DataTable
            data={doctors}
            columns={doctorColumns}
            toolbarActions={<CreateDoctorDialog specialties={specialtiesResponse?.data ?? []} />}
            search={{ value: tableUrl.searchTerm, onSearchChange: tableUrl.handleSearchChange }}
            filters={{
                definitions: doctorFilters,
                values: filterValues,
                onFilterChange: tableUrl.handleFilterChange,
                onClearAll: tableUrl.clearFilters,
                disabled: isTableLoading,
            }}
            sorting={{ state: tableUrl.sorting, onSortingChange: tableUrl.handleSortingChange }}
            pagination={{
                state: tableUrl.pagination,
                pageCount: Math.max(doctorDataResponse?.meta?.totalPages ?? 1, 1),
                onPaginationChange: tableUrl.handlePaginationChange,
                disabled: isTableLoading,
            }}
            isLoading={isTableLoading}
            emptyMessage='No doctors found.'
            actions={
                {
                    onView: handleView,
                    onEdit: handleEdit,
                    onDelete: handleDelete,
                }
            }
        />
        {doctorToView && (
            <DoctorProfileDialog
                key={String(doctorToView.id)}
                doctorId={String(doctorToView.id)}
                onClose={() => setDoctorToView(null)}
            />
        )}
        {doctorToEdit && (
            <EditDoctorDialog
                key={String(doctorToEdit.id)}
                doctor={doctorToEdit}
                specialties={specialtiesResponse?.data ?? []}
                onClose={() => setDoctorToEdit(null)}
            />
        )}
        {doctorToDelete && (
            <DeleteDoctorDialog
                key={String(doctorToDelete.id)}
                doctor={doctorToDelete}
                onClose={() => setDoctorToDelete(null)}
            />
        )}
        </>
    )
};

export default DoctorsTable;