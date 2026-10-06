import { ArrowRight, CalendarClock, FileHeart, Stethoscope } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Find Your Specialist",
    description: "Search doctors by medical specialty, experience, rating, or symptoms. Our AI assistant can also match you instantly.",
    icon: Stethoscope,
    badge: "Step 1",
  },
  {
    number: "02",
    title: "Select Time & Book",
    description: "Choose a consultation slot that suits your schedule. Complete secure booking in under two minutes.",
    icon: CalendarClock,
    badge: "Step 2",
  },
  {
    number: "03",
    title: "Receive Quality Care",
    description: "Consult with your physician, receive your digital prescription, and easily track follow-up schedules in your portal.",
    icon: FileHeart,
    badge: "Step 3",
  },
]

const Steps = () => {
  return (
    <section id="steps" className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800">
            Simple & Transparent Process
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
            How VitalLink Works
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Experience modern, hassle-free healthcare access in three straightforward steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mt-12 sm:mt-16 grid gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map(({ number, title, description, icon: Icon, badge }, index) => (
            <div
              key={number}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/30 hover:bg-white hover:shadow-xl hover:shadow-emerald-950/5"
            >
              <div>
                {/* Header with step number and icon */}
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-800/10 text-emerald-800 transition-colors group-hover:bg-emerald-800 group-hover:text-white">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <span className="text-2xl font-black text-slate-300 group-hover:text-emerald-700/50 transition-colors">
                    {number}
                  </span>
                </div>

                <div className="mt-6">
                  <span className="inline-block rounded-full bg-emerald-100/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
                    {badge}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {description}
                  </p>
                </div>
              </div>

              {/* Connecting Desktop Arrow */}
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 z-10 md:block lg:-right-5"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 shadow-sm">
                    <ArrowRight className="size-4 text-emerald-800" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Steps