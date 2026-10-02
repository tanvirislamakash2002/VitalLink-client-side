import { Suspense } from "react"
import DoctorsList from "@/components/modules/Consultation/DoctorsList"

const ConsultationPage = () => {
  return (
    <Suspense fallback={<p className="py-12 text-center text-sm text-muted-foreground">Loading doctors...</p>}>
      <DoctorsList />
    </Suspense>
  )
}

export default ConsultationPage