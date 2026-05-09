'use client'
import { cn } from '@/lib/utils'
import type { CompanyStatus, StatusCounts } from '@/types'

const tabs: { status: CompanyStatus; label: string; activeClass: string }[] = [
  {
    status: 'hired',
    label: 'Already Hired',
    activeClass: 'border-b-2 border-green-500 text-green-700 font-semibold',
  },
  {
    status: 'to_hire',
    label: 'To Hire',
    activeClass: 'border-b-2 border-blue-500 text-blue-700 font-semibold',
  },
  {
    status: 'do_not_hire',
    label: 'Do Not Hire',
    activeClass: 'border-b-2 border-red-500 text-red-700 font-semibold',
  },
]

const countColor: Record<CompanyStatus, string> = {
  hired: 'bg-green-100 text-green-700',
  to_hire: 'bg-blue-100 text-blue-700',
  do_not_hire: 'bg-red-100 text-red-700',
}

interface StatusTabsProps {
  active: CompanyStatus
  onChange: (status: CompanyStatus) => void
  counts: StatusCounts
}

export function StatusTabs({ active, onChange, counts }: StatusTabsProps) {
  return (
    <div className="flex border-b border-border overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.status}
          onClick={() => onChange(tab.status)}
          className={cn(
            'flex shrink-0 items-center gap-2 px-4 py-3 text-sm transition-colors',
            active === tab.status
              ? tab.activeClass
              : 'border-b-2 border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold',
              active === tab.status
                ? countColor[tab.status]
                : 'bg-muted text-muted-foreground',
            )}
          >
            {counts[tab.status]}
          </span>
        </button>
      ))}
    </div>
  )
}
