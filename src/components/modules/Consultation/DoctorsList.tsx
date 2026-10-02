"use client"
import { dataTableFilter, DataTableFilterDefinition } from "@/components/shared/table/DataTableFilters"
import DataTableFilters from "@/components/shared/table/DataTableFilters"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getPublicDoctors } from "@/services/doctor.services"
import { getSpecialties } from "@/services/specialty.services"
import { IPublicDoctor } from "@/types/doctor.types"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Search, Star } from "lucide-react"
import Link from "next/link"
import { useDataTableUrlState } from "@/hooks/useDataTableUrlState"

const doctorSortFields: Record<string, string> = {
    name: "name",
    experience: "experience",
    appointmentFee: "appointmentFee",
    averageRating: "averageRating",
}

const doctorFilterParams = ["gender", "specialties.specialtyId", "appointmentFee", "experience"]

function doctorInitials(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "D"
}

function DoctorCard({ doctor }: { doctor: IPublicDoctor }) {
    return (
        <article className="flex min-h-full flex-col overflow-hidden rounded-lg border bg-card">
            <div className="flex items-start gap-4 border-b p-5">
                <Avatar size="lg" className="size-20">
                    <AvatarImage src={doctor.profilePhoto ?? undefined} alt={doctor.name} />
                    <AvatarFallback className="text-lg">{doctorInitials(doctor.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <h2 className="wrap-break-word text-lg font-semibold">{doctor.name}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">{doctor.designation}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                        <Star aria-hidden="true" className="size-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{doctor.averageRating > 0 ? doctor.averageRating.toFixed(1) : "New"}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex min-h-7 flex-wrap gap-1.5">
                    {doctor.specialties.length ? doctor.specialties.map(({ specialty }) => (
                        <Badge variant="secondary" key={specialty.id}>{specialty.title}</Badge>
                    )) : <span className="text-sm text-muted-foreground">No specialties listed</span>}
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <dt className="text-muted-foreground">Experience</dt>
                        <dd className="mt-0.5 font-medium">{doctor.experience ? `${doctor.experience} years` : "Not listed"}</dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground">Consultation fee</dt>
                        <dd className="mt-0.5 font-medium">${doctor.appointmentFee.toFixed(2)}</dd>
                    </div>
                    <div className="col-span-2 min-w-0">
                        <dt className="text-muted-foreground">Currently practicing</dt>
                        <dd className="mt-0.5 wrap-break-word font-medium">{doctor.currentWorkingPlace}</dd>
                    </div>
                    <div className="col-span-2 min-w-0">
                        <dt className="text-muted-foreground">Qualification</dt>
                        <dd className="mt-0.5 wrap-break-word font-medium">{doctor.qualification}</dd>
                    </div>
                </dl>
                <div className="mt-auto border-t pt-4">
                    <Link
                        href={`/consultation/doctor/${encodeURIComponent(doctor.id)}`}
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        View details <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                </div>
            </div>
        </article>
    )
}

const DoctorsList = () => {
    const tableUrl = useDataTableUrlState({
        sortFields: doctorSortFields,
        filterParams: doctorFilterParams,
        defaultPageSize: 10,
    })
    const { data: doctorResponse, isFetching, isError, refetch } = useQuery({
        queryKey: ["doctors", tableUrl.queryParamsObject],
        queryFn: () => getPublicDoctors(tableUrl.queryString),
        staleTime: 1000 * 60 * 5,
    })
    const { data: specialtyResponse } = useQuery({
        queryKey: ["specialties"],
        queryFn: getSpecialties,
        staleTime: 1000 * 60 * 60,
    })

    const doctors = doctorResponse?.data ?? []
    const pageCount = Math.max(doctorResponse?.meta?.totalPages ?? 1, 1)
    const isBusy = isFetching || tableUrl.isNavigationPending
    const doctorFilters: DataTableFilterDefinition[] = [
        dataTableFilter.multiple(
            "specialties",
            "Specialty",
            (specialtyResponse?.data ?? []).map((specialty) => ({ label: specialty.title, value: specialty.id })),
            "specialties.specialtyId",
        ),
        dataTableFilter.single("gender", "Gender", [
            { label: "Female", value: "FEMALE" },
            { label: "Male", value: "MALE" },
            { label: "Other", value: "OTHER" },
        ]),
        dataTableFilter.range("experience", "Experience", { lowerLabel: "Minimum years", upperLabel: "Maximum years" }),
        dataTableFilter.range("appointmentFee", "Fee", { lowerLabel: "Minimum fee", upperLabel: "Maximum fee" }),
    ]
    const currentSort = tableUrl.sorting[0]
    const selectedSort = currentSort ? `${currentSort.id}:${currentSort.desc ? "desc" : "asc"}` : ""

    return (
        <main className="mx-auto w-full max-w-7xl space-y-6">
            <header className="space-y-2">
                <p className="text-sm font-medium text-primary">VitalLink Consultation</p>
                <h1 className="text-3xl font-semibold">Find a doctor</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">Browse doctors by specialty, experience, and consultation fee.</p>
            </header>

            <section aria-label="Find doctors" className="space-y-4 border-y py-4">
                <div className="flex flex-wrap items-start gap-3">
                    <div className="relative min-w-64 max-w-lg flex-1">
                        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={tableUrl.searchTerm}
                            onChange={(event) => tableUrl.handleSearchChange(event.target.value)}
                            placeholder="Search doctors, qualifications, or workplaces"
                            aria-label="Search doctors"
                            className="pl-9"
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <DataTableFilters
                            filters={doctorFilters}
                            values={tableUrl.filterValues}
                            onFilterChange={tableUrl.handleFilterChange}
                            onClearAll={tableUrl.clearFilters}
                            disabled={isBusy}
                        />
                    </div>
                    <label className="flex h-9 items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Sort</span>
                        <select
                            aria-label="Sort doctors"
                            className="h-9 rounded-md border border-input bg-background px-2"
                            value={selectedSort}
                            onChange={(event) => {
                                const [id, direction] = event.target.value.split(":")
                                tableUrl.handleSortingChange(id ? [{ id, desc: direction === "desc" }] : [])
                            }}
                            disabled={isBusy}
                        >
                            <option value="">Default</option>
                            <option value="averageRating:desc">Highest rated</option>
                            <option value="experience:desc">Most experienced</option>
                            <option value="name:asc">Name A-Z</option>
                        </select>
                    </label>
                </div>
                <p className="text-sm text-muted-foreground" aria-live="polite">
                    {doctorResponse?.meta?.total ?? 0} doctors found
                </p>
            </section>

            {isError ? (
                <div className="space-y-3 py-12 text-center">
                    <p className="text-sm text-destructive">Could not load doctors.</p>
                    <Button type="button" variant="outline" onClick={() => void refetch()}>Try again</Button>
                </div>
            ) : isBusy && !doctorResponse ? (
                <p role="status" className="py-12 text-center text-sm text-muted-foreground">Loading doctors...</p>
            ) : doctors.length ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy={isBusy}>
                        {doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
                    </div>
                    {isBusy && <p role="status" className="text-center text-sm text-muted-foreground">Updating results...</p>}
                </>
            ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No doctors match these filters.</p>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                <span className="text-sm text-muted-foreground">Page {tableUrl.pagination.pageIndex + 1} of {pageCount}</span>
                <div className="flex items-center gap-2">
                    <label htmlFor="doctor-page-size" className="text-sm text-muted-foreground">Cards per page</label>
                    <select
                        id="doctor-page-size"
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        value={tableUrl.pagination.pageSize}
                        onChange={(event) => tableUrl.handlePaginationChange({ pageIndex: 0, pageSize: Number(event.target.value) })}
                        disabled={isBusy}
                    >
                        {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
                    </select>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => tableUrl.handlePaginationChange({ ...tableUrl.pagination, pageIndex: tableUrl.pagination.pageIndex - 1 })}
                        disabled={isBusy || tableUrl.pagination.pageIndex <= 0}
                    >
                        Previous
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => tableUrl.handlePaginationChange({ ...tableUrl.pagination, pageIndex: tableUrl.pagination.pageIndex + 1 })}
                        disabled={isBusy || tableUrl.pagination.pageIndex >= pageCount - 1}
                    >
                        Next
                    </Button>
                </div>
            </footer>
        </main>
    )
}

export default DoctorsList
