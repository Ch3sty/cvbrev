'use client'

/**
 * Glömt lösenordet i kontokortet (publikt omgång 3, skissen inloggning).
 * Logiken är ForgotPasswordForm ordagrant (src/components/auth/
 * forgot-password-form.tsx): samma anrop till /api/auth/forgot-password,
 * samma lägen och samma texter. Bara formen är ny: ett fält och en knapp,
 * och när mejlet är skickat den gröna rutan med adressen, instruktionen,
 * tipset och knappen tillbaka. Den gamla komponenten står kvar tills
 * städningen (P5).
 */

import { useState } from 'react'
import Link from 'next/link'
import { AuthRad, MejlIkon } from '../_delar/AuthKortSkal'

export default function GlomtFormular() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Ett fel uppstod. Försök igen.')
      }
    } catch (err) {
      console.error('Error requesting password reset:', err)
      setError('Ett fel uppstod. Försök igen senare.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <h1 className="rg-h1">Återställ lösenord</h1>
        <p className="rg-under">Klart, kolla din inkorg</p>
        <div className="rg-skickat" role="status">
          <i>
            <MejlIkon />
          </i>
          <b>Mejl skickat</b>
          <span>
            Till: <strong>{email}</strong>
          </span>
        </div>
        <p className="rg-text">
          Vi har skickat instruktioner för att återställa ditt lösenord. Klicka på länken i mejlet för att välja ett nytt.
        </p>
        <div className="rg-tips">
          <b>Tips</b>
          Kolla skräppost-mappen om mejlet inte dykt upp inom några minuter.
        </div>
        <Link href="/login" className="p3-knapp p3-knapp-vit p3-knapp-bred">
          Tillbaka till inloggning
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="rg-h1">Återställ lösenord</h1>
      <p className="rg-under">Vi skickar en länk till din e-post</p>

      {error ? (
        <AuthRad ton="fel">
          <p>{error}</p>
        </AuthRad>
      ) : null}

      <form onSubmit={handleSubmit} className="rg-form">
        <div className="rg-falt">
          <label htmlFor="email">E-postadress</label>
          <input
            id="email"
            type="email"
            placeholder="namn@exempel.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading} className="p3-knapp p3-knapp-bred">
          {loading ? 'Skickar...' : 'Skicka återställningslänk'}
        </button>
      </form>

      <p className="rg-byt">
        Kom du ihåg ditt lösenord? <Link href="/login">Logga in</Link>
      </p>
    </>
  )
}
