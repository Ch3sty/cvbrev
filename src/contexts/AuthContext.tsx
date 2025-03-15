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
        console.error('Detaljerat fel vid hämtning av användarprofil:', {
          code: error.code,
          details: error.details,
          message: error.message
        })
        return null
      }

      return data
    } catch (error) {
      console.error('Oväntat fel vid hämtning av användarprofil:', error)
      return null
    }
  }

  // Uppdatera användarprofil
  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await fetchUserProfile(user.id)
        setUserProfile(profile)
      } catch (error) {
        console.error('Fel vid uppdatering av användarprofil:', error)
        setUserProfile(null)
      }
    }
  }

  // Hantera utloggning
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Detaljerat fel vid utloggning:', {
          code: error.code,
          details: error.details,
          message: error.message
        })
      }
    } catch (error) {
      console.error('Oväntat fel under utloggning:', error)
    }
  }

  // Lyssna på autentiseringsändringar
  useEffect(() => {
    // Hämta aktuell session
    const checkSession = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Detaljerat sessionshämtningsfel:', {
            code: error.code,
            details: error.details,
            message: error.message
          })
          setSession(null)
          setUser(null)
          return
        }

        setSession(data.session)
        setUser(data.session?.user || null)

        if (data.session?.user) {
          try {
            const profile = await fetchUserProfile(data.session.user.id)
            setUserProfile(profile)
          } catch (profileError) {
            console.error('Fel vid hämtning av användarprofil:', profileError)
            setUserProfile(null)
          }
        }
      } catch (unexpectedError) {
        console.error('Oväntat fel vid sessionskontroll:', unexpectedError)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Lyssna på autentiseringsändringar
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session)
          setUser(session?.user || null)
          
          if (session?.user) {
            try {
              const profile = await fetchUserProfile(session.user.id)
              setUserProfile(profile)
            } catch (profileError) {
              console.error('Fel vid hämtning av användarprofil under autentiseringstillståndsändring:', profileError)
              setUserProfile(null)
            }
          } else {
            setUserProfile(null)
          }
        } catch (unexpectedError) {
          console.error('Oväntat fel under autentiseringstillståndsändring:', unexpectedError)
          setSession(null)
          setUser(null)
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