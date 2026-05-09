'use client'
import { useState, useEffect, useCallback } from 'react'
import { getCompaniesByStatus, getAllStatusCounts } from '@/lib/api/companies'
import type { Company, CompanyStatus, StatusCounts } from '@/types'

export function useCompanies(status: CompanyStatus) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompaniesByStatus(status)
      setCompanies(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load companies')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { companies, loading, error, refetch }
}

export function useStatusCounts() {
  const [counts, setCounts] = useState<StatusCounts>({ hired: 0, to_hire: 0, do_not_hire: 0 })

  const refetch = useCallback(async () => {
    try {
      const data = await getAllStatusCounts()
      setCounts(data)
    } catch {
      // counts are non-critical, fail silently
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { counts, refetch }
}
