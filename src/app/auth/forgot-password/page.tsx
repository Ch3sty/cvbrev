// src/app/auth/forgot-password/page.tsx
//
// Glömt lösenordet i samma kort som Logga in (publikt omgång 3, skissen
// inloggning). Citatet följer textbeslut AUTH-1. Citaten och talen står i
// panelen bredvid kortet, där de stod förut. Talen är avgjorda 2026-11-22
// (beslut-agarpunkter D-8): länkens giltighet ur Auth-konfigurationen,
// lösenordet hashat och aldrig i klartext, minst åtta tecken som formuläret
// kräver och HTTPS hela vägen. Inget "krypterat" och ingen tid till inloggning.

import { AuthKortSkal } from '../_delar/AuthKortSkal'
import GlomtFormular from './GlomtFormular'

const FORGOT_QUOTES = [
  'Vi har alla glömt något. Det här är inte ditt jobb.',
  'Vi fixar detta. Du fokuserar på nästa intervju.',
  'Länken kommer till din inkorg. Titta i skräpposten om den dröjer.',
]

const FORGOT_STATS = [
  { value: '24 h', label: 'gäller länken' },
  { value: 'Hashat', label: 'aldrig i klartext' },
  { value: '8+', label: 'tecken i nya lösenordet' },
  { value: 'HTTPS', label: 'hela vägen' },
]

export default function ForgotPasswordPage() {
  return (
    <AuthKortSkal
      panel={
        <>
          {FORGOT_QUOTES.map((q) => (
            <p key={q} className="rg-citat">
              {q}
            </p>
          ))}
          <ul className="rg-tal">
            {FORGOT_STATS.map((s) => (
              <li key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </>
      }
    >
      <GlomtFormular />
    </AuthKortSkal>
  )
}
