'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'
import { useOrganization } from './useOrganization'
import { registerUser } from '@/app/(auth)/register/actions'

/**
 * Hook consolidado de autenticação do Sollar Insight Hub
 *
 * Combina useUser e useOrganization, fornecendo API única para:
 * - Estado de autenticação (user, profile, organization)
 * - Actions (login, logout, register, updateProfile)
 * - Loading states
 * - Role checks:
 *   - isSuperAdmin: apenas proprietários da plataforma (Laura/Julia)
 *   - isResponsavel: administrador da empresa cliente
 *   - isMembro: acesso limitado (visualizar relatórios)
 *   - canManage: pode gerenciar (responsavel_empresa ou super_admin)
 *   - canInvite: pode convidar usuários (apenas responsavel_empresa)
 */
export function useAuth() {
  const router = useRouter()
  const {
    user,
    profile,
    loading: userLoading,
    isAuthenticated,
    isSuperAdmin,
    isResponsavel,
    isMembro,
    canManage,
    canInvite,
    canViewReports,
    // Legacy
    isAdmin,
    isManager
  } = useUser()
  const { organization, loading: orgLoading } = useOrganization()

  const supabase = createClient()

  /**
   * Login com email e senha
   */
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error('Falha ao fazer login')

    router.push('/dashboard')
    router.refresh()

    return { user: data.user }
  }

  /**
   * Logout - encerra sessão e redireciona para login
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    router.push('/login')
    router.refresh()
  }

  /**
   * Register - cria nova conta (delega para server action)
   */
  const register = async (formData: FormData) => {
    const result = await registerUser(formData)

    if (result.error) {
      throw new Error(result.error)
    }

    router.push('/dashboard')
    router.refresh()

    return result
  }

  /**
   * Atualizar perfil do usuário
   */
  const updateProfile = async (updates: {
    full_name?: string
    avatar_url?: string
  }) => {
    if (!user) throw new Error('Usuário não autenticado')

    // Atualizar metadata do auth
    if (updates.full_name) {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
        },
      })

      if (authError) throw authError
    }

    // Atualizar perfil no banco
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await (supabase as any)
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)

    if (profileError) throw profileError

    router.refresh()
  }

  return {
    // State
    user,
    profile,
    organization,
    loading: userLoading || orgLoading,
    isAuthenticated,

    // New role system
    isSuperAdmin,
    isResponsavel,
    isMembro,
    canManage,
    canInvite,
    canViewReports,

    // Legacy compatibility (will be removed)
    isAdmin,
    isManager,

    // Actions
    login,
    logout,
    register,
    updateProfile,
  }
}
