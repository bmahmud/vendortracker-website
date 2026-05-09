'use client'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { LinkItem } from '@/types'

interface LinkBuilderProps {
  value: LinkItem[]
  onChange: (links: LinkItem[]) => void
}

export function LinkBuilder({ value, onChange }: LinkBuilderProps) {
  function add() {
    onChange([...value, { url: '', label: '' }])
  }

  function update(index: number, field: keyof LinkItem, val: string) {
    onChange(value.map((l, i) => (i === index ? { ...l, [field]: val } : l)))
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {value.map((link, i) => (
        <div key={i} className="flex gap-2">
          <Input
            placeholder="https://..."
            value={link.url}
            onChange={e => update(i, 'url', e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Label (optional)"
            value={link.label}
            onChange={e => update(i, 'label', e.target.value)}
            className="w-36"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
            <Trash2 size={16} className="text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1.5">
        <Plus size={14} /> Add Link
      </Button>
    </div>
  )
}
