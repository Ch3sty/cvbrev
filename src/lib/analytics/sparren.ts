'use client'

/**
 * Mätningen av spärren efter de publika proven (omgång 3, beslut A och F).
 * Allt går genom capture() i events.ts, som förut; här byggs bara
 * egenskaperna, så att provsidan och artikelprovet skickar samma sak.
 *
 *   // rättningens svar från /api/public/test-session
 *   const sparr = sparrEgenskaper(data)
 *   capture('signup_gate_shown', { kind: 'test', cluster: 'test', test_kind, plats, ...sparr })
 *
 *   const ktx = sparrKontext({ test_kind, plats, slug }, data)
 *   gateCtaKlick('kort', ktx)          // ark, kort eller google
 *   facitVisat(ktx, data.oppet_facit)  // en gång per prov (token)
 */

import { capture, type SparrEgenskaper, type SparrKontext } from './events'
import { oppetFacitVariant, type OppetFacit } from '@/lib/tests/oppet-facit'

/** Det ur rättningens svar som mätningen läser. Saknade fält tolereras (äldre svar, sparat prov). */
export interface RattningForMatning {
  fel?: readonly number[] | null
  antal_fel?: number | null
  variant?: SparrEgenskaper['variant'] | null
  oppet_facit?: Pick<OppetFacit, 'index' | 'correct'> | null
}

/** antal_fel, variant och facit_oppet ur rättningens svar, för signup_gate_shown. */
export function sparrEgenskaper(r: RattningForMatning): SparrEgenskaper {
  const antal_fel = typeof r.antal_fel === 'number' ? r.antal_fel : (r.fel?.length ?? 0)
  return {
    antal_fel,
    variant: r.variant ?? oppetFacitVariant(antal_fel),
    facit_oppet: !!r.oppet_facit,
  }
}

/** Kontexten för gate_cta_clicked och facit_viewed. */
export function sparrKontext(
  bas: { test_kind: string; plats: 'prova' | 'artikel'; slug?: string },
  r: RattningForMatning
): SparrKontext {
  return {
    kind: 'test',
    cluster: 'test',
    test_kind: bas.test_kind,
    plats: bas.plats,
    ...(bas.slug ? { slug: bas.slug } : {}),
    ...sparrEgenskaper(r),
  }
}

/** En knapp i spärren trycktes: arket på telefon, kortet i resultatet eller Google-knappen. */
export function gateCtaKlick(position: 'ark' | 'kort' | 'google', ktx: SparrKontext): void {
  capture('gate_cta_clicked', { ...ktx, position })
}

const visadeFacit = new Set<string>()

/**
 * Det öppna facit visades. `nyckel` (provets token) gör att samma prov bara
 * räknas en gång per sidladdning, också när resultatet ritas om. Inget
 * skickas utan öppet facit.
 */
export function facitVisat(ktx: SparrKontext, oppet: Pick<OppetFacit, 'index' | 'correct'> | null | undefined, nyckel?: string): void {
  if (!oppet) return
  if (nyckel) {
    if (visadeFacit.has(nyckel)) return
    visadeFacit.add(nyckel)
  }
  capture('facit_viewed', { ...ktx, index: oppet.index, correct: oppet.correct })
}
