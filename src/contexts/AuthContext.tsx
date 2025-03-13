'use client'

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react'
import { supabase } from '@/supabase/client'
import { User, Session } from '@supabase/supabase-js'

// Definiera typen för autentiseringskontext
interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  userProfile: any | null
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

// Skapa autentiseringskontext
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userProfile: null,
  signOut: async () => {},
  refreshUserProfile: async () => {}
})

// AuthProvider-komponent
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any | null>(null)

  // Hämta användarprofil från Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
      return null
    }
  }

  // Uppdatera användarprofil
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id)
      setUserProfile(profile)
    }
  }

  // Hantera utloggning
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
    }
  }

  // Lyssna på autentiseringsändringar
  useEffect(() => {
    // Hämta aktuell session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setUser(data.session?.user || null)
      setLoading(false)

      // Hämta användarprofil om session finns
      if (data.session?.user) {
        const profile = await fetchUserProfile(data.session.user.id)
        setUserProfile(profile)
      }
    }

    checkSession()

    // Lyssna på autentiseringsändringar
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user || null)
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          setUserProfile(profile)
        } else {
          setUserProfile(null)
        }
      }
    )

    // Rensa prenumerationen när komponenten avmonteras
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Tillhandahåll kontextdata
  const value = {
    user,
    session,
    loading,
    userProfile,
    signOut,
    refreshUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook för att använda autentiseringskontext
export function useAuth() {
  return useContext(AuthContext)
}