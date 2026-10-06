import Hero from "@/components/modules/Home/Hero"
import PublicFooter from "@/components/modules/Home/PublicFooter"
import PublicNavbar from "@/components/modules/Home/PublicNavbar"
import Steps from "@/components/modules/Home/Steps"
import TopDoctors from "@/components/modules/Home/TopDoctors"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicNavbar />
      <main className="flex-1">
        <Hero />
        <Steps />
        <TopDoctors />
      </main>
      <PublicFooter />
    </div>
  )
}
