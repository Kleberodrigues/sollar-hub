'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Organization } from '@/types'
import { useUser } from './useUser'

export function useOrganization() {
  const { profile } = useUser()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!profile?.organization_id) {
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single()

        setOrganization(data)
      } catch (error) {
        console.error('Error fetching organization:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganization()
  }, [profile?.organization_id])

  return {
    organization,
    loading,
  }
}
