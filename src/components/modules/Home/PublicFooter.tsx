import { ArrowRight, HeartPulse, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"
import Link from "next/link"

const PublicFooter = () => {
  return (
    <footer className="border-t border-emerald-950/20 bg-slate-950 text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] lg:gap-12 lg:px-8">
        {/* Brand Column */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="VitalLink home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-md shadow-emerald-900/30">
              <HeartPulse aria-hidden="true" className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">VitalLink</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            VitalLink empowers patients to discover top-rated medical specialists, book verified consultations,
            and manage personal healthcare with transparency and trust.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>Verified Healthcare & Data Privacy Protected</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-bold tracking-wider uppercase text-white">Platform</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li>
              <Link href="/" className="transition-colors hover:text-emerald-400">
                Home
              </Link>
            </li>
            <li>
              <Link href="/consultation" className="transition-colors hover:text-emerald-400">
                Find a Doctor
              </Link>
            </li>
            <li>
              <Link href="/#steps" className="transition-colors hover:text-emerald-400">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/#top-doctors" className="transition-colors hover:text-emerald-400">
                Featured Specialists
              </Link>
            </li>
          </ul>
        </div>

        {/* Portals */}
        <div>
          <h3 className="text-sm font-bold tracking-wider uppercase text-white">Portals</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            <li>
              <Link href="/login" className="transition-colors hover:text-emerald-400">
                Patient Sign In
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition-colors hover:text-emerald-400">
                Create Account
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-emerald-400">
                Doctor Portal
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-emerald-400">
                Administrator
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-sm font-bold tracking-wider uppercase text-white">Contact & Support</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="size-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>Dhaka, Bangladesh</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-emerald-400" />
              <span>+880 1800-VITALLINK</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-emerald-400" />
              <span>support@vitallink.health</span>
            </li>
          </ul>

          <Link
            href="/consultation"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-900/40 border border-emerald-700/40 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-800 hover:text-white"
          >
            <span>Book Doctor Consultation</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-black/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} VitalLink Healthcare Network. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Medical Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter