'use client'
import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ZoomIn } from 'lucide-react'
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
  const [zoomedSrc, setZoomedSrc] = useState<string | null>(null)

  // Close zoom on Escape
  useEffect(() => {
    if (!zoomedSrc) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setZoomedSrc(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomedSrc])

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
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {existingImages.map(img => {
            const src = getImagePublicUrl(img.storage_path)
            return (
              <div
                key={img.id}
                className="relative group h-28 w-28 overflow-hidden rounded-lg border bg-muted cursor-zoom-in"
                onClick={() => setZoomedSrc(src)}
              >
                <Image
                  src={src}
                  alt={img.file_name ?? 'image'}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleDeleteExisting(img) }}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            )
          })}

          {pendingPreviews.map((src, i) => (
            <div
              key={src}
              className="relative group h-28 w-28 overflow-hidden rounded-lg border bg-muted cursor-zoom-in"
              onClick={() => setZoomedSrc(src)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="preview" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); handleRemovePending(i) }}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
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

      {/* Lightbox zoom overlay */}
      {zoomedSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setZoomedSrc(null)}
          style={{ animation: 'fade-in 150ms ease forwards' }}
        >
          <button
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => setZoomedSrc(null)}
            aria-label="Close zoom"
          >
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoomedSrc}
            alt="Zoomed"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
