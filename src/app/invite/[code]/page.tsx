'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import GuestWelcomeLanding from '@/components/rewards/GuestWelcomeLanding'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, CheckCircle, Gift, Clock } from 'lucide-react'
import Link from 'next/link'

interface InvitationData {
  inviterName: string
  premiumDays: number
  expiresAt: string
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [invitationValid, setInvitationValid] = useState(false)
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [linkExpiredError, setLinkExpiredError] = useState(false)
  const supabase = getSupabaseClient()

  const invitationCode = params.code as string

  useEffect(() => {
    checkUserAndValidateInvitation()

    // Check URL parameters for errors and confirmations
    const urlParams = new URLSearchParams(window.location.search)

    // Check if user just confirmed their email
    if (urlParams.get('confirmed') === 'true') {
      setError(null)
      setShowEmailConfirmation(false)
      setLinkExpiredError(false)
    }

    // Check for expired link errors
    if (urlParams.get('error') === 'access_denied' &&
        (urlParams.get('error_code') === 'otp_expired' ||
         urlParams.get('error_description')?.includes('expired'))) {
      setLinkExpiredError(true)
      setError('Din bekräftelselänk har utgått. Klicka nedan för att skicka ett nytt bekräftelsemail.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationCode])

  const checkUserAndValidateInvitation = async () => {
    try {
      // Check if user is logged in
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      // Validate invitation
      setValidating(true)
      const response = await fetch(`/api/guest/accept?code=${invitationCode}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()

      if (result.valid) {
        setInvitationValid(true)
        setInvitationData(result.data)
      } else {
        setError(result.message || 'Ogiltig inbjudan')
      }
    } catch (err) {
      console.error('Error validating invitation:', err)
      setError('Kunde inte validera inbjudan')
    } finally {
      setLoading(false)
      setValidating(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!user) {
      // Redirect to register page with invitation code
      router.push(`/register?invite=${invitationCode}`)
      return
    }

    setAccepting(true)
    setError(null)

    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession()

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add authorization header if we have a session
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/guest/accept', {
        method: 'POST',
        headers,
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({ invitationCode })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        // Handle various error cases
        if (response.status === 401) {
          setError('Autentisering misslyckades. Försök logga in igen.')
        } else if (result.isPremium) {
          // User already has premium
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setError(result.error || 'Kunde inte acceptera inbjudan')
        }
      }
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError('Ett fel uppstod när inbjudan skulle accepteras')
    } finally {
      setAccepting(false)
    }
  }

  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Validerar din inbjudan...</h3>
            <p className="text-gray-600">Detta tar bara en sekund</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitationValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ogiltig inbjudan</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              variant="default"
              onClick={() => router.push('/')}
              className="w-full"
            >
              Gå till startsidan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="max-w-md w-full border-2 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Välkommen till Premium!</h3>
            <p className="text-gray-600 mb-6">
              Du har nu {invitationData?.premiumDays} dagars gratis Premium.
              Du omdirigeras till dashboard...
            </p>
            <div className="animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitationValid || !invitationData) {
    return null
  }

  // If user is not logged in, show the welcome landing
  if (!user) {
    return (
      <GuestWelcomeLanding
        invitation={{
          invitation_code: invitationCode,
          trial_duration_days: invitationData.premiumDays,
          expires_at: invitationData.expiresAt,
          inviter: {
            full_name: invitationData.inviterName,
            email: '',
            current_level: 1,
            level_title: 'Novis',
            profile_photo_url: undefined
          },
          features_included: [
            'Obegränsade AI-genererade personliga brev',
            'Professionella CV-mallar och analyser',
            'Personlig karriärvägledning med AI',
            '1.5x snabbare XP-intjäning',
            'Tillgång till alla premium-funktioner'
          ]
        }}
        onAcceptInvitation={async (email, fullName, password) => {
          // Create account and accept invitation directly
          setError(null)

          try {
            // 1. First try to sign in - user might already exist
            const { data: signInAttempt, error: signInAttemptError } = await supabase.auth.signInWithPassword({
              email,
              password
            })

            let user = signInAttempt?.user
            let session = signInAttempt?.session

            // If sign in failed, try to create new account
            if (signInAttemptError) {
              // Check if it's an email confirmation error
              if (signInAttemptError.message?.includes('email_not_confirmed') ||
                  signInAttemptError.message?.includes('Email not confirmed')) {
                setError('Din e-postadress behöver bekräftas. Kolla din inkorg för bekräftelsemailet eller kontakta support@jobbcoach.ai för hjälp.')
                return
              }

              console.log('User does not exist or wrong password, trying to create account...')

              // Create user without triggering Supabase automatic emails
              const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: {
                    full_name: fullName
                  },
                  // emailRedirectTo: `${window.location.origin}/invite/${invitationCode}`,
                  shouldCreateUser: true
                }
              })

              if (signUpError) {
                // Check for rate limiting
                if (signUpError.message?.includes('over_email_send_rate_limit') ||
                    signUpError.message?.includes('rate limit')) {
                  setError('För många registreringsförsök. Vänta några minuter och försök igen, eller kontakta support@jobbcoach.ai för hjälp.')
                  return
                }
                // Check if user already exists
                if (signUpError.message?.includes('already registered') ||
                    signUpError.message?.includes('already exists')) {
                  setError('Den här e-postadressen är redan registrerad. Vänligen logga in med ditt befintliga lösenord eller använd "Glömt lösenord" för att återställa det.')
                } else {
                  setError(`Kunde inte skapa konto: ${signUpError.message}`)
                }
                return
              }

              if (!authData.user) {
                // Check if user already exists (Supabase returns null user for existing emails)
                setError('Ett bekräftelsemail har skickats till din e-postadress. Vänligen bekräfta din e-post och återkom sedan till denna sida för att acceptera inbjudan.')
                return
              }

              // Check if email confirmation is required
              if (authData.user && !authData.session) {
                // Send confirmation email via Resend instead of Supabase
                try {
                  const confirmResponse = await fetch('/api/auth/send-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email,
                      fullName,
                      userId: authData.user.id,
                      isInvitation: true,
                      inviterName: invitationData.inviterName,
                      invitationCode
                    })
                  })

                  if (!confirmResponse.ok) {
                    const errorData = await confirmResponse.json()
                    console.error('Failed to send confirmation email:', errorData)
                    setError('Kunde inte skicka bekräftelsemail. Kontakta support@jobbcoach.ai för hjälp.')
                    return
                  }

                  setShowEmailConfirmation(true)
                  setConfirmationEmail(email)
                } catch (err) {
                  console.error('Error sending confirmation email:', err)
                  setError('Ett fel uppstod vid utskick av bekräftelsemail.')
                }
                return
              }

              user = authData.user

              // 2. Sign in the newly created user
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
              })

              if (signInError) {
                setError(`Kunde inte logga in: ${signInError.message}`)
                return
              }

              session = signInData.session
            }

            if (!session) {
              setError('Ingen session skapades vid inloggning')
              return
            }

            // 3. Wait for session to propagate and verify authentication
            let retries = 0
            const maxRetries = 5
            let isAuthenticated = false

            while (retries < maxRetries && !isAuthenticated) {
              await new Promise(resolve => setTimeout(resolve, 1000 + (retries * 500))) // Progressive delay

              // Verify session is available
              const { data: { user: currentUser } } = await supabase.auth.getUser()
              if (currentUser) {
                isAuthenticated = true
                console.log('Session verified, user authenticated:', currentUser.email)
              } else {
                retries++
                console.log(`Session not ready, retry ${retries}/${maxRetries}`)
              }
            }

            if (!isAuthenticated) {
              setError('Autentisering tog för lång tid. Försök igen.')
              return
            }

            // 4. Accept the invitation with proper credentials
            const response = await fetch('/api/guest/accept', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
              },
              credentials: 'include', // Ensure cookies are sent
              body: JSON.stringify({ invitationCode })
            })

            const result = await response.json()

            if (response.ok && result.success) {
              // Success! Redirect to dashboard
              router.push('/dashboard')
            } else {
              // Handle various error cases
              if (response.status === 401) {
                setError('Autentisering misslyckades. Försök logga in manuellt.')
              } else if (result.isPremium) {
                // User already has premium, redirect anyway
                setTimeout(() => {
                  router.push('/dashboard')
                }, 2000)
              } else {
                setError(result.error || 'Kunde inte acceptera inbjudan')
              }
            }
          } catch (err) {
            console.error('Error during signup:', err)
            setError('Ett oväntat fel uppstod')
          }
        }}
        onDeclineInvitation={() => router.push('/')}
        isAccepting={false}
        error={error || undefined}
        showEmailConfirmation={showEmailConfirmation}
        confirmationEmail={confirmationEmail}
        linkExpiredError={linkExpiredError}
        onResendEmail={async (email: string) => {
          try {
            // Get user from database to get their ID
            const { data: users } = await supabase
              .from('profiles')
              .select('id, full_name')
              .eq('email', email)
              .single()

            if (users) {
              // Send new confirmation email
              const response = await fetch('/api/auth/send-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email,
                  fullName: users.full_name || 'Användare',
                  userId: users.id,
                  isInvitation: true,
                  inviterName: invitationData?.inviterName,
                  invitationCode
                })
              })

              if (response.ok) {
                setError('Ett nytt bekräftelsemail har skickats. Kolla din inkorg!')
                setLinkExpiredError(false)
                setShowEmailConfirmation(true)
              } else {
                setError('Kunde inte skicka nytt bekräftelsemail. Kontakta support.')
              }
            }
          } catch (err) {
            console.error('Error resending email:', err)
            setError('Ett fel uppstod. Försök igen eller kontakta support.')
          }
        }}
      />
    )
  }

  // User is logged in, show accept invitation card
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4">
      <Card className="max-w-lg w-full shadow-xl border-0">
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 p-1 rounded-t-lg">
          <div className="bg-white rounded-t-lg">
            <CardHeader className="text-center pb-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full w-fit mx-auto mb-4">
                <Gift className="w-12 h-12 text-purple-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Du har blivit inbjuden!</CardTitle>
              <p className="text-gray-600">
                <span className="font-semibold text-purple-600">{invitationData.inviterName}</span> har bjudit in dig
                att prova Jobbcoach.ai Premium
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Premium Benefits */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Din gåva</h3>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    {invitationData.premiumDays} dagar gratis
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Obegränsade AI-personliga brev</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Alla premium CV-mallar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>1.5x snabbare XP-intjäning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Prioriterad support</span>
                  </div>
                </div>
              </div>

              {/* Expiry Notice */}
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-sm">
                <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <span className="text-gray-700">
                  Inbjudan giltig till: {new Date(invitationData.expiresAt).toLocaleDateString('sv-SE')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleAcceptInvitation}
                  disabled={accepting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  size="lg"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Aktiverar Premium...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Acceptera inbjudan
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Gå till dashboard
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              {/* Footer Note */}
              <p className="text-xs text-gray-500 text-center pt-2">
                Ingen betalningsinformation krävs. Premium aktiveras direkt när du accepterar.
              </p>
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  )
}