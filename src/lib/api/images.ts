import { supabase } from '@/lib/supabase/client'
import type { CompanyImage } from '@/types'

export async function uploadCompanyImage(file: File, companyId: string): Promise<CompanyImage> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${companyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('company-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw new Error(uploadError.message)

  const { data, error: dbError } = await supabase
    .from('company_images')
    .insert({ company_id: companyId, storage_path: path, file_name: file.name })
    .select()
    .single()
  if (dbError) throw new Error(dbError.message)
  return data as CompanyImage
}

export function getImagePublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from('company-images').getPublicUrl(storagePath)
  return data.publicUrl
}

export async function deleteCompanyImage(imageId: string, storagePath: string): Promise<void> {
  await supabase.storage.from('company-images').remove([storagePath])
  const { error } = await supabase.from('company_images').delete().eq('id', imageId)
  if (error) throw new Error(error.message)
}
