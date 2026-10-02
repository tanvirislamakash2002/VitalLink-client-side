import DoctorSchedulesTable from "@/components/modules/Doctor/DoctorSchedules/DoctorSchedulesTable"

export default function MySchedulesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">My schedules</h1>
        <p className="mt-1 text-sm text-muted-foreground">View your schedule slots and manage availability.</p>
      </header>
      <DoctorSchedulesTable />
    </div>
  )
}
