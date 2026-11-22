// src/app/auth/reset-password/page.tsx
//
// Välj nytt lösenord i samma kort som Logga in (publikt omgång 3,
// skissnoten inloggning punkt 2). Citaten och talen står kvar i panelen
// bredvid kortet, som förut i vänsterpanelen. Talen är avgjorda 2026-11-22
// (beslut-agarpunkter D-9): lösenordet är hashat, inte krypterat med AES-256
// (det gäller leverantörens diskkryptering). Citatets tankstreck är bytt mot
// punkt (byggbriefen, inga tankstreck i text).

import { Suspense } from 'react'
import { AuthKortSkal } from '../_delar/AuthKortSkal'
import NyttLosenFormular from './NyttLosenFormular'

const RESET_QUOTES = [
  'Nästan inne. Välj något du faktiskt kommer ihåg.',
  'Ett starkt lösenord är ett tryggt lösenord.',
  'Sista steget innan du är tillbaka i jakten.',
]

const RESET_STATS = [
  { value: 'Hashat', label: 'aldrig i klartext' },
  { value: '8+', label: 'tecken minst' },
  { value: 'HTTPS', label: 'hela vägen' },
  { value: 'Supabase', label: 'sköter inloggningen' },
]

export default function ResetPasswordPage() {
  return (
    <AuthKortSkal
      panel={
        <>
          {RESET_QUOTES.map((q) => (
            <p key={q} className="rg-citat">
              {q}
            </p>
          ))}
          <ul className="rg-tal">
            {RESET_STATS.map((s) => (
              <li key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <Suspense fallback={<p className="rg-text">Laddar...</p>}>
        <NyttLosenFormular />
      </Suspense>
    </AuthKortSkal>
  )
}
