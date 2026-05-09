import { supabase } from '@/lib/supabase/client'
import type { Company, CompanyStatus, StatusCounts } from '@/types'

export async function getCompaniesByStatus(status: CompanyStatus): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*, company_images(*)')
    .eq('status', status)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Company[]
}

export async function getAllStatusCounts(): Promise<StatusCounts> {
  const { data, error } = await supabase.from('companies').select('status')
  if (error) throw new Error(error.message)
  const counts: StatusCounts = { hired: 0, to_hire: 0, do_not_hire: 0 }
  ;(data ?? []).forEach(row => {
    const s = row.status as CompanyStatus
    if (s in counts) counts[s]++
  })
  return counts
}

export async function createCompany(payload: Partial<Company>): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .insert({ ...payload, user_id: null })
    .select('*, company_images(*)')
    .single()
  if (error) throw new Error(error.message)
  return data as Company
}

export async function updateCompany(id: string, payload: Partial<Company>): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, company_images(*)')
    .single()
  if (error) throw new Error(error.message)
  return data as Company
}

export async function deleteCompany(id: string): Promise<void> {
  const { data: images } = await supabase
    .from('company_images')
    .select('storage_path')
    .eq('company_id', id)

  if (images?.length) {
    await supabase.storage
      .from('company-images')
      .remove(images.map(i => i.storage_path))
  }

  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
