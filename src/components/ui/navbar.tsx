'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    
    getUser()
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])
  
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }
  
  return (
    <nav className="bg-navy-950 text-white">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">cv<span className="text-pink-500">brev</span></span>
          <span className="px-1 ml-1 text-xs bg-pink-500 rounded">BETA</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="hover:text-pink-500">Hem</Link>
          <Link href="/funktioner" className="hover:text-pink-500">Funktioner</Link>
          <Link href="/priser" className="hover:text-pink-500">Priser</Link>
          
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Link href="/create-letter" className="hover:text-pink-500">Skapa brev</Link>
                  <Link href="/my-letters" className="hover:text-pink-500">Mina brev</Link>
                  <div className="relative group">
                    <button className="flex items-center hover:text-pink-500">
                      <span className="w-8 h-8 mr-2 text-center text-white bg-pink-500 rounded-full">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                      <span className="hidden lg:inline">{user.email}</span>
                    </button>
                    
                    <div className="absolute right-0 hidden p-2 bg-navy-800 rounded-md shadow-lg group-hover:block">
                      <Link href="/profile" className="block px-4 py-2 hover:bg-navy-700">
                        Min profil
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="block w-full px-4 py-2 text-left text-red-500 hover:bg-navy-700"
                      >
                        Logga ut
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-white hover:text-pink-500"
                  >
                    Logga in
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
                  >
                    Kom igång
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        
        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/"
              className="block px-3 py-2 hover:bg-navy-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Hem
            </Link>
            <Link 
              href="/funktioner"
              className="block px-3 py-2 hover:bg-navy-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Funktioner
            </Link>
            <Link 
              href="/priser"
              className="block px-3 py-2 hover:bg-navy-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Priser
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/create-letter"
                  className="block px-3 py-2 hover:bg-navy-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Skapa brev
                </Link>
                <Link 
                  href="/my-letters"
                  className="block px-3 py-2 hover:bg-navy-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mina brev
                </Link>
                <Link 
                  href="/profile"
                  className="block px-3 py-2 hover:bg-navy-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Min profil
                </Link>
                <button 
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full px-3 py-2 text-left text-red-500 hover:bg-navy-800"
                >
                  Logga ut
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="block px-3 py-2 hover:bg-navy-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Logga in
                </Link>
                <Link 
                  href="/register"
                  className="block px-3 py-2 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kom igång
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}