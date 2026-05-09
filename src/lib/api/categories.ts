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
