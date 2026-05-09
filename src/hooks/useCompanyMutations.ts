'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { createCompany, updateCompany, deleteCompany } from '@/lib/api/companies'
import { uploadCompanyImage } from '@/lib/api/images'
import { serializeLinkBlock } from '@/lib/utils'
import type { CompanyFormValues, WillHireAgain } from '@/types'

function buildPayload(values: CompanyFormValues) {
  const notes = serializeLinkBlock(values.freeNotes, values.links)
  const isHired = values.status === 'hired'
  return {
    name: values.name,
    contact_name: values.contact_name || null,
    address: values.address || null,
    telephone: values.telephone || null,
    purpose: values.purpose || null,
    status: values.status,
    hire_date: isHired && values.hire_date ? values.hire_date : null,
    work_rating: isHired && values.work_rating ? values.work_rating : null,
    will_hire_again: isHired && values.will_hire_again ? (values.will_hire_again as WillHireAgain) : null,
    website_url: values.website_url || null,
    notes: notes || null,
  }
}

export function useCompanyMutations(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function create(values: CompanyFormValues, pendingFiles: File[]) {
    setIsSubmitting(true)
    try {
      const company = await createCompany(buildPayload(values))
      for (const file of pendingFiles) {
        await uploadCompanyImage(file, company.id)
      }
      toast.success(`${values.name} added successfully`)
      onSuccess()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add company')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function update(id: string, values: CompanyFormValues) {
    setIsSubmitting(true)
    try {
      await updateCompany(id, buildPayload(values))
      toast.success(`${values.name} updated successfully`)
      onSuccess()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update company')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function remove(id: string, name: string) {
    setIsSubmitting(true)
    try {
      await deleteCompany(id)
      toast.success(`${name} deleted`)
      onSuccess()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete company')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { create, update, remove, isSubmitting }
}
