'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/StarRating'
import { LinkBuilder } from './LinkBuilder'
import { ImageUploader } from './ImageUploader'
import { parseLinkBlock, cn } from '@/lib/utils'
import type { Company, CompanyFormValues, CompanyImage } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().default(''),
  address: z.string().default(''),
  telephone: z.string().default(''),
  purpose: z.string().default(''),
  status: z.enum(['hired', 'to_hire', 'do_not_hire']),
  hire_date: z.string().default(''),
  work_rating: z.number().min(1).max(5).nullable().default(null),
  will_hire_again: z.enum(['yes', 'no', 'maybe', '']).default(''),
  website_url: z.string().default(''),
  freeNotes: z.string().default(''),
  links: z.array(z.object({ url: z.string(), label: z.string() })).default([]),
})

const selectClass = cn(
  'w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

interface CompanyFormProps {
  defaultValues?: Company
  onSubmit: (values: CompanyFormValues, pendingFiles: File[]) => Promise<void>
  isSubmitting: boolean
}

export function CompanyForm({ defaultValues, onSubmit, isSubmitting }: CompanyFormProps) {
  const parsed = parseLinkBlock(defaultValues?.notes ?? null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<CompanyImage[]>(
    defaultValues?.company_images ?? [],
  )

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: defaultValues?.name ?? '',
      contact_name: defaultValues?.contact_name ?? '',
      address: defaultValues?.address ?? '',
      telephone: defaultValues?.telephone ?? '',
      purpose: defaultValues?.purpose ?? '',
      status: defaultValues?.status ?? 'to_hire',
      hire_date: defaultValues?.hire_date ?? '',
      work_rating: defaultValues?.work_rating ?? null,
      will_hire_again: defaultValues?.will_hire_again ?? '',
      website_url: defaultValues?.website_url ?? '',
      freeNotes: parsed.freeText,
      links: parsed.links,
    },
  })

  const status = form.watch('status')
  const isHired = status === 'hired'

  return (
    <form onSubmit={form.handleSubmit(v => onSubmit(v, pendingFiles))} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Company Name *</Label>
        <Input id="name" {...form.register('name')} placeholder="Acme Corp" />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label htmlFor="status">Status *</Label>
        <select id="status" {...form.register('status')} className={selectClass}>
          <option value="to_hire">To Hire</option>
          <option value="hired">Already Hired</option>
          <option value="do_not_hire">Do Not Hire</option>
        </select>
      </div>

      {/* Contact + Phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">Contact Name</Label>
          <Input id="contact_name" {...form.register('contact_name')} placeholder="Jane Smith" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telephone">Telephone</Label>
          <Input
            id="telephone"
            {...form.register('telephone')}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      {/* Purpose */}
      <div className="space-y-1.5">
        <Label htmlFor="purpose">Purpose / Service</Label>
        <Input
          id="purpose"
          {...form.register('purpose')}
          placeholder="IT Services, Plumbing, Consulting…"
        />
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...form.register('address')}
          placeholder="123 Main St, City, State"
        />
      </div>

      {/* Website */}
      <div className="space-y-1.5">
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          id="website_url"
          {...form.register('website_url')}
          placeholder="https://company.com"
          type="url"
        />
      </div>

      {/* Hired-only panel */}
      {isHired && (
        <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">Hire Details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input id="hire_date" type="date" {...form.register('hire_date')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="will_hire_again">Will Hire Again?</Label>
              <select
                id="will_hire_again"
                {...form.register('will_hire_again')}
                className={selectClass}
              >
                <option value="">Select…</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="maybe">Maybe</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Work Rating</Label>
            <StarRating
              value={form.watch('work_rating')}
              onChange={v => form.setValue('work_rating', v)}
            />
          </div>
        </div>
      )}

      {/* Photos */}
      <div className="space-y-1.5">
        <Label>Photos</Label>
        <ImageUploader
          companyId={defaultValues?.id}
          existingImages={existingImages}
          onImagesChange={setExistingImages}
          pendingFiles={pendingFiles}
          onPendingFilesChange={setPendingFiles}
        />
      </div>

      {/* Additional Links */}
      <div className="space-y-1.5">
        <Label>Additional Links</Label>
        <LinkBuilder
          value={form.watch('links')}
          onChange={links => form.setValue('links', links)}
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="freeNotes">Notes</Label>
        <Textarea
          id="freeNotes"
          {...form.register('freeNotes')}
          placeholder="Additional notes about this company…"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving…' : defaultValues ? 'Save Changes' : 'Add Company'}
      </Button>
    </form>
  )
}
