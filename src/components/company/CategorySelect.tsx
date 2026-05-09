'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, X, Settings, Pencil, Trash2, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api/categories'
import { cn } from '@/lib/utils'
import type { Category, CompanyStatus } from '@/types'

const CREATE_NEW = '__create__'

const selectClass = cn(
  'w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

interface CategorySelectProps {
  status: CompanyStatus
  value: string | null
  onChange: (id: string | null) => void
}

export function CategorySelect({ status, value, onChange }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [creating, setCreating] = useState(false)
  const [managing, setManaging] = useState(false)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (creating) inputRef.current?.focus()
  }, [creating])

  const filtered = categories.filter(c => c.status === status)

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return
    setLoading(true)
    try {
      const cat = await createCategory(name, status)
      setCategories(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)))
      onChange(cat.id)
      setNewName('')
      setCreating(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  async function handleRename(id: string) {
    const name = editName.trim()
    if (!name) { setEditingId(null); return }
    try {
      const updated = await updateCategory(id, name)
      setCategories(prev =>
        prev.map(c => c.id === id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)),
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to rename category')
    } finally {
      setEditingId(null)
    }
  }

  async function handleDelete(cat: Category) {
    try {
      await deleteCategory(cat.id)
      setCategories(prev => prev.filter(c => c.id !== cat.id))
      if (value === cat.id) onChange(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete category')
    }
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === CREATE_NEW) {
      setCreating(true)
      setManaging(false)
      return
    }
    onChange(val === '' ? null : val)
  }

  function cancelCreate() {
    setCreating(false)
    setNewName('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select
          value={creating ? CREATE_NEW : (value ?? '')}
          onChange={handleSelectChange}
          className={cn(selectClass, 'flex-1')}
        >
          <option value="">No category</option>
          {filtered.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
          <option value={CREATE_NEW}>+ Create new category…</option>
        </select>
        {filtered.length > 0 && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn('shrink-0', managing && 'text-primary bg-primary/10')}
            onClick={() => { setManaging(m => !m); setCreating(false) }}
            title="Manage categories"
          >
            <Settings size={15} />
          </Button>
        )}
      </div>

      {creating && (
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Plumber, Electrician, IT…"
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleCreate() }
              if (e.key === 'Escape') cancelCreate()
            }}
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0"
            onClick={handleCreate}
            disabled={loading || !newName.trim()}
          >
            <Plus size={15} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={cancelCreate}
          >
            <X size={15} />
          </Button>
        </div>
      )}

      {managing && !creating && (
        <div className="rounded-lg border border-border bg-background p-2 space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-1 pb-1">Manage categories</p>
          {filtered.map(cat => (
            <div key={cat.id} className="flex items-center gap-1">
              {editingId === cat.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="h-7 text-sm flex-1"
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); handleRename(cat.id) }
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                  />
                  <Button type="button" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleRename(cat.id)}>
                    <Check size={13} />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}>
                    <X size={13} />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 truncate text-sm px-1">{cat.name}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(cat)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
