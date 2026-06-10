import { supabase } from '@/lib/supabase/client'
import type { Category, CompanyStatus } from '@/types'

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as Category[]
}

export async function createCategory(name: string, status: CompanyStatus): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, status })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Category
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Category
}

export async function getVendorCountForCategory(id: string): Promise<number> {
  const { count, error } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export async function deleteCategory(id: string, force = false): Promise<void> {
  if (force) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .eq('category_id', id)

    if (companies?.length) {
      const ids = companies.map(c => c.id)
      const { data: images } = await supabase
        .from('company_images')
        .select('storage_path')
        .in('company_id', ids)
      if (images?.length) {
        await supabase.storage
          .from('company-images')
          .remove(images.map(i => i.storage_path))
      }
      const { error: delErr } = await supabase.from('companies').delete().in('id', ids)
      if (delErr) throw new Error(delErr.message)
    }
  } else {
    const { count, error: countError } = await supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)
    if (countError) throw new Error(countError.message)
    if ((count ?? 0) > 0) {
      throw new Error(`Cannot delete: ${count} ${count === 1 ? 'company is' : 'companies are'} still using this category`)
    }
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
