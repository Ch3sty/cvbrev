// src/lib/rum/matchningarSedda.ts
//
// "N nya" på Matchade jobb (spec-rummen 16.2 fråga 3): träffar skapade efter
// profiles.matchningar_sedda_at. Kolumnen sätts när sidan renderats och
// efter en sökning där. Saknas kolumnen (migreringen
// 20261011140000_rummen_vag4.sql ej körd) händer ingenting.

import 'server-only'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function markeraMatchningarSedda(supabase: any, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ matchningar_sedda_at: new Date().toISOString() })
      .eq('id', userId)
    if (error && error.code !== '42703' && error.code !== 'PGRST204') {
      console.error('[matchningar] kunde inte markera som sedda', error)
    }
  } catch (error) {
    console.error('[matchningar] kunde inte markera som sedda', error)
  }
}
