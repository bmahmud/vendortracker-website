'use client'
import { cn } from '@/lib/utils'
import type { CompanyStatus, StatusCounts } from '@/types'

const tabs: { status: CompanyStatus; label: string; activeClass: string; activeBadge: string }[] = [
  {
    status: 'hired',
    label: 'Already Hired',
    activeClass: 'bg-emerald-500 text-white shadow-md shadow-emerald-200',
    activeBadge: 'bg-white/25 text-white',
  },
  {
    status: 'to_hire',
    label: 'To Hire',
    activeClass: 'bg-blue-500 text-white shadow-md shadow-blue-200',
    activeBadge: 'bg-white/25 text-white',
  },
  {
    status: 'do_not_hire',
    label: 'Do Not Hire',
    activeClass: 'bg-rose-500 text-white shadow-md shadow-rose-200',
    activeBadge: 'bg-white/25 text-white',
  },
]

interface StatusTabsProps {
  active: CompanyStatus
  onChange: (status: CompanyStatus) => void
  counts: StatusCounts
}

export function StatusTabs({ active, onChange, counts }: StatusTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 rounded-2xl bg-white/60 backdrop-blur-sm border border-purple-100 p-1.5 shadow-sm w-max min-w-full">
      {tabs.map(tab => (
        <button
          key={tab.status}
          onClick={() => onChange(tab.status)}
          className={cn(
            'flex shrink-0 items-center gap-2 px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200',
            active === tab.status
              ? tab.activeClass
              : 'text-muted-foreground hover:text-foreground hover:bg-purple-50',
          )}
        >
          {tab.label}
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full min-w-[20px] h-5 px-1.5 text-xs font-bold',
              active === tab.status
                ? tab.activeBadge
                : 'bg-muted text-muted-foreground',
            )}
          >
            {counts[tab.status]}
          </span>
        </button>
      ))}
      </div>
    </div>
  )
}
