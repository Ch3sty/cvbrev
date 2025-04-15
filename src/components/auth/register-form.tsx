// src/components/auth/register-form.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logUserActivity } from '@/lib/activity-logger'; // <-- 1. Importera loggern

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null);

    if (password.length < 6) {
       setError("Lösenordet måste vara minst 6 tecken långt.");
       setLoading(false);
       return;
    }

    try {
      // 2. Försök registrera användaren
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone
          },
          // emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signUpError) throw signUpError

      // 3. Hantera lyckad registrering (där data.user finns)
      if (data.user) {
        // === LOGGA REGISTRERINGSAKTIVITET ===
        await logUserActivity(
          data.user.id,                       // Användar-ID
          'registered',                       // Aktivitetstyp
          'User registered via email/password' // Beskrivning
          // Metadata kan läggas till här: , { method: 'email' }
        );
        console.log("Registration activity logged for user:", data.user.id); // För felsökning
        // ===================================

        // GTM Push
        if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({ 'event': 'user_registered' });
            console.log('Data Layer event pushed: user_registered');
        } else { console.warn('Data Layer not available.'); }

        // Hantera omdirigering baserat på om session skapades direkt
        if (!data.session) {
            // E-postverifiering krävs troligen
            router.push('/auth/verify-email');
        } else {
            // Användare direkt inloggad
            router.push('/dashboard');
            router.refresh();
        }
      } else {
         // Detta fall bör inte hända om signUp lyckas utan fel
         console.warn("Registrering lyckades men user data saknades för loggning/omdirigering.");
         throw new Error("Okänt fel vid registrering.");
      }

    } catch (error: any) {
        let errorMessage: React.ReactNode = error.message || 'Ett fel uppstod vid registrering';
        if (error.message.includes("User already registered")) {
             errorMessage = (
                 <>
                     En användare med denna e-postadress finns redan.{" "}
                     <Link href="/login" className="font-semibold underline hover:text-pink-400">
                         Logga in?
                     </Link>
                 </>
             );
        } else if (error.message.includes("Password should be at least 6 characters")) {
             errorMessage = "Lösenordet måste vara minst 6 tecken långt.";
        }
        setError(errorMessage);
        console.error("Registreringsfel:", error);
    } finally {
      setLoading(false)
    }
  }

  // Google Register-funktion (oförändrad - loggning sker i callback)
  const handleGoogleRegister = async () => {
    setLoading(true)
    setError(null)
    setMessage(null);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (oauthError) throw oauthError
    } catch (error: any) {
      setError(error.message || 'Ett fel uppstod vid Google-registrering');
      setLoading(false);
    }
    // Omdirigering hanteras av Supabase
  }


  return (
    // Uppdaterad container-styling (oförändrad från förra versionen)
    <div className="w-full max-w-md p-8 space-y-6 bg-navy-900 rounded-lg border border-navy-700 shadow-xl">

      {/* Felmeddelande */}
      {error && (
        <div className="p-3 text-sm text-red-100 bg-red-900/50 border border-red-500/50 rounded-md">
          {error}
        </div>
      )}

      {/* Success/Info-meddelande */}
      {message && (
         <div className="p-3 text-sm text-green-100 bg-green-900/50 border border-green-500/50 rounded-md">
           {message}
         </div>
       )}

      {/* Formulär */}
      <form onSubmit={handleRegister} className="space-y-5">
         {/* Fullständigt namn */}
         <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
            Fullständigt namn
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Förnamn Efternamn"
            className="appearance-none block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-navy-800 text-white"
            autoComplete="name"
          />
        </div>

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
            className="appearance-none block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-navy-800 text-white"
            autoComplete="email"
          />
        </div>

        {/* Telefonnummer */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
            Telefonnummer <span className="text-gray-500">(Valfritt)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+46701234567"
            className="appearance-none block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-navy-800 text-white"
            autoComplete="tel"
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
            className="appearance-none block w-full px-3 py-2 border border-navy-700 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-navy-800 text-white"
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-gray-400">
            Minst 6 tecken.
          </p>
        </div>

        {/* Skicka-knapp */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : null}
          {loading ? 'Registrerar...' : 'Skapa konto'}
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
           onClick={handleGoogleRegister}
           disabled={loading}
           type="button"
           className="w-full inline-flex justify-center py-3 px-4 border border-navy-700 rounded-md shadow-sm bg-navy-800 text-sm font-medium text-gray-300 hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         >
           <svg className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
             <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.5 109.8 11.8 244 11.8c70.4 0 130.5 28.1 173.4 74.4l-61.6 56.7C326.8 111.7 289.1 91.8 244 91.8c-77.9 0-141.2 63.5-141.2 141.8s63.3 141.8 141.2 141.8c86.3 0 124.3-61.6 128.6-94.8H244v-72.4h241.8c2.5 13.2 4.2 26.8 4.2 40.8z"></path>
           </svg>
           Google
         </button>
       </div>
    </div>
  )
}