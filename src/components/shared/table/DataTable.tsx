import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
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

    const tableColumns: ColumnDef<TData>[] = actions ? [...columns,
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const rowData = row.original
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open Menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align='end'>
                        {
                            actions.onView && (
                                <DropdownMenuItem onClick={() => actions.onView?.(rowData)}>
                                    View
                                </DropdownMenuItem>
                            )
                        }
                        {
                            actions.onEdit && (
                                <DropdownMenuItem onClick={() => actions.onEdit?.(rowData)}>
                                    Edit
                                </DropdownMenuItem>
                            )
                        }
                        {
                            actions.onDelete && (
                                <DropdownMenuItem onClick={() => actions.onDelete?.(rowData)}>
                                    Delete
                                </DropdownMenuItem>
                            )
                        }
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
    ] : columns

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel()
    })
    return (
        <div>

        </div>
    );
};

export default DataTable;