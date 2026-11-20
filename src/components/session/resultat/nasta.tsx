// Nästa steg på resultatsidan efter ett test (omgång 3, steg 3b, skissens
// Resultat-test): "Träna det du missade" i mönstret som föll. Riktad träning
// när typen har en startadress för mönstret, annars typens Träna. Allt rätt:
// anroparens eget steg står kvar.

import type { ResultatskarmProps } from '../Resultatskarm'
import { antalOrd } from '../copy'
import { IkonFlaggaProv } from './delar'

export interface MissatMonster {
  namn: string
  ratt: number
  antal: number
  /** Startadressen för riktad träning i mönstret, null när typen saknar den. */
  riktadHref?: string | null
}

/** Raden om provet ur dagarna kvar; null utan provdatum eller när provet varit. */
export function provRad(dagarKvar: number | null | undefined): string | null {
  if (dagarKvar == null || dagarKvar < 0) return null
  if (dagarKvar === 0) return 'Provet är i dag.'
  if (dagarKvar === 1) return 'Provet är i morgon.'
  return `Provet är om ${antalOrd(dagarKvar)} dagar.`
}

export function tranaMissatSteg(opt: {
  monster: MissatMonster[]
  /** Typens Träna när mönstret saknar riktad start. */
  typensHref: string
  /** Raden om provet ("Provet är på onsdag, två dagar kvar"), när planen har ett datum. */
  provRad?: string | null
  /** Steget när inget mönster föll. */
  annars: ResultatskarmProps['nastaSteg']
}): ResultatskarmProps['nastaSteg'] {
  const svagast = [...opt.monster].filter((m) => m.antal > 0 && m.ratt < m.antal).sort((a, b) => a.ratt / a.antal - b.ratt / b.antal)[0]
  if (!svagast) return opt.annars
  const fel = svagast.antal - svagast.ratt
  const riktad = svagast.riktadHref ?? null
  return {
    titel: 'Träna det du missade',
    monster: { namn: svagast.namn, rad: `${antalOrd(fel)} fel av ${antalOrd(svagast.antal)}` },
    text: riktad ? 'Uppgifter i just det mönstret, med regeln efter varje svar.' : 'Träningen följer din nivå, med regeln efter varje svar.',
    extra: opt.provRad ? (
      <p className="mt-5 flex items-center gap-2.5 border-t pt-3.5 text-sm leading-5 text-vagg-mjuk" style={{ borderColor: 'var(--sess-res-linje)' }} data-resultat-provrad>
        <span className="text-vagg-ink">
          <IkonFlaggaProv />
        </span>
        <span>{opt.provRad}</span>
      </p>
    ) : null,
    knapp: riktad
      ? { text: `Träna ${svagast.namn.toLowerCase()}`, href: riktad, data: 'trana-missat' }
      : { text: 'Träna det du missade', href: opt.typensHref, data: 'trana-missat' },
  }
}
