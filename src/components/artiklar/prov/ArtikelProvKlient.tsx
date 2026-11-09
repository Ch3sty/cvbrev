'use client'

/**
 * Provet i artikeln, på klienten: matrisens version (MatrisProv) och
 * typernas (TypProv). Uppgift 1 kommer från servern i artikelns HTML; svaret
 * startar provet och resten av uppgifterna visas i samma ruta.
 */

import { useCallback } from 'react'
import { FigurV7, LuckaV7 } from '@/lib/logicTestV7/layered.v7'
import type { LayeredCell } from '@/lib/logicTestV7/layered.v7'
import TypUppgiftVy from '@/components/publikt/prov/TypUppgiftVy'
import { PROVA } from '@/components/registrering/registrering-copy'
import { PROV_COPY, provAntal, type NyProvTyp, type PublikUppgift } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import { useArtikelProv } from './useArtikelProv'
import { ArtikelProvRam, ArtikelProvResultat } from './ArtikelProvRam'

export interface MatrisFraga {
  id: string
  grid: (LayeredCell | null)[][]
  options: LayeredCell[]
}

const BOKSTAV = 'ABCDEFGH'

export function MatrisProv({ slug, forsta }: { slug: string; forsta: MatrisFraga }) {
  const las = useCallback((d: Record<string, unknown>) => (Array.isArray(d.questions) ? (d.questions as MatrisFraga[]) : []), [])
  const rutnat = useCallback((q: MatrisFraga) => q.grid, [])
  const { lage, svara } = useArtikelProv<MatrisFraga>({ typ: 'matris', slug, total: 5, lasUppgifter: las, rutnatFor: rutnat })
  if (lage.fas === 'resultat' && lage.resultat && lage.token) {
    return <ArtikelProvResultat typ="matris" resultat={lage.resultat} token={lage.token} slug={slug} />
  }
  const q = lage.fas === 'forsta' ? forsta : lage.uppgifter[lage.index] ?? forsta
  const nu = lage.fas === 'forsta' ? 1 : lage.index + 1
  return (
    <ArtikelProvRam
      etikett="Matrislogik, prova direkt"
      rad={`Uppgift ${nu} av ${lage.total}. ${PROVA.fraga.fraga}`}
      nu={nu}
      av={lage.total}
      fel={lage.fel}
      registerHref={lage.registerHref}
      laddar={lage.laddar}
    >
      <div className="art-prov-matris" key={q.id}>
        <div className="pub-prov-matris matrisyta">
          <div className="pub-prov-matris-g">
            {q.grid.flat().map((cell, i) => (
              <div key={i} className={cell ? undefined : 'lucka'}>
                {cell ? <FigurV7 cell={cell} /> : <LuckaV7 />}
              </div>
            ))}
          </div>
        </div>
        <div className="pub-prov-alt matrisyta">
          {q.options.map((o, i) => (
            <button
              key={`${q.id}-${i}`}
              type="button"
              onClick={() => void svara(i)}
              disabled={lage.laddar}
              aria-label={PROVA.fraga.alternativ(BOKSTAV[i])}
              data-artikel-prov-svar={i}
            >
              <b aria-hidden="true">{BOKSTAV[i]}</b>
              <FigurV7 cell={o} />
            </button>
          ))}
        </div>
      </div>
    </ArtikelProvRam>
  )
}

export function TypProv({
  typ,
  slug,
  forsta,
  underlag: forstaUnderlag,
}: {
  typ: NyProvTyp
  slug: string
  forsta: PublikUppgift
  underlag: Record<string, VnUnderlag>
}) {
  const las = useCallback((d: Record<string, unknown>) => (Array.isArray(d.uppgifter) ? (d.uppgifter as PublikUppgift[]) : []), [])
  const { lage, svara, extra } = useArtikelProv<PublikUppgift>({ typ, slug, total: provAntal(typ), lasUppgifter: las })
  if (lage.fas === 'resultat' && lage.resultat && lage.token) {
    return <ArtikelProvResultat typ={typ} resultat={lage.resultat} token={lage.token} slug={slug} />
  }
  const u = lage.fas === 'forsta' ? forsta : lage.uppgifter[lage.index] ?? forsta
  const nu = lage.fas === 'forsta' ? 1 : lage.index + 1
  const underlag = { ...forstaUnderlag, ...((extra.underlag as Record<string, VnUnderlag> | undefined) ?? {}) }
  const c = PROV_COPY[typ]
  return (
    <ArtikelProvRam
      etikett={`${c.namn[0].toUpperCase()}${c.namn.slice(1)}, prova direkt`}
      rad={`Uppgift ${nu} av ${lage.total}`}
      nu={nu}
      av={lage.total}
      fel={lage.fel}
      registerHref={lage.registerHref}
      laddar={lage.laddar}
    >
      <div className="art-prov-typ" key={u.nyckel}>
        <TypUppgiftVy
          uppgift={u}
          underlag={underlag}
          nr={nu}
          antal={lage.total}
          seed={lage.token ?? 'artikel'}
          onSvar={(s) => void svara(s)}
          disabled={lage.laddar}
        />
      </div>
    </ArtikelProvRam>
  )
}
