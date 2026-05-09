'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImagePublicUrl, uploadCompanyImage, deleteCompanyImage } from '@/lib/api/images'
import type { CompanyImage } from '@/types'
import { toast } from 'sonner'

interface ImageUploaderProps {
  companyId?: string
  existingImages: CompanyImage[]
  onImagesChange?: (images: CompanyImage[]) => void
  pendingFiles: File[]
  onPendingFilesChange: (files: File[]) => void
}

export function ImageUploader({
  companyId,
  existingImages,
  onImagesChange,
  pendingFiles,
  onPendingFilesChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''

    if (companyId) {
      setUploading(true)
      try {
        const newImages: CompanyImage[] = []
        for (const file of files) {
          const img = await uploadCompanyImage(file, companyId)
          newImages.push(img)
        }
        onImagesChange?.([...existingImages, ...newImages])
        toast.success('Image uploaded')
      } catch {
        toast.error('Upload failed')
      } finally {
        setUploading(false)
      }
    } else {
      const previews = files.map(f => URL.createObjectURL(f))
      setPendingPreviews(prev => [...prev, ...previews])
      onPendingFilesChange([...pendingFiles, ...files])
    }
  }

  async function handleDeleteExisting(image: CompanyImage) {
    try {
      await deleteCompanyImage(image.id, image.storage_path)
      onImagesChange?.(existingImages.filter(i => i.id !== image.id))
      toast.success('Image removed')
    } catch {
      toast.error('Failed to remove image')
    }
  }

  function handleRemovePending(index: number) {
    URL.revokeObjectURL(pendingPreviews[index])
    setPendingPreviews(prev => prev.filter((_, i) => i !== index))
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {existingImages.map(img => (
          <div
            key={img.id}
            className="relative group h-20 w-20 overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={getImagePublicUrl(img.storage_path)}
              alt={img.file_name ?? 'image'}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => handleDeleteExisting(img)}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}
        {pendingPreviews.map((src, i) => (
          <div
            key={src}
            className="relative group h-20 w-20 overflow-hidden rounded-lg border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemovePending(i)}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? 'Uploading…' : 'Add Photo'}
        </Button>
      </div>
    </div>
  )
}
