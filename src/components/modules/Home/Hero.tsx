import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Stethoscope, Users } from "lucide-react"
import Link from "next/link"

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eef7f2] via-[#f7faf8] to-white py-12 sm:py-16 lg:py-20">
      {/* Decorative background glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl sm:h-[28rem] sm:w-[28rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-20 -z-10 h-72 w-72 rounded-full bg-teal-100/50 blur-2xl"
      />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-8">
        {/* Left Column: Headlines and CTAs */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/90 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-900 shadow-xs backdrop-blur-xs">
            <span className="flex size-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Care, Connected • Trusted Healthcare Platform</span>
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl lg:leading-[1.12]">
            Healthcare, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 bg-clip-text text-transparent">
              within reach.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-8">
            Connect with verified medical specialists, schedule consultations on your terms,
            and keep your care history unified in one secure healthcare hub.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <Link
              href="/consultation"
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-emerald-800 px-6 text-sm font-semibold text-white shadow-md shadow-emerald-900/15 transition-all hover:bg-emerald-900 hover:shadow-lg hover:shadow-emerald-900/20 active:scale-[0.98]"
            >
              <span>Find a doctor</span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>

            <Link
              href="/#steps"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-emerald-900/20 bg-white px-5 text-sm font-semibold text-emerald-950 shadow-2xs transition-colors hover:bg-emerald-50/70 hover:border-emerald-800/30"
            >
              How it works
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 grid grid-cols-2 gap-4 border-t border-emerald-950/10 pt-6 sm:flex sm:flex-wrap sm:gap-8 text-xs sm:text-sm text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-800">
                <ShieldCheck aria-hidden="true" className="size-4" />
              </span>
              <span>Secure appointments</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-800">
                <Stethoscope aria-hidden="true" className="size-4" />
              </span>
              <span>Qualified specialists</span>
            </div>

            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-800">
                <CheckCircle2 aria-hidden="true" className="size-4" />
              </span>
              <span>Verified patient reviews</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/40 p-2.5 shadow-[0_24px_60px_-24px_rgba(6,78,59,0.25)] backdrop-blur-xs">
            <div
              role="img"
              aria-label="Doctor consulting with a patient in a modern clinical room"
              className="aspect-[4/3] w-full rounded-xl bg-[#d5e6dc] bg-cover bg-center sm:aspect-[16/11]"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=85')",
              }}
            />

            {/* Floating Info Card */}
            <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-4 max-w-[15rem] sm:max-w-[17rem] rounded-xl border border-white/80 bg-white/95 p-3.5 sm:p-4 shadow-xl shadow-emerald-950/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                <Sparkles className="size-4" />
                <span>AI Doctor Discovery</span>
              </div>
              <p className="mt-1 text-sm font-bold text-emerald-950">Specialists tailored for you</p>
              <p className="mt-0.5 text-xs text-slate-500">Ask our assistant or browse by department</p>
            </div>

            {/* Floating Stat Pill */}
            <div className="absolute top-4 right-4 hidden rounded-full border border-white/70 bg-white/90 px-3 py-1.5 shadow-md backdrop-blur-md sm:flex sm:items-center sm:gap-2">
              <Users className="size-4 text-emerald-700" />
              <span className="text-xs font-semibold text-slate-800">100+ Top Doctors</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero