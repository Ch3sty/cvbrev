// src/app/register/page.tsx
//
// Registreringen (docs/design/profil-registrering-spec-2026-09-24.md, Del B).
// Servern läser adressen och väljer läge ur landningstabellen: tratten,
// kontot med ett förval (?borja=), smakprovet (?draft=, ?cv_start=, ?test=,
// ?intervju=, ?personlighet=), paketet (?paket=) eller redirecten
// (?redirect=). Klienten ritar stegen i det publika flödesskalet.
//
// Efter provet (?test=) läser servern besökarens resultat, bara antal rätt,
// totalt och vilka positioner som blev fel (prov-resultat.server.ts), så att
// panelen i kontosteget står i första bilden (skissen 2026-11-09). Sidan
// står i .pub-sida, så att publikt v2:s tokens och mörkt läge gäller.

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import RegisterFlode from '@/components/registrering/RegisterFlode'
import { inloggadFranRegister, registerIngang } from '@/components/registrering/intent'
import { TRACK_CHOICE_PATH, VALKOMMEN_PATH } from '@/lib/onboarding/steps'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import PubliktSida from '@/components/publikt/PubliktSida'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getClientIp } from '@/lib/rate-limit/ip'
import { hamtaProvResultat } from '@/lib/tests/prov-resultat.server'
import TestBredd from '@/components/publikt/TestBredd'
import { TEST_TYP_NAMN, testTypForKind } from '@/components/illustrations/TestGlyfer'

/**
 * Nio-raderna i panelerna (S1 och S3, beslut 2026-11-15), ritade här på
 * servern och skickade som färdiga element, så att testelementet inte lägger
 * någon JavaScript i registreringens klientkod. Efter provet markeras
 * provets typ (I-provet: dess tre typer); på bar /register ingen.
 */
function nioRader(provTyp: string | null) {
  const typ = testTypForKind(provTyp ?? 'matris')
  const iprov = provTyp === 'iprov'
  return {
    prov: (
      <TestBredd
        form="rad"
        yta="vagg"
        markerad={iprov ? undefined : typ}
        markerade={iprov ? ['ordforrad', 'spatial', 'talserier'] : undefined}
        label={`Grundnivån i alla åtta testtyperna${typ && !iprov ? `, ${TEST_TYP_NAMN[typ]} markerad` : ''}`}
      />
    ),
    gratis: <TestBredd form="rad" yta="vagg" label="Nio testtyper" />,
  }
}

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

  // Redan inloggad (inte appens anonyma konto): inget formulär, utan dit
  // registreringen skulle leda (H3, 2026-11-14). Proxyn har redan läst
  // sessionen, så det här kostar ingen extra rundtur.
  const inloggad = await hamtaVerifieradAnvandare().catch(() => null)
  if (inloggad && !inloggad.is_anonymous) {
    redirect(inloggadFranRegister(ingang, { valkommenPath: VALKOMMEN_PATH, sparvalPath: TRACK_CHOICE_PATH }))
  }

  let provResultat = null
  if (ingang.smakprov?.typ === 'test') {
    const h = await headers()
    const ip = getClientIp({ headers: h })
    const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
    provResultat = await hamtaProvResultat(admin, ingang.smakprov.token, ip)
  }

  return (
    <PubliktSida>
      <RegisterFlode ingang={ingang} provResultat={provResultat} nio={nioRader(provResultat?.typ ?? null)} />
    </PubliktSida>
  )
}
