'use client'
import { Loader2, PackageSearch } from 'lucide-react'
import { CompanyCard } from '@/components/company/CompanyCard'
import type { Company, CompanyStatus } from '@/types'

const emptyMessages: Record<CompanyStatus, string> = {
  hired: 'No companies hired yet. Add your first one!',
  to_hire: 'Your "Potential Hire" list is empty. Add some prospects.',
  do_not_hire: 'No companies on your do-not-hire list.',
}

const headerColors: Record<CompanyStatus, string> = {
  hired: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  to_hire: 'bg-blue-50 border-blue-200 text-blue-800',
  do_not_hire: 'bg-rose-50 border-rose-200 text-rose-800',
}

const badgeColors: Record<CompanyStatus, string> = {
  hired: 'bg-emerald-100 text-emerald-700',
  to_hire: 'bg-blue-100 text-blue-700',
  do_not_hire: 'bg-rose-100 text-rose-700',
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

  const hasAnyCategory = companies.some(c => c.category_id !== null)

  if (!hasAnyCategory) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map(company => (
          <CompanyCard key={company.id} company={company} onEdit={() => onEdit(company)} onDelete={() => onDelete(company)} />
        ))}
      </div>
    )
  }

  // Build groups: keyed by category_id (or '__none__' for uncategorized)
  const groupMap = new Map<string, { name: string; companies: Company[] }>()

  for (const company of companies) {
    const key = company.category_id ?? '__none__'
    const name = company.category?.name ?? 'Uncategorized'
    if (!groupMap.has(key)) groupMap.set(key, { name, companies: [] })
    groupMap.get(key)!.companies.push(company)
  }

  // Sort: named categories alphabetically, uncategorized last
  const groups = [...groupMap.entries()].sort(([a, ga], [b, gb]) => {
    if (a === '__none__') return 1
    if (b === '__none__') return -1
    return ga.name.localeCompare(gb.name)
  })

  return (
    <div className="space-y-6">
      {groups.map(([key, group]) => (
        <div key={key} className="space-y-3">
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${headerColors[status]}`}>
            <span className="text-sm font-semibold">{group.name}</span>
            <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${badgeColors[status]}`}>
              {group.companies.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.companies.map(company => (
              <CompanyCard key={company.id} company={company} onEdit={() => onEdit(company)} onDelete={() => onDelete(company)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
