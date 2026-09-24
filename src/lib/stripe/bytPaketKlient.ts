/**
 * Klientens anrop till create-upgrade-session, för betalväggens och
 * fotens bytesknappar (docs/qa/qa-kop-testlage-2026-09-24.md, bugg 3).
 *
 * Rutten har tre svar som knapparna måste skilja på:
 *
 *   200 { upgraded: true }  priset är bytt på prenumerationen, ingen kassa
 *                           (uppgradering till Hela paketet, eller sidbyte
 *                           mellan CV-paketet och Träningspaketet)
 *   200 { url }             en kassa att skicka vidare till (äldre väg)
 *   409 { vidFornyelse }    nedgradering eller längdbyte, sker vid förnyelsen
 *   409                     samma paket en gång till
 *
 * Förut väntade knapparna bara på url, så ett lyckat byte och ett nej såg
 * likadana ut: ingenting hände.
 */
import type { PlanKey } from '@/lib/plans/plans'

export type BytUtfall =
  | { typ: 'bytt'; planKey: PlanKey }
  | { typ: 'kassa'; url: string }
  | { typ: 'vidFornyelse'; skal: 'nedgradering' | 'langd' }
  | { typ: 'redan' }
  | { typ: 'fel' }

export async function bytPaket(planKey: PlanKey, returnPath?: string): Promise<BytUtfall> {
  try {
    const res = await fetch('/api/stripe/create-upgrade-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planKey, returnPath }),
    })
    const json = (await res.json().catch(() => ({}))) as {
      upgraded?: boolean
      url?: string
      planKey?: PlanKey
      vidFornyelse?: boolean
      skal?: string
    }
    if (res.status === 409 && json.vidFornyelse) {
      return { typ: 'vidFornyelse', skal: json.skal === 'langd' ? 'langd' : 'nedgradering' }
    }
    if (res.status === 409) return { typ: 'redan' }
    if (res.ok && json.upgraded) return { typ: 'bytt', planKey: json.planKey ?? planKey }
    if (res.ok && json.url) return { typ: 'kassa', url: json.url }
    return { typ: 'fel' }
  } catch {
    return { typ: 'fel' }
  }
}
