/**
 * K1, milstolpekvittot (våg 3b). Visas för ett märke som nåtts; kvittot
 * markerar sig självt som visat. Ett märke som inte nåtts ger 404.
 */

import { notFound } from 'next/navigation'
import Kvitto from '@/components/traning/Kvitto'
import { arMilstolpe } from '@/lib/traning/milstolpar'
import { hamtaTraningsstatus } from '@/lib/traning/motor.server'
import { kvitto } from '@/lib/traning/resultat'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { passSida } from '../../pass/sida.server'

export default async function KvittoSida({ params }: { params: Promise<{ nyckel: string }> }) {
  const { nyckel } = await params
  if (!arMilstolpe(nyckel)) notFound()
  const { userId, supabase, betalande } = await passSida()
  const { data: profil } = await supabase.from('profiles').select('traning_sedd_at').eq('id', userId).maybeSingle()
  const status = await hamtaTraningsstatus({
    supabase,
    admin: testSkrivKlient(),
    userId,
    sedd_at: (profil as { traning_sedd_at?: string | null } | null)?.traning_sedd_at ?? null,
  })
  if (!status.milstolpar.some((m) => m.nyckel === nyckel)) notFound()
  return <Kvitto data={kvitto(nyckel, status, { betalande })} />
}
