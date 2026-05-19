'use client'
import { Users, UserCheck, UserPlus, UserX } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActiveStatus, StatusCounts } from '@/types'

const navItems: {
  status: ActiveStatus
  label: string
  shortLabel: string
  Icon: React.FC<{ size?: number; className?: string }>
}[] = [
  { status: 'all',          label: 'All Vendors',    shortLabel: 'All',       Icon: Users },
  { status: 'hired',        label: 'Already Hired',  shortLabel: 'Hired',     Icon: UserCheck },
  { status: 'to_hire',      label: 'Potential Hire', shortLabel: 'Potential', Icon: UserPlus },
  { status: 'do_not_hire',  label: 'Do Not Hire',    shortLabel: 'Avoid',     Icon: UserX },
]

interface SidebarProps {
  active: ActiveStatus
  onChange: (s: ActiveStatus) => void
  counts: StatusCounts
}

export function Sidebar({ active, onChange, counts }: SidebarProps) {
  const total = counts.hired + counts.to_hire + counts.do_not_hire
  const countMap: Record<ActiveStatus, number> = {
    all: total,
    hired: counts.hired,
    to_hire: counts.to_hire,
    do_not_hire: counts.do_not_hire,
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-sidebar min-h-screen sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
            V
          </div>
          <span className="font-semibold text-sm text-foreground tracking-tight">VendorTrack</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            My Vendors
          </p>
          {navItems.map(({ status, label, Icon }) => {
            const isActive = active === status
            return (
              <button
                key={status}
                onClick={() => onChange(status)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-sidebar-accent text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <Icon size={15} />
                <span className="flex-1 text-left">{label}</span>
                <span className={cn(
                  'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                  isActive ? 'bg-foreground/10' : 'bg-border text-muted-foreground',
                )}>
                  {countMap[status]}
                </span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-background/95 backdrop-blur-sm">
        {navItems.map(({ status, shortLabel, Icon }) => {
          const isActive = active === status
          return (
            <button
              key={status}
              onClick={() => onChange(status)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors cursor-pointer',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon size={18} />
              {shortLabel}
            </button>
          )
        })}
      </nav>
    </>
  )
}
