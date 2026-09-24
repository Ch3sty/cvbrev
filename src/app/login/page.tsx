// src/app/login/page.tsx
//
// Inloggningen i samma publika flödesskal som registreringen
// (docs/design/profil-registrering-spec-2026-09-24.md, beslut 4): den som
// växlar mellan dem möter en design, inte två. Adressen läses på servern så
// att skalet (och cookie-bannerns plats ovanför foten) finns redan i första
// HTML:en, utan layoutskifte.

import LoginFlode from '@/components/registrering/LoginFlode'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const p = await searchParams
  const s = (n: string) => (typeof p[n] === 'string' ? (p[n] as string) : null)
  return (
    <LoginFlode
      params={{ redirect: s('redirect'), borja: s('borja'), error: s('error'), confirmed: s('confirmed'), reset: s('reset') }}
    />
  )
}
