export type CompanyStatus = 'hired' | 'to_hire' | 'do_not_hire'
export type WillHireAgain = 'yes' | 'no' | 'maybe'

export interface CompanyImage {
  id: string
  company_id: string
  storage_path: string
  file_name: string | null
  uploaded_at: string
}

export interface Company {
  id: string
  user_id: string | null
  name: string
  contact_name: string | null
  address: string | null
  telephone: string | null
  purpose: string | null
  status: CompanyStatus
  hire_date: string | null
  work_rating: number | null
  will_hire_again: WillHireAgain | null
  website_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  company_images: CompanyImage[]
}

export interface LinkItem {
  url: string
  label: string
}

export interface CompanyFormValues {
  name: string
  contact_name: string
  address: string
  telephone: string
  purpose: string
  status: CompanyStatus
  hire_date: string
  work_rating: number | null
  will_hire_again: WillHireAgain | ''
  website_url: string
  freeNotes: string
  links: LinkItem[]
}

export interface StatusCounts {
  hired: number
  to_hire: number
  do_not_hire: number
}
