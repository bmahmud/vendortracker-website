'use client'
import { Loader2, PackageSearch, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/StarRating'
import { cn } from '@/lib/utils'
import type { Company } from '@/types'

const avatarBg: Record<string, string> = {
  hired:        'bg-emerald-100 text-emerald-700',
  to_hire:      'bg-blue-100   text-blue-700',
  do_not_hire:  'bg-rose-100   text-rose-700',
}

const statusPill: Record<string, string> = {
  hired:        'bg-emerald-50  text-emerald-700 border-emerald-200',
  to_hire:      'bg-blue-50     text-blue-700    border-blue-200',
  do_not_hire:  'bg-rose-50     text-rose-700    border-rose-200',
}

const statusLabel: Record<string, string> = {
  hired:        'Hired',
  to_hire:      'Potential',
  do_not_hire:  'Do Not Hire',
}

interface VendorListProps {
  companies: Company[]
  loading: boolean
  onEdit: (c: Company) => void
  onDelete: (c: Company) => void
}

export function VendorList({ companies, loading, onEdit, onDelete }: VendorListProps) {
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
        <p className="text-sm">No vendors found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Table header — desktop only */}
      <div className="hidden md:grid items-center border-b border-border bg-muted/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
        style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) 130px 96px 120px 72px' }}
      >
        <div>Vendor</div>
        <div>Category</div>
        <div>Status</div>
        <div>Price</div>
        <div>Rating</div>
        <div />
      </div>

      {/* Rows */}
      {companies.map((company, i) => (
        <div
          key={company.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 md:grid md:gap-4 md:px-6',
            i !== companies.length - 1 && 'border-b border-border',
          )}
          style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) 130px 96px 120px 72px' }}
        >
          {/* Vendor */}
          <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
            <div className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
              avatarBg[company.status],
            )}>
              {company.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{company.name}</p>
              {(company.contact_name || company.purpose) && (
                <p className="truncate text-xs text-muted-foreground">
                  {company.contact_name || company.purpose}
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="hidden md:block">
            {company.category
              ? <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{company.category.name}</span>
              : <span className="text-xs text-muted-foreground/40">—</span>
            }
          </div>

          {/* Status */}
          <div className="hidden md:block">
            <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium', statusPill[company.status])}>
              {statusLabel[company.status]}
            </span>
          </div>

          {/* Price */}
          <div className="hidden md:block">
            {company.price
              ? <span className="text-sm font-semibold text-foreground">{company.price}</span>
              : <span className="text-xs text-muted-foreground/40">—</span>
            }
          </div>

          {/* Rating */}
          <div className="hidden md:block">
            {company.work_rating
              ? <StarRating value={company.work_rating} readOnly size="sm" />
              : <span className="text-xs text-muted-foreground/40">—</span>
            }
          </div>

          {/* Actions */}
          <div className="ml-auto flex shrink-0 gap-1 md:ml-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onEdit(company)}
              aria-label={`Edit ${company.name}`}
            >
              <Pencil size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
              onClick={() => onDelete(company)}
              aria-label={`Delete ${company.name}`}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
