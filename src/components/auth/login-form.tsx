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
    <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Välkommen tillbaka
        </h2>
        <p className="mt-2 text-gray-600 text-sm">Logga in för att fortsätta</p>
      </div>

      {/* Error-meddelande */}
      {error && (
        <div className="p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Formulär */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/* E-postadress */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
            className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-white text-gray-900 transition-all"
            autoComplete="email"
          />
        </div>

        {/* Lösenord */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
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
            className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm bg-white text-gray-900 transition-all"
            autoComplete="current-password"
          />
        </div>

        {/* Skicka-knapp */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
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
           <div className="w-full border-t border-gray-200"></div>
         </div>
         <div className="relative flex justify-center text-sm">
           <span className="px-4 bg-white/80 text-gray-500 font-medium">Eller fortsätt med</span>
         </div>
       </div>

       {/* Google-knapp */}
       <div>
         <button
           onClick={handleGoogleLogin}
           disabled={loading}
           type="button"
           className="w-full inline-flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
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