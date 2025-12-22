'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)

        if (authUser) {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          setProfile(userProfile)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUser()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Type assertion for is_super_admin since it may not be in generated types yet
  const isSuperAdmin = !!(profile as UserProfile & { is_super_admin?: boolean })?.is_super_admin

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    // New role system
    isSuperAdmin,
    isResponsavel: profile?.role === 'responsavel_empresa',
    isMembro: profile?.role === 'membro',
    // Permission helpers
    canManage: profile?.role === 'responsavel_empresa' || isSuperAdmin,
    canInvite: profile?.role === 'responsavel_empresa' || isSuperAdmin,
    canViewReports: profile?.role === 'responsavel_empresa' || profile?.role === 'membro' || isSuperAdmin,
    // Legacy compatibility (will be removed)
    isAdmin: isSuperAdmin,
    isManager: profile?.role === 'responsavel_empresa' || isSuperAdmin,
  }
}
