'use client'

/**
 * Typvalet i det lyfta kortet (skissen rekryteringstester, "Vilket test vill
 * du prova?"). Ett vanligt GET-formulär till provsidan med ?typ=, så att
 * provet startar med vald testtyp också utan JavaScript. Klientkoden finns
 * bara för att behålla mätningen från det gamla provkortet
 * (article_cta_clicked, position hero, target med typen).
 *
 * Valen är radioknappar formade som tryckytor (CSS i rekryteringstester.css,
 * prefix rt-). Matrislogik är förvald, som på provsidan.
 */

import type { ReactNode } from 'react'
import { capture } from '@/lib/analytics/events'
import { PROV_TYPER, type ProvTyp } from '@/lib/tests/prov-typer'

export const PROV_VAL_NAMN: Record<ProvTyp, string> = {
  matris: 'Matrislogik',
  figurserie: 'Figurserier',
  deduktiv: 'Deduktivt',
  verbal: 'Verbalt',
  numerisk: 'Numeriskt',
  talserie: 'Talserier',
  spatial: 'Spatial förmåga',
  ordforrad: 'Ordförråd',
  iprov: 'I-provet',
}

export default function ProvVal({
  action,
  ikoner,
  knapp,
  not,
}: {
  action: string
  /** Glyfen per typ, ritad på servern. */
  ikoner: Partial<Record<ProvTyp, ReactNode>>
  knapp: ReactNode
  not?: ReactNode
}) {
  return (
    <form
      className="rt-provval"
      action={action}
      method="get"
      onSubmit={(e) => {
        const typ = new FormData(e.currentTarget).get('typ')
        capture('article_cta_clicked', { cluster: 'test', position: 'hero', target: `${action}?typ=${typ ?? 'matris'}` })
      }}
    >
      <fieldset>
        <legend>Vilket test vill du prova?</legend>
        <div className="rt-typval">
          {PROV_TYPER.map((typ) => (
            <label key={typ}>
              <input type="radio" name="typ" value={typ} defaultChecked={typ === 'matris'} />
              <span className="rt-typval-yta">
                {ikoner[typ] ? <span className="rt-typval-ikon" aria-hidden="true">{ikoner[typ]}</span> : null}
                <span>{PROV_VAL_NAMN[typ]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="p3-knapprad">
        {knapp}
        {not ? <span className="p3-liten">{not}</span> : null}
      </div>
    </form>
  )
}
