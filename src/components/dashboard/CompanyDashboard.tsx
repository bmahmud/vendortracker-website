'use client'
import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingAddButton } from '@/components/ui/FloatingAddButton'
import { StatusTabs } from './StatusTabs'
import { CompanyGrid } from './CompanyGrid'
import { CompanyModal } from '@/components/company/CompanyModal'
import { DeleteConfirmDialog } from '@/components/company/DeleteConfirmDialog'
import { useCompanies, useStatusCounts } from '@/hooks/useCompanies'
import { useCompanyMutations } from '@/hooks/useCompanyMutations'
import type { Company, CompanyFormValues, CompanyStatus } from '@/types'

export function CompanyDashboard() {
  const [activeStatus, setActiveStatus] = useState<CompanyStatus>('hired')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)

  const { companies, loading, refetch } = useCompanies(activeStatus)
  const { counts, refetch: refetchCounts } = useStatusCounts()

  const handleSuccess = useCallback(() => {
    refetch()
    refetchCounts()
  }, [refetch, refetchCounts])

  const { create, update, remove, isSubmitting } = useCompanyMutations(handleSuccess)

  function openAdd() {
    setEditingCompany(null)
    setModalOpen(true)
  }

  function openEdit(company: Company) {
    setEditingCompany(company)
    setModalOpen(true)
  }

  async function handleSubmit(values: CompanyFormValues, pendingFiles: File[]) {
    if (editingCompany) {
      await update(editingCompany.id, values)
    } else {
      await create(values, pendingFiles)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await remove(deleteTarget.id, deleteTarget.name)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VendorTracker</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your vendor relationships in one place
          </p>
        </div>
        <Button onClick={openAdd} className="hidden gap-2 md:flex">
          <Plus size={16} />
          Add Company
        </Button>
      </div>

      {/* Status tabs */}
      <StatusTabs active={activeStatus} onChange={setActiveStatus} counts={counts} />

      {/* Cards grid */}
      <CompanyGrid
        companies={companies}
        loading={loading}
        status={activeStatus}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      {/* Add/Edit modal */}
      <CompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        company={editingCompany ?? undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        companyName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isSubmitting}
      />

      {/* Mobile floating button */}
      <FloatingAddButton onClick={openAdd} />
    </div>
  )
}
