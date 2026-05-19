'use client'
import { useState } from 'react'
import { Loader2, PackageSearch, Pencil, Trash2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/StarRating'
import { parseLinkBlock, getHostname, cn } from '@/lib/utils'
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
  hired: 'Hired', to_hire: 'Potential', do_not_hire: 'Do Not Hire',
}

const COL = 'minmax(0,2fr) minmax(0,1fr) 130px 96px 120px 72px'

interface Tooltip { text: string; x: number; y: number }

interface VendorListProps {
  companies: Company[]
  loading: boolean
  onVendorClick: (c: Company) => void
  onEdit: (c: Company) => void
  onDelete: (c: Company) => void
}

export function VendorList({ companies, loading, onVendorClick, onEdit, onDelete }: VendorListProps) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

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
    <>
      <div className="rounded-xl border border-border bg-card">
        {/* Table header */}
        <div
          className="hidden md:grid items-center rounded-t-xl border-b border-border bg-muted/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          style={{ gridTemplateColumns: COL }}
        >
          <div>Vendor</div>
          <div>Category</div>
          <div>Status</div>
          <div>Price</div>
          <div>Rating</div>
          <div />
        </div>

        {/* Rows */}
        {companies.map((company, i) => {
          const { freeText: notesText } = parseLinkBlock(company.notes)
          const isLast = i === companies.length - 1

          return (
            <div
              key={company.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 md:grid md:gap-4 md:px-6',
                !isLast && 'border-b border-border',
                isLast && 'rounded-b-xl',
              )}
              style={{ gridTemplateColumns: COL }}
            >
              {/* Vendor column */}
              <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
                {/* Avatar */}
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  avatarBg[company.status],
                )}>
                  {company.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  {/* Name row: clickable name + website icon */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      onClick={() => onVendorClick(company)}
                      onMouseEnter={e => {
                        if (!notesText) return
                        const r = e.currentTarget.getBoundingClientRect()
                        setTooltip({ text: notesText, x: r.left, y: r.bottom })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className="truncate text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-left max-w-[160px] md:max-w-[200px]"
                    >
                      {company.name}
                    </button>

                    {company.website_url && (
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="shrink-0 text-muted-foreground/50 hover:text-primary transition-colors"
                        aria-label={`Visit ${company.name} website`}
                        title={getHostname(company.website_url)}
                      >
                        <Globe size={12} />
                      </a>
                    )}
                  </div>

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
                  ? <span className="text-sm font-semibold">{company.price}</span>
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
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer"
                  onClick={() => onEdit(company)} aria-label={`Edit ${company.name}`}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => onDelete(company)} aria-label={`Delete ${company.name}`}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Fixed-position notes tooltip — escapes any overflow:hidden parent */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 w-64 max-w-xs rounded-lg border border-border bg-card px-3 py-2.5 text-xs text-muted-foreground shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y + 6 }}
        >
          <p className="line-clamp-5 italic leading-relaxed">{tooltip.text}</p>
        </div>
      )}
    </>
  )
}
