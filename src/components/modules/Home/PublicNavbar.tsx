"use client"

import { Button } from "@/components/ui/button"
import { HeartPulse, Menu, Stethoscope, User, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Find a Doctor", href: "/consultation" },
  { label: "How It Works", href: "/#steps" },
]

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-95"
          aria-label="VitalLink home"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-md shadow-emerald-900/15">
            <HeartPulse aria-hidden="true" className="size-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-emerald-950 leading-none">
              VitalLink
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/80">
              Healthcare Hub
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
          >
            <User className="size-4" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/register"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/15 transition-all hover:bg-emerald-900 hover:shadow-md active:scale-[0.98]"
          >
            <span>Create Account</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl md:hidden border-slate-200 text-slate-700 hover:bg-slate-100"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-public-navigation"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-public-navigation"
          aria-label="Mobile navigation"
          className="animate-in slide-in-from-top-2 duration-200 border-b border-slate-200/80 bg-white px-4 py-4 shadow-lg md:hidden"
        >
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
              >
                <span>{link.label}</span>
                {link.href === "/consultation" && (
                  <Stethoscope className="size-4 text-emerald-700" />
                )}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl bg-emerald-800 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900"
              >
                Create Account
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}

export default PublicNavbar