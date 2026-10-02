import { BadgeCheck } from "lucide-react"
import Link from "next/link"

const PaymentSuccessStatus = () => {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <BadgeCheck aria-hidden="true" className="size-12 text-emerald-600" />
      <h1 className="text-2xl font-semibold">Payment successful</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Stripe completed your payment. Your appointment status is updated by the payment notification and will appear in your appointment history.
      </p>
      <Link href="/dashboard/my-appointments" className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        View my appointments
      </Link>
    </main>
  )
}

export default PaymentSuccessStatus