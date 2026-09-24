// src/app/register/page.tsx
//
// Registreringen (docs/design/profil-registrering-spec-2026-09-24.md, Del B).
// Servern läser adressen och väljer läge ur landningstabellen: tratten,
// kontot med ett förval (?borja=), smakprovet (?draft=, ?cv_start=, ?test=,
// ?intervju=, ?personlighet=), paketet (?paket=) eller redirecten
// (?redirect=). Klienten ritar stegen i det publika flödesskalet.

import RegisterFlode from '@/components/registrering/RegisterFlode'
import { registerIngang } from '@/components/registrering/intent'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const ingang = registerIngang((namn) => {
    const v = params[namn]
    return typeof v === 'string' ? v : null
  })
  return <RegisterFlode ingang={ingang} />
}
