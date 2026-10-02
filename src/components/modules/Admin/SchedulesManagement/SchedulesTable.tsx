"use client"

import DataTable from "@/components/shared/table/DataTable"
import { Badge } from "@/components/ui/badge"
import { getSchedules } from "@/services/schedule.services"
import { ISchedule } from "@/types/schedule.types"
import { useDataTableUrlState } from "@/hooks/useDataTableUrlState"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useState } from "react"
import ScheduleDetailsDialog from "./ScheduleDetailsDialog"
import ScheduleFormDialog from "./ScheduleFormDialog"
import DeleteScheduleDialog from "./DeleteScheduleDialog"

const scheduleSortFields: Record<string, string> = {
	id: "id",
	startDateTime: "startDateTime",
	endDateTime: "endDateTime",
}

function formatDateTime(value: Date | string) {
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? "Invalid date" : format(date, "MMM dd, yyyy · h:mm a")
}

const scheduleColumns: ColumnDef<ISchedule>[] = [
	{
		id: "startDateTime",
		accessorKey: "startDateTime",
		header: "Starts",
		cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.startDateTime)}</span>,
	},
	{
		id: "endDateTime",
		accessorKey: "endDateTime",
		header: "Ends",
		cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.endDateTime)}</span>,
	},
	{
		id: "assignments",
		accessorFn: (row) => row.doctorSchedules.length,
		header: "Doctor assignments",
		enableSorting: false,
		cell: ({ row }) => {
			const assignments = row.original.doctorSchedules
			if (!assignments.length) return <span className="text-sm text-muted-foreground">Unassigned</span>
			const bookedCount = assignments.filter((assignment) => assignment.isBooked).length
			return (
				<div className="flex flex-wrap items-center gap-1.5">
					<span className="text-sm">{assignments.length} doctor{assignments.length === 1 ? "" : "s"}</span>
					<Badge variant={bookedCount === assignments.length ? "secondary" : "outline"}>
						{bookedCount}/{assignments.length} booked
					</Badge>
				</div>
			)
		},
	},
	{
		id: "appointments",
		accessorFn: (row) => row.appointments.length,
		header: "Appointments",
		enableSorting: false,
		cell: ({ row }) => row.original.appointments.length,
	},
]

const SchedulesTable = () => {
	const [scheduleToView, setScheduleToView] = useState<ISchedule | null>(null)
	const [scheduleToEdit, setScheduleToEdit] = useState<ISchedule | null>(null)
	const [scheduleToDelete, setScheduleToDelete] = useState<ISchedule | null>(null)
	const tableUrl = useDataTableUrlState({
		sortFields: scheduleSortFields,
	})

	const { data: scheduleResponse, isFetching } = useQuery({
		queryKey: ["schedules", tableUrl.queryParamsObject],
		queryFn: () => getSchedules(tableUrl.queryString),
		staleTime: 1000 * 60 * 60,
	})

	const schedules = scheduleResponse?.data ?? []
	const isTableLoading = isFetching || tableUrl.isNavigationPending

	return (
		<>
			<DataTable
				data={schedules}
				columns={scheduleColumns}
				toolbarActions={<ScheduleFormDialog mode="create" />}
				search={{ value: tableUrl.searchTerm, onSearchChange: tableUrl.handleSearchChange, debounceMs: 650 }}
				sorting={{ state: tableUrl.sorting, onSortingChange: tableUrl.handleSortingChange }}
				pagination={{
					state: tableUrl.pagination,
					pageCount: Math.max(scheduleResponse?.meta?.totalPages ?? 1, 1),
					onPaginationChange: tableUrl.handlePaginationChange,
					disabled: isTableLoading,
				}}
				isLoading={isTableLoading}
				emptyMessage="No schedules found."
				actions={{
					onView: setScheduleToView,
					onEdit: setScheduleToEdit,
					onDelete: setScheduleToDelete,
				}}
			/>

			{scheduleToView && (
				<ScheduleDetailsDialog
					key={`view-${scheduleToView.id}`}
					schedule={scheduleToView}
					onClose={() => setScheduleToView(null)}
				/>
			)}
			{scheduleToEdit && (
				<ScheduleFormDialog
					key={`edit-${scheduleToEdit.id}`}
					mode="edit"
					schedule={scheduleToEdit}
					onClose={() => setScheduleToEdit(null)}
				/>
			)}
			{scheduleToDelete && (
				<DeleteScheduleDialog
					key={`delete-${scheduleToDelete.id}`}
					schedule={scheduleToDelete}
					onClose={() => setScheduleToDelete(null)}
				/>
			)}
		</>
	)
}

export default SchedulesTable
