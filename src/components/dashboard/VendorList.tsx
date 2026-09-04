'use client'
import { useState, useRef } from 'react'
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

type SortCol = 'name' | 'category' | 'status' | 'price' | 'ranking' | 'date'
type SortDir = 'asc' | 'desc'
type ColKey = 'name' | 'category' | 'status' | 'price' | 'rating' | 'date' | 'ranking'

const DEFAULT_WIDTHS: Record<ColKey, number> = {
  name: 220, category: 130, status: 110, price: 90, rating: 100, date: 95, ranking: 80,
}
const MIN_WIDTHS: Record<ColKey, number> = {
  name: 80, category: 70, status: 100, price: 70, rating: 80, date: 75, ranking: 65,
}

const rankingCfg: Record<number, { label: string; cls: string }> = {
  1: { label: '1', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  2: { label: '2', cls: 'bg-slate-100 text-slate-700 border-slate-300' },
  3: { label: '3', cls: 'bg-orange-100 text-orange-700 border-orange-300' },
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

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
    } else if (col === 'ranking') {
      cmp = (a.ranking ?? 99) - (b.ranking ?? 99)
    } else if (col === 'date') {
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return dir === 'asc' ? cmp : -cmp
  })
}

function ResizeHandle({ col, onResize }: { col: ColKey; onResize: (col: ColKey, delta: number) => void }) {
  const lastX = useRef<number | null>(null)
  return (
    <div
      className="absolute right-0 top-0 h-full w-3 cursor-col-resize z-10 flex items-center justify-center group/rh select-none"
      onPointerDown={e => {
        e.preventDefault()
        lastX.current = e.clientX
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={e => {
        if (lastX.current === null || !e.buttons) return
        onResize(col, e.clientX - lastX.current)
        lastX.current = e.clientX
      }}
      onPointerUp={() => { lastX.current = null }}
    >
      <div className="h-4 w-px bg-muted-foreground/40 opacity-0 group-hover/rh:opacity-100 transition-opacity" />
    </div>
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
  const [colWidths, setColWidths] = useState<Record<ColKey, number>>(DEFAULT_WIDTHS)

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  function handleResize(col: ColKey, delta: number) {
    setColWidths(prev => ({
      ...prev,
      [col]: Math.max(MIN_WIDTHS[col], prev[col] + delta),
    }))
  }

  const gridTemplate = `${colWidths.name}px ${colWidths.category}px ${colWidths.status}px ${colWidths.price}px ${colWidths.rating}px ${colWidths.date}px ${colWidths.ranking}px 72px`

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
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        {/* Table header */}
        <div
          className="hidden md:grid items-center rounded-t-xl border-b-2 border-border bg-muted/60 px-6 py-3.5 gap-4"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {([
            { col: 'name',    label: 'Vendor' },
            { col: 'category',label: 'Category' },
            { col: 'status',  label: 'Status' },
            { col: 'price',   label: 'Price' },
            { col: 'rating',  label: 'Rating', noSort: true },
            { col: 'date',    label: 'Date Added' },
            { col: 'ranking', label: 'Rank' },
          ] as { col: ColKey; label: string; noSort?: boolean }[]).map(({ col, label, noSort }) => (
            <div key={col} className="relative min-w-0">
              {noSort ? (
                <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-foreground/60 select-none">
                  {label}
                </span>
              ) : (
                <button
                  onClick={() => handleSort(col as SortCol)}
                  className={cn(
                    'flex items-center gap-1 text-xs font-bold uppercase tracking-widest cursor-pointer select-none transition-colors',
                    sortCol === col ? 'text-foreground' : 'text-foreground/50 hover:text-foreground/80',
                  )}
                >
                  {label}
                  {sortCol === col
                    ? sortDir === 'asc'
                      ? <ArrowUp size={10} className="shrink-0" />
                      : <ArrowDown size={10} className="shrink-0" />
                    : <ArrowUpDown size={10} className="shrink-0 opacity-30" />
                  }
                </button>
              )}
              <ResizeHandle col={col} onResize={handleResize} />
            </div>
          ))}
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
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {/* Vendor */}
              <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-none">
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  avatarBg[company.status],
                )}>
                  {company.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      onClick={() => onVendorClick(company)}
                      onMouseEnter={e => {
                        if (!notesText) return
                        const r = e.currentTarget.getBoundingClientRect()
                        setTooltip({ text: notesText, x: r.left, y: r.bottom })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-left"
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
              <div className="hidden md:block min-w-0">
                {company.category
                  ? <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{company.category.name}</span>
                  : <span className="text-xs text-muted-foreground/40">—</span>
                }
              </div>

              {/* Status */}
              <div className="hidden md:block min-w-0">
                <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium', statusPill[company.status])}>
                  {statusLabel[company.status]}
                </span>
              </div>

              {/* Price */}
              <div className="hidden md:block min-w-0">
                {company.price
                  ? <span className="text-sm font-semibold">{company.price}</span>
                  : <span className="text-xs text-muted-foreground/40">—</span>
                }
              </div>

              {/* Rating */}
              <div className="hidden md:block min-w-0">
                {company.work_rating
                  ? <StarRating value={company.work_rating} readOnly size="sm" />
                  : <span className="text-xs text-muted-foreground/40">—</span>
                }
              </div>

              {/* Date Added */}
              <div className="hidden md:block min-w-0">
                <span className="text-xs text-muted-foreground">{formatShortDate(company.created_at)}</span>
              </div>

              {/* Ranking */}
              <div className="hidden md:block min-w-0">
                {company.ranking && rankingCfg[company.ranking]
                  ? <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold', rankingCfg[company.ranking].cls)}>
                      {rankingCfg[company.ranking].label}
                    </span>
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
