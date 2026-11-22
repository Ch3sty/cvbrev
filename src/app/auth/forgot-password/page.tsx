// src/app/auth/forgot-password/page.tsx
//
// Glömt lösenordet i samma kort som Logga in (publikt omgång 3, skissen
// inloggning). Citatet följer textbeslut AUTH-1. Talen står kvar tills
// ägaren har svarat (textbeslut B-30), fast skissen stryker dem: de står i
// panelen bredvid kortet, där citaten och talen stod förut.

import { AuthKortSkal } from '../_delar/AuthKortSkal'
import GlomtFormular from './GlomtFormular'

const FORGOT_QUOTES = [
  'Vi har alla glömt något. Det här är inte ditt jobb.',
  'Vi fixar detta. Du fokuserar på nästa intervju.',
  'En länk är allt som står mellan dig och inkorgen.',
]

const FORGOT_STATS = [
  { value: '< 1 min', label: 'tills du är inne' },
  { value: '24 h', label: 'länken giltig' },
  { value: '100%', label: 'krypterat' },
  { value: 'Säkert', label: 'via e-post' },
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
