// src/components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { logUserActivity } from '@/lib/activity-logger'; // <-- 1. Importera loggern

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
      // 2. Ändra för att fånga 'data' också
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        // Förbättrad felhantering för inloggning
        if (signInError.message.includes("Invalid login credentials")) {
           throw new Error("Felaktig e-postadress eller lösenord.");
        }
        // Lägg till fler specifika fel här om Supabase returnerar andra
        throw signInError; // Kasta vidare andra fel
      }

      // 3. Logga aktivitet vid lyckad inloggning
      if (signInData?.user) { // Kontrollera att vi har användar-ID
        await logUserActivity(
          signInData.user.id,                 // Användar-ID
          'login',                            // Aktivitetstyp
          'User logged in via email/password' // Beskrivning
          // Metadata kan läggas till här om så önskas: , { method: 'email' }
        );
        console.log("Login activity logged for user:", signInData.user.id); // För felsökning
      } else {
        console.warn("Login successful but user data not immediately available for logging.");
      }

      // 4. Omdirigera till dashboard istället för profile
      router.push('/dashboard')
      router.refresh() // Uppdatera serverkomponenter om nödvändigt
    } catch (error: any) {
      setError(error.message || 'Ett fel uppstod vid inloggning');
      console.error("Inloggningsfel:", error); // Logga felet
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
          redirectTo: `${window.location.origin}/auth/callback` // Viktigt att denna matchar din Supabase-inställning
        }
      })

      if (error) throw error
      // Omdirigering hanteras av Supabase, loggning sker i callback
    } catch (error: any) {
      setError(error.message || 'Ett fel uppstod vid Google-inloggning');
      setLoading(false); // Sätt bara laddning till false om fel uppstår, annars sker omdirigering
      console.error("Google inloggningsfel:", error);
    }
    // Ingen setLoading(false) här normalt, då sidan omdirigeras
  }

  return (
    // Uppdaterad container-styling (oförändrad från förra versionen)
    <div className="w-full max-w-md p-8 space-y-6 bg-navy-900 rounded-lg border border-navy-700 shadow-xl">
      <h2 className="text-2xl font-bold text-center text-white">Logga in</h2>

      {/* Error-meddelande */}
      {error && (
        <div className="p-3 text-sm text-red-100 bg-red-900/50 border border-red-500/50 rounded-md">
          {error}
        </div>
      )}

      {/* Formulär */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/* E-postadress */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            E-postadress
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="din.email@example.com"
            // Uppdaterad styling
            className="appearance-none block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-navy-800 text-white"
            autoComplete="email"
          />
        </div>

        {/* Lösenord */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Lösenord
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            // Uppdaterad styling
            className="appearance-none block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-navy-800 text-white"
            autoComplete="current-password" // Korrekt autocomplete för login
          />
        </div>

        {/* Skicka-knapp */}
        <button
          type="submit"
          disabled={loading}
          // Uppdaterad styling
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : null}
          {loading ? 'Loggar in...' : 'Logga in'}
        </button>
      </form>

      {/* Delare */}
       <div className="relative my-6">
         <div className="absolute inset-0 flex items-center" aria-hidden="true">
           <div className="w-full border-t border-navy-700"></div>
         </div>
         <div className="relative flex justify-center text-sm">
           <span className="px-3 bg-navy-900 text-gray-400">Eller fortsätt med</span>
         </div>
       </div>

       {/* Google-knapp */}
       <div>
         <button
           onClick={handleGoogleLogin}
           disabled={loading}
           type="button"
           // Uppdaterad styling
           className="w-full inline-flex justify-center py-3 px-4 border border-navy-700 rounded-md shadow-sm bg-navy-800 text-sm font-medium text-gray-300 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         >
           {/* Google Icon SVG */}
           <svg className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
             <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 11.8 244 11.8c70.4 0 130.5 28.1 173.4 74.4l-61.6 56.7C326.8 111.7 289.1 91.8 244 91.8c-77.9 0-141.2 63.5-141.2 141.8s63.3 141.8 141.2 141.8c86.3 0 124.3-61.6 128.6-94.8H244v-72.4h241.8c2.5 13.2 4.2 26.8 4.2 40.8z"></path>
           </svg>
           Google
         </button>
       </div>
    </div>
  )
}