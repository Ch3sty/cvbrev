// src/components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      router.push('/profile')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Ett fel uppstod vid inloggning')
    } finally {
      setLoading(false)
    }
  }
  
  const handleGoogleLogin = async () => {
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
      setError(error.message || 'Ett fel uppstod vid inloggning')
      setLoading(false)
    }
  }
  
  return (
    <div className="w-full max-w-md p-6 space-y-6 bg-navy-900 rounded-lg">
      <h2 className="text-xl font-semibold text-white">Logga in</h2>
      
      {error && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
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
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
        >
          {loading ? 'Loggar in...' : 'Logga in'}
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
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex items-center justify-center w-full py-2 font-medium text-white bg-navy-800 border border-gray-700 rounded-md hover:bg-navy-700"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          {/* Google icon SVG here */}
        </svg>
        Google
      </button>
    </div>
  )
}