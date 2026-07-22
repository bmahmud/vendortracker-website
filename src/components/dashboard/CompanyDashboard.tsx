'use client'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Sidebar } from './Sidebar'
import { VendorList } from './VendorList'
import { CompanyModal } from '@/components/company/CompanyModal'
import { DeleteConfirmDialog } from '@/components/company/DeleteConfirmDialog'
import { VendorDetailPanel } from '@/components/company/VendorDetailPanel'
import { useCompanies, useStatusCounts } from '@/hooks/useCompanies'
import { useCompanyMutations } from '@/hooks/useCompanyMutations'
import { getAllCategories, updateCategory, deleteCategory, getVendorCountForCategory } from '@/lib/api/categories'
import { cn } from '@/lib/utils'
import type { Company, CompanyFormValues, ActiveStatus, Category } from '@/types'

const statusPageTitle: Record<ActiveStatus, string> = {
  all:          'All Vendors',
  hired:        'Already Hired',
  to_hire:      'Potential Hire',
  do_not_hire:  'Do Not Hire',
}

export function CompanyDashboard() {
  const [activeStatus, setActiveStatus] = useState<ActiveStatus>('all')
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Company | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  // Category chip management
  const [renamingCatId, setRenamingCatId] = useState<string | null>(null)
  const [renameName, setRenameName] = useState('')
  const [deleteCatTarget, setDeleteCatTarget] = useState<Category | null>(null)
  const [deleteCatVendorCount, setDeleteCatVendorCount] = useState<number | null>(null)
  const [deleteCatLoading, setDeleteCatLoading] = useState(false)

  const { companies, loading, refetch } = useCompanies(activeStatus)
  const { counts, refetch: refetchCounts } = useStatusCounts()

  const fetchCategories = useCallback(() => {
    getAllCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleSuccess = useCallback(() => {
    refetch()
    refetchCounts()
    fetchCategories()
  }, [refetch, refetchCounts, fetchCategories])

  const { create, update, remove, isSubmitting } = useCompanyMutations(handleSuccess)

  function handleStatusChange(s: ActiveStatus) {
    setActiveStatus(s)
    setActiveCategoryName(null)
  }

  // --- Category chip rename ---
  async function handleCategoryRename(cat: Category) {
    const name = renameName.trim()
    setRenamingCatId(null)
    if (!name || name === cat.name) return
    try {
      await updateCategory(cat.id, name)
      if (activeCategoryName === cat.name) setActiveCategoryName(name)
      fetchCategories()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to rename category')
    }
  }

  // --- Category chip delete ---
  async function startCategoryDelete(cat: Category) {
    setDeleteCatTarget(cat)
    setDeleteCatVendorCount(null)
    try {
      const count = await getVendorCountForCategory(cat.id)
      setDeleteCatVendorCount(count)
    } catch {
      setDeleteCatVendorCount(0)
    }
  }

  async function handleCategoryDeleteConfirm() {
    if (!deleteCatTarget) return
    setDeleteCatLoading(true)
    try {
      await deleteCategory(deleteCatTarget.id, true)
      if (activeCategoryName === deleteCatTarget.name) setActiveCategoryName(null)
      toast.success(`Category "${deleteCatTarget.name}" deleted`)
      setDeleteCatTarget(null)
      setDeleteCatVendorCount(null)
      handleSuccess()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete category')
    } finally {
      setDeleteCatLoading(false)
    }
  }

  // Deduplicate category chips by name
  const visibleCategories = useMemo(() => {
    const base = activeStatus === 'all'
      ? categories
      : categories.filter(c => c.status === activeStatus)
    const seen = new Set<string>()
    return base.filter(c => {
      if (seen.has(c.name)) return false
      seen.add(c.name)
      return true
    })
  }, [categories, activeStatus])

  // Client-side filter: category name + search query
  const filtered = useMemo(() => {
    return companies.filter(c => {
      const matchesCategory = activeCategoryName === null || c.category?.name === activeCategoryName
      const q = searchQuery.toLowerCase()
      const matchesSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        (c.contact_name?.toLowerCase().includes(q) ?? false) ||
        (c.purpose?.toLowerCase().includes(q) ?? false)
      return matchesCategory && matchesSearch
    })
  }, [companies, activeCategoryName, searchQuery])

  const total = counts.hired + counts.to_hire + counts.do_not_hire

  function openAdd() { setEditingCompany(null); setModalOpen(true) }
  function openEdit(c: Company) { setEditingCompany(c); setModalOpen(true) }

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
    <div className="flex min-h-screen bg-background">
      <Sidebar active={activeStatus} onChange={handleStatusChange} counts={counts} />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Sticky top header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3 sm:px-6">
          {/* Breadcrumb — desktop */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
            {activeStatus !== 'all' || activeCategoryName !== null || searchQuery ? (
              <button
                onClick={() => { handleStatusChange('all'); setSearchQuery('') }}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                Home
              </button>
            ) : (
              <span>Home</span>
            )}
            <span>/</span>
            <span className="font-semibold text-foreground">{statusPageTitle[activeStatus]}</span>
          </nav>

          {/* Search */}
          <div className="relative flex-1 max-w-md lg:mx-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search vendors, contacts, services…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`pl-9 h-9 bg-muted/50 border-transparent focus:bg-card focus:border-input text-sm ${searchQuery ? 'pr-8' : ''}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex-1 hidden lg:block" />

          {/* New vendor button */}
          <Button
            onClick={openAdd}
            className="shrink-0 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-9 px-4 text-sm font-semibold rounded-full shadow-sm"
          >
            <Plus size={14} />
            <span>New vendor</span>
          </Button>
        </header>

        {/* Page body */}
        <main className="flex-1 px-4 pb-20 pt-6 sm:px-6 lg:pb-6">

          {/* Page title */}
          <div className="mb-5">
            <p className="text-sm text-muted-foreground mb-1">
              {filtered.length} of {total} vendors
            </p>
            <h1 className="text-4xl font-serif text-foreground leading-tight">
              My vendors
            </h1>
          </div>

          {/* Category chips */}
          {visibleCategories.length > 0 && (
            <div className="mb-5 rounded-xl border border-border bg-card px-4 py-3.5">
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setActiveCategoryName(null)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer',
                    activeCategoryName === null
                      ? 'bg-foreground text-background'
                      : 'border border-border bg-transparent hover:bg-muted text-foreground',
                  )}
                >
                  All
                </button>

                {visibleCategories.map(cat => {
                  const isActive = activeCategoryName === cat.name
                  const isRenaming = renamingCatId === cat.id

                  if (isRenaming) {
                    return (
                      <div key={cat.id} className="flex items-center gap-1">
                        <input
                          autoFocus
                          value={renameName}
                          onChange={e => setRenameName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') { e.preventDefault(); handleCategoryRename(cat) }
                            if (e.key === 'Escape') setRenamingCatId(null)
                          }}
                          className="w-32 rounded-full border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          onClick={() => handleCategoryRename(cat)}
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted cursor-pointer text-foreground"
                          aria-label="Confirm rename"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setRenamingCatId(null)}
                          className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted cursor-pointer text-muted-foreground"
                          aria-label="Cancel rename"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )
                  }

                  return (
                    <div key={cat.id} className="group flex items-center gap-0.5">
                      <button
                        onClick={() => setActiveCategoryName(isActive ? null : cat.name)}
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer',
                          isActive
                            ? 'bg-foreground text-background'
                            : 'border border-border bg-transparent hover:bg-muted text-foreground',
                        )}
                      >
                        {cat.name}
                      </button>
                      <div className="hidden group-hover:flex items-center gap-0.5 ml-0.5">
                        <button
                          onClick={() => { setRenamingCatId(cat.id); setRenameName(cat.name) }}
                          className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={`Rename ${cat.name}`}
                        >
                          <Pencil size={10} />
                        </button>
                        <button
                          onClick={() => startCategoryDelete(cat)}
                          className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-destructive/10 cursor-pointer text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={`Delete ${cat.name}`}
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Vendor list */}
          <VendorList
            companies={filtered}
            loading={loading}
            onVendorClick={setSelectedVendor}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </main>
      </div>

      {/* Vendor detail slide-over */}
      <VendorDetailPanel
        company={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onEdit={c => { setSelectedVendor(null); openEdit(c) }}
        onDelete={c => { setSelectedVendor(null); setDeleteTarget(c) }}
      />

      {/* Category delete confirmation dialog */}
      <Dialog open={!!deleteCatTarget} onOpenChange={v => !v && setDeleteCatTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              {deleteCatVendorCount === null
                ? 'Checking vendors in this category…'
                : deleteCatVendorCount > 0
                  ? <>
                      Deleting <strong>{deleteCatTarget?.name}</strong> will also permanently delete{' '}
                      <strong>{deleteCatVendorCount} vendor{deleteCatVendorCount !== 1 ? 's' : ''}</strong>{' '}
                      assigned to it. This cannot be undone.
                    </>
                  : <>
                      Are you sure you want to delete <strong>{deleteCatTarget?.name}</strong>?{' '}
                      This cannot be undone.
                    </>
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteCatTarget(null)}
              disabled={deleteCatLoading || deleteCatVendorCount === null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCategoryDeleteConfirm}
              disabled={deleteCatLoading || deleteCatVendorCount === null}
            >
              {deleteCatLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vendor modals */}
      <CompanyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        company={editingCompany ?? undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        companyName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isSubmitting}
      />
    </div>
  )
}
