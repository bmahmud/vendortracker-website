'use client'
import { Loader2, PackageSearch } from 'lucide-react'
import { CompanyCard } from '@/components/company/CompanyCard'
import type { Company, CompanyStatus } from '@/types'

const emptyMessages: Record<CompanyStatus, string> = {
  hired: 'No companies hired yet. Add your first one!',
  to_hire: 'Your "To Hire" list is empty. Add some prospects.',
  do_not_hire: 'No companies on your do-not-hire list.',
}

interface CompanyGridProps {
  companies: Company[]
  loading: boolean
  status: CompanyStatus
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
}

export function CompanyGrid({ companies, loading, status, onEdit, onDelete }: CompanyGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!companies.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <PackageSearch size={48} className="opacity-25" />
        <p className="text-sm">{emptyMessages[status]}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map(company => (
        <CompanyCard
          key={company.id}
          company={company}
          onEdit={() => onEdit(company)}
          onDelete={() => onDelete(company)}
        />
      ))}
    </div>
  )
}
