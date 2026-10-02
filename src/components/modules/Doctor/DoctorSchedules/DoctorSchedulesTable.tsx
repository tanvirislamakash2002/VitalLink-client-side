"use client"

import DataTable from "@/components/shared/table/DataTable"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useDataTableUrlState } from "@/hooks/useDataTableUrlState"
import { getMyDoctorSchedules } from "@/services/doctorSchedule.services"
import { IDoctorSchedule } from "@/types/schedule.types"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useState } from "react"
import BookDoctorSchedulesDialog from "./BookDoctorSchedulesDialog"
import DoctorScheduleDetailsDialog from "./DoctorScheduleDetailsDialog"
import DeleteMyDoctorScheduleDialog from "./DeleteMyDoctorScheduleDialog"

const scheduleSortFields: Record<string, string> = {
	startDateTime: "schedule.startDateTime",
}

function formatDateTime(value: Date | string) {
	const date = new Date(value)
	return Number.isNaN(date.getTime()) ? "Invalid date" : format(date, "MMM dd, yyyy · h:mm a")
}

const scheduleColumns: ColumnDef<IDoctorSchedule>[] = [
	{
		id: "startDateTime",
		accessorFn: (row) => row.schedule.startDateTime,
		header: "Starts",
		cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.schedule.startDateTime)}</span>,
	},
	{
		id: "endDateTime",
		accessorFn: (row) => row.schedule.endDateTime,
		header: "Ends",
		enableSorting: false,
		cell: ({ row }) => <span className="whitespace-nowrap">{formatDateTime(row.original.schedule.endDateTime)}</span>,
	},
	{
		id: "isBooked",
		accessorKey: "isBooked",
		header: "Appointment status",
		enableSorting: false,
		cell: ({ row }) => (
			<Badge variant={row.original.isBooked ? "secondary" : "outline"}>
				{row.original.isBooked ? "Patient booked" : "Open"}
			</Badge>
		),
	},
]

const DoctorSchedulesTable = () => {
	const [scheduleToView, setScheduleToView] = useState<IDoctorSchedule | null>(null)
	const [scheduleToDelete, setScheduleToDelete] = useState<IDoctorSchedule | null>(null)
	const tableUrl = useDataTableUrlState({ sortFields: scheduleSortFields })
	const { data: scheduleResponse, isFetching, isError } = useQuery({
		queryKey: ["my-doctor-schedules", tableUrl.queryParamsObject],
		queryFn: () => getMyDoctorSchedules(tableUrl.queryString),
		staleTime: 1000 * 60,
	})

	const isTableLoading = isFetching || tableUrl.isNavigationPending

	return (
		<>
		<div className="space-y-4">
			{isError && (
				<Alert variant="destructive">
					<AlertDescription>Could not load your schedules. Please try again.</AlertDescription>
				</Alert>
			)}
			<DataTable
				data={scheduleResponse?.data ?? []}
				columns={scheduleColumns}
				toolbarActions={<BookDoctorSchedulesDialog />}
				search={{ value: tableUrl.searchTerm, onSearchChange: tableUrl.handleSearchChange, debounceMs: 650 }}
				sorting={{ state: tableUrl.sorting, onSortingChange: tableUrl.handleSortingChange }}
				pagination={{
					state: tableUrl.pagination,
					pageCount: Math.max(scheduleResponse?.meta?.totalPages ?? 1, 1),
					onPaginationChange: tableUrl.handlePaginationChange,
					disabled: isTableLoading,
				}}
				isLoading={isTableLoading}
				emptyMessage="You have not booked any schedules yet."
				actions={{ onView: setScheduleToView, onDelete: setScheduleToDelete }}
			/>
		</div>
		{scheduleToView && (
			<DoctorScheduleDetailsDialog schedule={scheduleToView} onClose={() => setScheduleToView(null)} />
		)}
		{scheduleToDelete && (
			<DeleteMyDoctorScheduleDialog schedule={scheduleToDelete} onClose={() => setScheduleToDelete(null)} />
		)}
		</>
	)
}

export default DoctorSchedulesTable
