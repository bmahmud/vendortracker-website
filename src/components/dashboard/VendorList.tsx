'use client'
import { useState } from 'react'
import { Loader2, PackageSearch, Pencil, Trash2, Globe, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
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
const statusOrder: Record<string, number> = { hired: 0, to_hire: 1, do_not_hire: 2 }

const COL = 'minmax(0,2fr) minmax(0,1fr) 130px 96px 120px 72px'

type SortCol = 'name' | 'category' | 'status' | 'price'
type SortDir = 'asc' | 'desc'

function extractPrice(price: string | null): number {
  if (!price) return Infinity
  const m = price.match(/[\d,]+\.?\d*/)
  return m ? parseFloat(m[0].replace(/,/g, '')) : Infinity
}

function sortCompanies(list: Company[], col: SortCol | null, dir: SortDir): Company[] {
  if (!col) return list
  return [...list].sort((a, b) => {
    let cmp = 0
    if (col === 'name') {
      cmp = a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    } else if (col === 'category') {
      const ca = a.category?.name.toLowerCase() ?? '￿'
      const cb = b.category?.name.toLowerCase() ?? '￿'
      cmp = ca.localeCompare(cb)
    } else if (col === 'status') {
      cmp = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0)
    } else if (col === 'price') {
      cmp = extractPrice(a.price) - extractPrice(b.price)
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

function SortHeader({
  col, label, sortCol, sortDir, onSort,
}: {
  col: SortCol; label: string; sortCol: SortCol | null; sortDir: SortDir
  onSort: (c: SortCol) => void
}) {
  const active = sortCol === col
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <button
      onClick={() => onSort(col)}
      className={cn(
        'flex items-center gap-1 cursor-pointer transition-colors select-none',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      <Icon size={11} className={cn('shrink-0', !active && 'opacity-40')} />
    </button>
  )
}

interface Tooltip { text: string; x: number; y: number }

interface VendorListProps {
  companies: Company[]
  loading: boolean
  onVendorClick: (c: Company) => void
  onEdit: (c: Company) => void
  onDelete: (c: Company) => void
}

export function VendorList({ companies, loading, onVendorClick, onEdit, onDelete }: VendorListProps) {
  const [sortCol, setSortCol] = useState<SortCol | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

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

  const sorted = sortCompanies(companies, sortCol, sortDir)

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        {/* Table header */}
        <div
          className="hidden md:grid items-center rounded-t-xl border-b border-border bg-muted/40 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{ gridTemplateColumns: COL }}
        >
          <SortHeader col="name"     label="Vendor"   sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
          <SortHeader col="category" label="Category" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
          <SortHeader col="status"   label="Status"   sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
          <SortHeader col="price"    label="Price"    sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
          <div className="text-muted-foreground">Rating</div>
          <div />
        </div>

        {/* Rows */}
        {sorted.map((company, i) => {
          const { freeText: notesText } = parseLinkBlock(company.notes)
          const isLast = i === sorted.length - 1

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
              {/* Vendor */}
              <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  avatarBg[company.status],
                )}>
                  {company.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
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

      {/* Fixed-position notes tooltip */}
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
