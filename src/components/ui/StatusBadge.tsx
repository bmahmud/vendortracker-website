import { cn } from '@/lib/utils'
import type { CompanyStatus } from '@/types'

const config: Record<CompanyStatus, { label: string; className: string }> = {
  hired: {
    label: 'Hired',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  to_hire: {
    label: 'To Hire',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  do_not_hire: {
    label: 'Do Not Hire',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

export function StatusBadge({ status }: { status: CompanyStatus }) {
  const { label, className } = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {label}
    </span>
  )
}
