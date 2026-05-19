'use client'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number | null
  onChange?: (val: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md'
}

export function StarRating({ value, onChange, readOnly = false, size = 'md' }: StarRatingProps) {
  const px = size === 'sm' ? 14 : 20
  return (
    <div className="flex gap-0.5" role="group" aria-label="Work rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange?.(star)}
          disabled={readOnly}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className={cn(
            'rounded-sm transition-transform focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none',
            !readOnly && 'cursor-pointer hover:scale-110',
            readOnly && 'cursor-default',
          )}
        >
          <Star
            size={px}
            className={cn(
              'transition-colors',
              value && star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-gray-300',
            )}
          />
        </button>
      ))}
    </div>
  )
}
