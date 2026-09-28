import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import React from 'react';

interface DataTableActions<TData> {
    onView?: (data: TData) => void;
    onEdit?: (data: TData) => void;
    onDelete?: (data: TData) => void;
}

interface DataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    actions?: DataTableActions<TData>;
    emptyMessage?: string;
    isLoading?: boolean;
}

const DataTable = <TData,>({ data, columns, actions, emptyMessage, isLoading }: DataTableProps<TData>) => {

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    })
    return (
        <div>

        </div>
    );
};

export default DataTable;