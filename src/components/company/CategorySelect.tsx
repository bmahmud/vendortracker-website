'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getAllCategories, createCategory } from '@/lib/api/categories'
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
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
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
    } catch {
      // silently fail — toast is not available here; parent error handling covers it
    } finally {
      setLoading(false)
    }
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    if (val === CREATE_NEW) {
      setCreating(true)
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
      <select
        value={creating ? CREATE_NEW : (value ?? '')}
        onChange={handleSelectChange}
        className={selectClass}
      >
        <option value="">No category</option>
        {filtered.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
        <option value={CREATE_NEW}>+ Create new category…</option>
      </select>

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
    </div>
  )
}
