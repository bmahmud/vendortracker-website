import { CompanyDashboard } from '@/components/dashboard/CompanyDashboard'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <CompanyDashboard />
      </div>
    </main>
  )
}
