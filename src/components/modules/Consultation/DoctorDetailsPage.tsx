"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getPublicDoctorById } from "@/services/doctor.services"
import { IPublicDoctor } from "@/types/doctor.types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft, Mail, MapPin, Phone, Star } from "lucide-react"
import Link from "next/link"

interface DoctorDetailsPageProps {
    doctorId: string
}

function initials(name: string) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "D"
}

function formatReviewDate(value: Date | string) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "Date unavailable" : format(date, "PPP")
}

function DoctorDetails({ doctor }: { doctor: IPublicDoctor }) {
    return (
        <>
            <section className="grid gap-6 border-b pb-8 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                <Avatar size="lg" className="size-28">
                    <AvatarImage src={doctor.profilePhoto ?? undefined} alt={doctor.name} />
                    <AvatarFallback className="text-2xl">{initials(doctor.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {doctor.specialties.map(({ specialty }) => <Badge key={specialty.id} variant="secondary">{specialty.title}</Badge>)}
                    </div>
                    <h1 className="wrap-break-word text-3xl font-semibold">{doctor.name}</h1>
                    <p className="text-base text-muted-foreground">{doctor.designation}</p>
                    <p className="text-sm text-muted-foreground">{doctor.qualification}</p>
                </div>
                <div className="flex items-center gap-2 md:justify-self-end">
                    <Star aria-hidden="true" className="size-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-semibold">{doctor.averageRating > 0 ? doctor.averageRating.toFixed(1) : "New"}</span>
                    <span className="text-sm text-muted-foreground">({doctor.reviews.length} reviews)</span>
                </div>
            </section>

            <section className="grid gap-8 border-b py-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
                <div>
                    <h2 className="text-lg font-semibold">Professional information</h2>
                    <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                        <div><dt className="text-sm text-muted-foreground">Experience</dt><dd className="mt-1 text-sm font-medium">{doctor.experience} years</dd></div>
                        <div><dt className="text-sm text-muted-foreground">Gender</dt><dd className="mt-1 text-sm font-medium">{doctor.gender.toLowerCase()}</dd></div>
                        <div><dt className="text-sm text-muted-foreground">Registration number</dt><dd className="mt-1 break-all text-sm font-medium">{doctor.registrationNumber}</dd></div>
                        <div><dt className="text-sm text-muted-foreground">Consultation fee</dt><dd className="mt-1 text-sm font-medium">${doctor.appointmentFee.toFixed(2)}</dd></div>
                        <div className="sm:col-span-2"><dt className="text-sm text-muted-foreground">Current workplace</dt><dd className="mt-1 text-sm font-medium">{doctor.currentWorkingPlace}</dd></div>
                        <div className="sm:col-span-2"><dt className="text-sm text-muted-foreground">Address</dt><dd className="mt-1 text-sm font-medium">{doctor.address || "Not listed"}</dd></div>
                    </dl>
                </div>
                <aside className="space-y-4 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                    <h2 className="text-lg font-semibold">Contact</h2>
                    <a href={`mailto:${doctor.email}`} className="flex min-w-0 items-start gap-3 text-sm hover:underline">
                        <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span className="break-all">{doctor.email}</span>
                    </a>
                    {doctor.contactNumber && (
                        <a href={`tel:${doctor.contactNumber}`} className="flex items-start gap-3 text-sm hover:underline">
                            <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                            <span>{doctor.contactNumber}</span>
                        </a>
                    )}
                    <p className="flex items-start gap-3 text-sm text-muted-foreground">
                        <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        <span>{doctor.currentWorkingPlace}</span>
                    </p>
                </aside>
            </section>

            <section className="space-y-4 py-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-xl font-semibold">Patient reviews</h2>
                    <p className="text-sm text-muted-foreground">{doctor.reviews.length} total</p>
                </div>
                {doctor.reviews.length ? (
                    <div className="divide-y border-y">
                        {doctor.reviews.map((review) => (
                            <article key={review.id} className="space-y-2 py-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2" aria-label={`${review.rating} out of 5 stars`}>
                                        <Star aria-hidden="true" className="size-4 fill-amber-400 text-amber-400" />
                                        <span className="text-sm font-semibold">{review.rating.toFixed(1)} / 5</span>
                                    </div>
                                    <time className="text-sm text-muted-foreground">{formatReviewDate(review.createdAt)}</time>
                                </div>
                                <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6">{review.comment || "No written comment."}</p>
                            </article>
                        ))}
                    </div>
                ) : <p className="border-y py-8 text-sm text-muted-foreground">This doctor does not have any reviews yet.</p>}
            </section>
        </>
    )
}

const DoctorDetailsPage = ({ doctorId }: DoctorDetailsPageProps) => {
    const { data: response, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["public-doctor-profile", doctorId],
        queryFn: () => getPublicDoctorById(doctorId),
    })
    const doctor = response?.data

    return (
        <main className="mx-auto w-full max-w-6xl space-y-6">
            <Link href="/consultation" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft aria-hidden="true" className="size-4" /> Browse doctors
            </Link>
            {isLoading && <p role="status" className="py-16 text-center text-sm text-muted-foreground">Loading doctor profile...</p>}
            {isError && (
                <div className="space-y-3 py-16 text-center">
                    <p className="text-sm text-destructive">{error instanceof Error ? error.message : "Could not load this doctor."}</p>
                    <Button type="button" variant="outline" onClick={() => void refetch()}>Try again</Button>
                </div>
            )}
            {!isLoading && !isError && doctor && <DoctorDetails doctor={doctor} />}
            {!isLoading && !isError && !doctor && <p className="py-16 text-center text-sm text-muted-foreground">Doctor not found.</p>}
        </main>
    )
}

export default DoctorDetailsPage