// src/components/auth/register-form.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { logUserActivity } from '@/lib/activity-logger'; // <-- 1. Importera loggern

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('') // Nytt valfritt fält
  const [location, setLocation] = useState('') // Nytt valfritt fält
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null);

    // Validering
    if (fullName.trim().length < 2) {
       setError("Fullständigt namn måste vara minst 2 tecken långt.");
       setLoading(false);
       return;
    }

    if (password.length < 6) {
       setError("Lösenordet måste vara minst 6 tecken långt.");
       setLoading(false);
       return;
    }

    try {
      // 2. Försök registrera användaren (UTAN att Supabase skickar emails)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone.trim() || null, // Valfritt - null om tomt
            location: location.trim() || null // Valfritt - null om tomt
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

        // 4. Skicka EGEN bekräftelse-email via Resend (inte Supabase)
        try {
          const emailResponse = await fetch('/api/auth/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.user.email,
              fullName: fullName,
              userId: data.user.id,
              isInvitation: false
            })
          })

          if (!emailResponse.ok) {
            console.error('Failed to send confirmation email:', await emailResponse.text())
            // Vi fortsätter ändå - användaren är registrerad
          } else {
            console.log('Custom confirmation email sent successfully')
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError)
          // Vi fortsätter ändå - användaren är registrerad
        }

        // 5. Omdirigera till bekräftelsesida
        // Eftersom email confirmations är disabled, kommer användaren troligen ha session direkt
        if (data.session) {
            // Användare direkt inloggad (email confirmations disabled)
            setMessage('Konto skapat! Kontrollera din e-post för att bekräfta din adress.')
            router.push(redirectTo);
            router.refresh();
        } else {
            // E-postverifiering krävs (om du har confirmations enabled)
            setMessage('Konto skapat! Kontrollera din e-post för att bekräfta din adress.')
            router.push('/auth/verify-email');
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

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Kom igång
        </h2>
        <p className="mt-2 text-gray-600 text-sm">Skapa ditt konto på några sekunder</p>
      </div>

      {/* Felmeddelande */}
      {error && (
        <div className="p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Success/Info-meddelande */}
      {message && (
         <div className="p-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
           <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
           </svg>
           <span>{message}</span>
         </div>
       )}

      {/* Formulär */}
      <form onSubmit={handleRegister} className="space-y-4">
         {/* Fullständigt namn */}
         <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
            Fullständigt namn *
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
            placeholder="Förnamn Efternamn"
            className="appearance-none block w-full min-h-[44px] px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-gray-900 transition-all"
            autoComplete="name"
          />
        </div>

        {/* E-postadress */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            E-postadress *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="din.email@example.com"
            className="appearance-none block w-full min-h-[44px] px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-gray-900 transition-all"
            autoComplete="email"
          />
        </div>

        {/* Lösenord */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Lösenord *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            className="appearance-none block w-full min-h-[44px] px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-gray-900 transition-all"
            autoComplete="new-password"
          />
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Minst 6 tecken
          </p>
        </div>

        {/* Telefonnummer (valfritt) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Telefonnummer (valfritt)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+46 70 123 45 67"
            className="appearance-none block w-full min-h-[44px] px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-gray-900 transition-all"
            autoComplete="tel"
          />
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Används endast för personliga brev & CV:n
          </p>
        </div>

        {/* Plats/Ort (valfritt) */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
            Ort (valfritt)
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Stockholm"
            className="appearance-none block w-full min-h-[44px] px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-gray-900 transition-all"
            autoComplete="address-level2"
          />
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1 a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Används endast för personliga brev & CV:n
          </p>
        </div>

        {/* Skicka-knapp */}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] touch-manipulation flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
        >
          {loading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : null}
          {loading ? 'Skapar konto...' : 'Skapa konto'}
        </button>
      </form>

      {/* Inloggningsförslag */}
      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          Har du redan ett konto?{' '}
          <Link href="/login" className="font-medium text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:from-blue-700 hover:to-purple-700 transition-all">
            Logga in här
          </Link>
        </p>
      </div>
    </div>
  )
}