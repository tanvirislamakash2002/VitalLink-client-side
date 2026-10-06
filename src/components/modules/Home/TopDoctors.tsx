"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getPublicDoctors } from "@/services/doctor.services"
import { IPublicDoctor } from "@/types/doctor.types"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Award, Briefcase, Calendar, Star } from "lucide-react"
import Link from "next/link"

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "DR"
  )
}

function DoctorCardSkeleton() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse">
      <div>
        <div className="flex items-start gap-4">
          <div className="size-16 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-200" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <div className="h-6 w-16 rounded-full bg-slate-200" />
          <div className="h-6 w-20 rounded-full bg-slate-200" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="h-4 w-20 rounded bg-slate-200" />
        <div className="h-9 w-28 rounded-lg bg-slate-200" />
      </div>
    </div>
  )
}

function TopDoctorCard({ doctor }: { doctor: IPublicDoctor }) {
  const reviewCount = doctor.reviews?.length || 0
  const ratingValue = Number(doctor.averageRating || 0)

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/30 hover:shadow-xl hover:shadow-emerald-950/5">
      <div>
        {/* Doctor Header: Avatar, Name, Designation */}
        <div className="flex items-start gap-4">
          <Avatar className="size-16 rounded-full border-2 border-emerald-100 ring-2 ring-emerald-500/10">
            <AvatarImage
              src={doctor.profilePhoto ?? undefined}
              alt={doctor.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-emerald-800 text-white font-bold text-base">
              {getInitials(doctor.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
              {doctor.name}
            </h3>
            <p className="truncate text-xs font-medium text-emerald-800">
              {doctor.designation || "Consultant"}
            </p>
            {doctor.currentWorkingPlace && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                <Briefcase className="size-3 shrink-0 text-slate-400" />
                <span className="truncate">{doctor.currentWorkingPlace}</span>
              </p>
            )}

            {/* Rating */}
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <Star aria-hidden="true" className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-800">
                {ratingValue > 0 ? ratingValue.toFixed(1) : "New"}
              </span>
              {reviewCount > 0 && (
                <span className="text-slate-400">({reviewCount} reviews)</span>
              )}
            </div>
          </div>
        </div>

        {/* Specialties Badges */}
        <div className="mt-4 flex min-h-[1.75rem] flex-wrap gap-1.5">
          {doctor.specialties && doctor.specialties.length > 0 ? (
            doctor.specialties.slice(0, 3).map(({ specialty }) => (
              <Badge
                key={specialty.id}
                variant="secondary"
                className="bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-medium text-[11px] px-2.5 py-0.5"
              >
                {specialty.title}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400">General Practice</span>
          )}
        </div>

        {/* Experience & Fee Highlights */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Award className="size-3.5 text-emerald-700" />
            <span>{doctor.experience ? `${doctor.experience}+ yrs exp` : "Experienced"}</span>
          </div>
          <div className="flex items-center justify-end font-semibold text-slate-900">
            {doctor.appointmentFee ? (
              <span>৳{doctor.appointmentFee} / visit</span>
            ) : (
              <span>Fee upon booking</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Profile & Book Consultation */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          href={`/consultation/doctor/${encodeURIComponent(doctor.id)}`}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-900 hover:shadow-md active:scale-[0.98]"
        >
          <Calendar className="size-3.5" />
          <span>Book Appointment</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  )
}

const TopDoctors = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["home-top-doctors"],
    queryFn: () => getPublicDoctors("page=1&limit=3&sortBy=averageRating&sortOrder=desc"),
    staleTime: 1000 * 60 * 5,
  })

  const doctors = data?.data ?? []

  return (
    <section id="top-doctors" className="scroll-mt-20 bg-gradient-to-b from-[#f8faf9] to-[#f0f5f2] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with "Show all doctors" action */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800">
              Verified Medical Specialists
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
              Featured Doctors
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
              Explore leading practitioners recognized for clinical excellence and compassionate care.
            </p>
          </div>

          <Link
            href="/consultation"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-900/20 bg-white px-5 text-sm font-semibold text-emerald-950 shadow-xs transition-all hover:bg-emerald-50 hover:border-emerald-800/40 active:scale-[0.98]"
          >
            <span>Show all doctors</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DoctorCardSkeleton />
            <DoctorCardSkeleton />
            <DoctorCardSkeleton />
          </div>
        ) : isError ? (
          <div className="mt-10 rounded-2xl border border-red-100 bg-red-50/50 p-8 text-center">
            <p className="text-sm font-medium text-slate-700">Unable to load featured doctors right now.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="mt-3 border-emerald-800 text-emerald-800 hover:bg-emerald-50"
            >
              Try again
            </Button>
          </div>
        ) : doctors.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.slice(0, 3).map((doctor) => (
              <TopDoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-12 text-center">
            <p className="text-sm text-slate-600">Doctor listings are being updated. Check back shortly.</p>
            <Link
              href="/consultation"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline"
            >
              Browse all specialists <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default TopDoctors