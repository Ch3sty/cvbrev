/**
 * Uppvärmningen på provdagen (konceptets 1d, våg 3b): tre frågor, ingen
 * tid, ingen nivå, inget sparas. Frågorna hämtas av klienten från
 * /api/traning/uppvarmning, som väljer och dömer på servern.
 * Sessionsramen (plan-testflode-2026-11-20, etapp 3): MatrisUppvarmning i
 * ramen.
 */

import { redirect } from 'next/navigation'
import MatrisUppvarmning from '@/components/session/matris/MatrisUppvarmning'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'

export default async function UppvarmningSida() {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  return <MatrisUppvarmning />
}
