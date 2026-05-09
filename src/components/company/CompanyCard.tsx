'use client'
import Image from 'next/image'
import { Phone, MapPin, Globe, Pencil, Trash2, Building2, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/StarRating'
import { getImagePublicUrl } from '@/lib/api/images'
import { parseLinkBlock, formatDate, cn } from '@/lib/utils'
import type { Company } from '@/types'

const borderAccent: Record<string, string> = {
  hired: 'border-l-emerald-500',
  to_hire: 'border-l-blue-500',
  do_not_hire: 'border-l-rose-500',
}

const bannerBg: Record<string, string> = {
  hired: 'bg-emerald-50',
  to_hire: 'bg-blue-50',
  do_not_hire: 'bg-rose-50',
}

const willHireConfig = {
  yes: { icon: CheckCircle2, label: 'Will Hire Again', className: 'text-green-600' },
  no: { icon: XCircle, label: 'Will Not Hire Again', className: 'text-red-600' },
  maybe: { icon: HelpCircle, label: 'Maybe Hire Again', className: 'text-amber-600' },
} as const

interface CompanyCardProps {
  company: Company
  onEdit: () => void
  onDelete: () => void
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  const { links } = parseLinkBlock(company.notes)
  const firstImage = company.company_images?.[0]
  const imageUrl = firstImage ? getImagePublicUrl(firstImage.storage_path) : null
  const willHire = company.will_hire_again ? willHireConfig[company.will_hire_again] : null

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-l-4 bg-card shadow-sm transition-shadow hover:shadow-md',
        borderAccent[company.status],
      )}
    >
      {/* Image banner */}
      <div className={cn('relative flex h-36 items-center justify-center overflow-hidden rounded-t-xl', imageUrl ? 'bg-muted' : bannerBg[company.status])}>
        {imageUrl ? (
          <Image src={imageUrl} alt={company.name} fill className="object-cover" />
        ) : (
          <Building2 size={44} className="opacity-25 text-current" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name + purpose */}
        <div>
          <h3 className="text-base font-semibold leading-snug">{company.name}</h3>
          {company.purpose && (
            <p className="truncate text-sm text-muted-foreground">{company.purpose}</p>
          )}
        </div>

        {/* Contact details */}
        {(company.contact_name || company.telephone || company.address) && (
          <div className="space-y-1">
            {company.contact_name && (
              <p className="text-sm font-medium">{company.contact_name}</p>
            )}
            {company.telephone && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone size={12} />
                {company.telephone}
              </div>
            )}
            {company.address && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin size={12} />
                <span className="truncate">{company.address}</span>
              </div>
            )}
          </div>
        )}

        {/* Hired-specific */}
        {company.status === 'hired' && (
          <div className="space-y-1.5">
            {company.work_rating != null && (
              <StarRating value={company.work_rating} readOnly size="sm" />
            )}
            {company.hire_date && (
              <p className="text-xs text-muted-foreground">
                Hired: {formatDate(company.hire_date)}
              </p>
            )}
            {willHire && (
              <div className={cn('flex items-center gap-1 text-xs font-medium', willHire.className)}>
                <willHire.icon size={13} />
                {willHire.label}
              </div>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Bottom row: links + actions */}
        <div className="flex items-center gap-2 border-t border-border pt-2">
          {company.website_url && (
            <a
              href={company.website_url}
              target="_blank"
              rel="noopener noreferrer"
              title="Website"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Globe size={15} />
            </a>
          )}
          {links.slice(0, 3).map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              title={l.label || l.url}
              className="max-w-[56px] truncate text-xs text-muted-foreground underline transition-colors hover:text-primary"
            >
              {l.label || 'Link'}
            </a>
          ))}
          <div className="flex-1" />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
