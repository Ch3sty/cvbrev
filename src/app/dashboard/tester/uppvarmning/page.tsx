/**
 * Uppvärmningen på provdagen (konceptets 1d, våg 3b): tre frågor, ingen
 * tid, ingen nivå, inget sparas. Frågorna hämtas av klienten från
 * /api/traning/uppvarmning, som väljer och dömer på servern.
 */

import { redirect } from 'next/navigation'
import Uppvarmning from '@/components/traning/Uppvarmning'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'

export default async function UppvarmningSida() {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  return <Uppvarmning />
}
