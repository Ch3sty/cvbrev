'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })
      
      if (error) throw error
      
      router.push('/profile')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Ett fel uppstod vid registrering')
    } finally {
      setLoading(false)
    }
  }
  
  const handleGoogleRegister = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'Ett fel uppstod vid registrering')
      setLoading(false)
    }
  }
  
  return (
    <div className="w-full max-w-md p-6 space-y-6 bg-navy-900 rounded-lg">
      <h2 className="text-xl font-semibold text-white">Registrera dig</h2>
      
      {error && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm text-gray-300">
            Fullständigt namn
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 mt-1 text-white bg-navy-800 border border-gray-700 rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm text-gray-300">
            E-postadress
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 text-white bg-navy-800 border border-gray-700 rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm text-gray-300">
            Lösenord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mt-1 text-white bg-navy-800 border border-gray-700 rounded-md"
            required
          />
          <p className="mt-1 text-xs text-gray-400">
            Minst 6 tecken, använd gärna en kombination av bokstäver, siffror och specialtecken
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
        >
          {loading ? 'Registrerar...' : 'Registrera dig'}
        </button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-400 bg-navy-900">Eller fortsätt med</span>
        </div>
      </div>
      
      <button
        onClick={handleGoogleRegister}
        disabled={loading}
        className="flex items-center justify-center w-full py-2 font-medium text-white bg-navy-800 border border-gray-700 rounded-md hover:bg-navy-700"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>
    </div>
  )
}