'use client'
import { useState } from 'react'
import { Loader2, PackageSearch, Pencil, Trash2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { CompanyCard } from '@/components/company/CompanyCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateCategory, deleteCategory } from '@/lib/api/categories'
import type { Company, CompanyStatus } from '@/types'

const emptyMessages: Record<CompanyStatus, string> = {
  hired: 'No companies hired yet. Add your first one!',
  to_hire: 'Your "Potential Hire" list is empty. Add some prospects.',
  do_not_hire: 'No companies on your do-not-hire list.',
}

const headerColors: Record<CompanyStatus, string> = {
  hired: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  to_hire: 'bg-blue-50 border-blue-200 text-blue-800',
  do_not_hire: 'bg-rose-50 border-rose-200 text-rose-800',
}

const badgeColors: Record<CompanyStatus, string> = {
  hired: 'bg-emerald-100 text-emerald-700',
  to_hire: 'bg-blue-100 text-blue-700',
  do_not_hire: 'bg-rose-100 text-rose-700',
}

interface CategoryHeaderProps {
  categoryKey: string
  name: string
  count: number
  status: CompanyStatus
  onRefresh: () => void
}

function CategoryHeader({ categoryKey, name, count, status, onRefresh }: CategoryHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [saving, setSaving] = useState(false)

  const isReal = categoryKey !== '__none__'

  async function handleRename() {
    const trimmed = editName.trim()
    if (!trimmed || trimmed === name) { setEditing(false); return }
    setSaving(true)
    try {
      await updateCategory(categoryKey, trimmed)
      toast.success(`Category renamed to "${trimmed}"`)
      onRefresh()
      setEditing(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to rename category')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (count > 0) {
      toast.error(`Remove all ${count} ${count === 1 ? 'company' : 'companies'} from "${name}" before deleting it`)
      return
    }
    try {
      await deleteCategory(categoryKey)
      toast.success(`Category "${name}" deleted`)
      onRefresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete category')
    }
  }

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${headerColors[status]}`}>
      {editing ? (
        <>
          <Input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="h-7 flex-1 text-sm bg-white/80"
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleRename() }
              if (e.key === 'Escape') { setEditing(false); setEditName(name) }
            }}
            autoFocus
            disabled={saving}
          />
          <Button type="button" size="icon" className="h-7 w-7 shrink-0" onClick={handleRename} disabled={saving}>
            <Check size={13} />
          </Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => { setEditing(false); setEditName(name) }}>
            <X size={13} />
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm font-semibold">{name}</span>
          <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${badgeColors[status]}`}>
            {count}
          </span>
          {isReal && (
            <>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="ml-auto h-6 w-6 shrink-0 opacity-60 hover:opacity-100"
                onClick={() => { setEditing(true); setEditName(name) }}
                title="Rename category"
              >
                <Pencil size={12} />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0 opacity-60 hover:opacity-100 hover:text-destructive"
                onClick={handleDelete}
                title="Delete category"
              >
                <Trash2 size={12} />
              </Button>
            </>
          )}
        </>
      )}
    </div>
  )
}

interface CompanyGridProps {
  companies: Company[]
  loading: boolean
  status: CompanyStatus
  onEdit: (company: Company) => void
  onDelete: (company: Company) => void
  onRefresh: () => void
}

export function CompanyGrid({ companies, loading, status, onEdit, onDelete, onRefresh }: CompanyGridProps) {
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
        <p className="text-sm">{emptyMessages[status]}</p>
      </div>
    )
  }

  const hasAnyCategory = companies.some(c => c.category_id !== null)

  if (!hasAnyCategory) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map(company => (
          <CompanyCard key={company.id} company={company} onEdit={() => onEdit(company)} onDelete={() => onDelete(company)} />
        ))}
      </div>
    )
  }

  const groupMap = new Map<string, { name: string; companies: Company[] }>()

  for (const company of companies) {
    const key = company.category_id ?? '__none__'
    const name = company.category?.name ?? 'Uncategorized'
    if (!groupMap.has(key)) groupMap.set(key, { name, companies: [] })
    groupMap.get(key)!.companies.push(company)
  }

  const groups = [...groupMap.entries()].sort(([a, ga], [b, gb]) => {
    if (a === '__none__') return 1
    if (b === '__none__') return -1
    return ga.name.localeCompare(gb.name)
  })

  return (
    <div className="space-y-6">
      {groups.map(([key, group]) => (
        <div key={key} className="space-y-3">
          <CategoryHeader
            categoryKey={key}
            name={group.name}
            count={group.companies.length}
            status={status}
            onRefresh={onRefresh}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.companies.map(company => (
              <CompanyCard key={company.id} company={company} onEdit={() => onEdit(company)} onDelete={() => onDelete(company)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
