'use client'
import Image from 'next/image'
import {
  X, Phone, MapPin, Globe, Tag, Pencil, Trash2,
  ExternalLink, CheckCircle2, XCircle, HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/StarRating'
import { getImagePublicUrl } from '@/lib/api/images'
import { parseLinkBlock, formatDate, getHostname, cn } from '@/lib/utils'
import type { Company } from '@/types'

const statusPill: Record<string, string> = {
  hired:        'bg-emerald-50  text-emerald-700 border-emerald-200',
  to_hire:      'bg-blue-50     text-blue-700    border-blue-200',
  do_not_hire:  'bg-rose-50     text-rose-700    border-rose-200',
}
const statusLabel: Record<string, string> = {
  hired: 'Already Hired', to_hire: 'Potential Hire', do_not_hire: 'Do Not Hire',
}
const bannerBg: Record<string, string> = {
  hired:       'bg-gradient-to-br from-emerald-100 to-emerald-50',
  to_hire:     'bg-gradient-to-br from-blue-100 to-blue-50',
  do_not_hire: 'bg-gradient-to-br from-rose-100 to-rose-50',
}
const willHireCfg = {
  yes:   { Icon: CheckCircle2, label: 'Will Hire Again',     cls: 'text-emerald-600' },
  no:    { Icon: XCircle,      label: 'Will Not Hire Again', cls: 'text-rose-600' },
  maybe: { Icon: HelpCircle,   label: 'Maybe Hire Again',    cls: 'text-amber-600' },
} as const

interface Props {
  company: Company | null
  onClose: () => void
  onEdit: (c: Company) => void
  onDelete: (c: Company) => void
}

export function VendorDetailPanel({ company, onClose, onEdit, onDelete }: Props) {
  if (!company) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20"
        style={{ animation: 'fade-in 180ms ease forwards' }}
      />

      {/* Slide-over panel */}
      <aside
        className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        style={{ animation: 'slide-in-right 280ms cubic-bezier(0.32, 0.72, 0, 1) forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <h2 className="font-semibold text-base">Vendor Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel" className="h-8 w-8 cursor-pointer">
            <X size={15} />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <PanelBody company={company} />
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 border-t border-border px-5 py-4 shrink-0">
          <Button className="flex-1 cursor-pointer gap-2" onClick={() => { onEdit(company); onClose() }}>
            <Pencil size={13} /> Edit
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => { onDelete(company); onClose() }}
          >
            <Trash2 size={13} /> Delete
          </Button>
        </div>
      </aside>
    </>
  )
}

function PanelBody({ company }: { company: Company }) {
  const { links, freeText: notesText } = parseLinkBlock(company.notes)
  const firstImage = company.company_images?.[0]
  const imageUrl = firstImage ? getImagePublicUrl(firstImage.storage_path) : null
  const willHire = company.will_hire_again ? willHireCfg[company.will_hire_again] : null

  return (
    <>
      {/* Hero */}
      <div className={cn('relative flex h-44 items-center justify-center overflow-hidden', imageUrl ? 'bg-muted' : bannerBg[company.status])}>
        {imageUrl
          ? <Image src={imageUrl} alt={company.name} fill className="object-cover" />
          : <span className="text-6xl font-bold opacity-20 select-none">{company.name.charAt(0).toUpperCase()}</span>
        }
      </div>

      <div className="space-y-5 px-5 py-5">
        {/* Name + badges */}
        <div>
          <h3 className="text-xl font-semibold leading-snug">{company.name}</h3>
          {company.purpose && <p className="mt-0.5 text-sm text-muted-foreground">{company.purpose}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium', statusPill[company.status])}>
              {statusLabel[company.status]}
            </span>
            {company.category && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {company.category.name}
              </span>
            )}
          </div>
        </div>

        {/* Website */}
        {company.website_url && (
          <a href={company.website_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <Globe size={14} className="shrink-0" />
            {getHostname(company.website_url)}
            <ExternalLink size={11} className="text-muted-foreground" />
          </a>
        )}

        {/* Contact */}
        {(company.contact_name || company.telephone || company.address) && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</p>
            {company.contact_name && <p className="text-sm font-medium">{company.contact_name}</p>}
            {company.telephone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={12} className="shrink-0" />{company.telephone}
              </div>
            )}
            {company.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={12} className="mt-0.5 shrink-0" />{company.address}
              </div>
            )}
          </div>
        )}

        {/* Price */}
        {company.price && (
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Tag size={13} className="shrink-0 text-primary" />{company.price}
          </div>
        )}

        {/* Hired details */}
        {company.status === 'hired' && (company.work_rating != null || company.hire_date || willHire) && (
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Hire Details</p>
            {company.work_rating != null && <StarRating value={company.work_rating} readOnly size="sm" />}
            {company.hire_date && <p className="text-xs text-muted-foreground">Hired: {formatDate(company.hire_date)}</p>}
            {willHire && (
              <div className={cn('flex items-center gap-1.5 text-xs font-medium', willHire.cls)}>
                <willHire.Icon size={13} />{willHire.label}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {notesText && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
            <p className="text-sm leading-relaxed text-foreground">{notesText}</p>
          </div>
        )}

        {/* Additional links */}
        {links.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Links</p>
            <div className="space-y-1">
              {links.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink size={12} className="shrink-0" />
                  {l.label || l.url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
