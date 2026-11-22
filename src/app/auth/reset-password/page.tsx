// src/app/auth/reset-password/page.tsx
//
// Välj nytt lösenord i samma kort som Logga in (publikt omgång 3,
// skissnoten inloggning punkt 2). Citaten och talen står kvar i panelen
// bredvid kortet, som förut i vänsterpanelen: talen är säkerhetslöften och
// rörs inte utan ägaren (textbeslut B-30 gäller samma slags tal). Citatets
// tankstreck är bytt mot punkt (byggbriefen, inga tankstreck i text).

import { Suspense } from 'react'
import { AuthKortSkal } from '../_delar/AuthKortSkal'
import NyttLosenFormular from './NyttLosenFormular'

const RESET_QUOTES = [
  'Nästan inne. Välj något du faktiskt kommer ihåg.',
  'Ett starkt lösenord är ett tryggt lösenord.',
  'Sista steget innan du är tillbaka i jakten.',
]

const RESET_STATS = [
  { value: 'Kryptering', label: 'AES-256' },
  { value: 'Aldrig', label: 'lagrat i klartext' },
  { value: '8+', label: 'tecken min' },
  { value: 'Säkert', label: 'via Supabase' },
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
