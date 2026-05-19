'use client'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FloatingAddButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      aria-label="Add company"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex sm:hidden"
    >
      <Plus size={24} />
    </Button>
  )
}
