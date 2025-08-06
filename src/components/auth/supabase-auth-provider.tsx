'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseClient } from '@/lib/supabase/auth-client'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within SupabaseAuthProvider')
  }
  return context
}

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    // 초기 세션 확인
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setUser(session?.user ?? null)
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          setProfile(profileData)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }
      
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error in handleSignOut:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signOut: handleSignOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}