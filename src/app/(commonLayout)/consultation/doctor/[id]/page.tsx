import DoctorDetailsPage from "@/components/modules/Consultation/DoctorDetailsPage"

async function ConsultationDoctorByIdPage({ params }: PageProps<"/consultation/doctor/[id]">) {
  const { id } = await params
  return <DoctorDetailsPage doctorId={id} />
}

export default ConsultationDoctorByIdPage
