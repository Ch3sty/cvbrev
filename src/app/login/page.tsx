// src/app/login/page.tsx
'use client'

import Link from 'next/link'
import LoginForm from '@/components/auth/login-form' // <-- IMPORTERA DEN KORREKTA KOMPONENTEN

export default function LoginPage() {
  // All state (email, password, loading, error) och alla funktioner (handleLogin, handleGoogleLogin)
  // har flyttats till LoginForm-komponenten och tas bort härifrån.

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Behåll den yttre strukturen för centrering och max bredd */}
      <div className="w-full max-w-md space-y-8"> {/* Lite space-y för avstånd */}

        {/* Sidans titel och undertitel (behålls här) */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Logga in</h2>
          <p className="mt-2 text-gray-400">
            Välkommen tillbaka! Logga in för att fortsätta.
          </p>
        </div>

        {/* Rendera den importerade och uppdaterade LoginForm-komponenten */}
        <LoginForm />

        {/* Länk för att registrera (behålls här) */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Har du inget konto?{' '}
            <Link href="/register" className="font-medium text-pink-500 hover:text-pink-400"> {/* Gjorde den lite mer framträdande */}
              Registrera dig
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}