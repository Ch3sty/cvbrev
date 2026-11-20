'use client'

/**
 * Vägen till provet (omgång 3, skissens Hem och Mobil-hem): ett förslag per
 * dag från i dag till provdagen, färdigt ur datan (vagen.ts). I dag mörk,
 * provdagen i koppar, övriga dagar vita kort. Varje kort är en riktig länk;
 * låsta förslag leder till typens meny som visar låset. Kort som kommer ur en
 * hint skickar hint_klickad med sin plats, som Fler steg gjorde.
 */

import Link from 'next/link'
import type { VagDag } from '@/lib/tester/v4/typer'
import { veckodagNamn } from '@/lib/traning/datum'
import { kortDatumV, kortVeckodag } from '@/lib/tester/v4/vagen'
import { hintKlickad, type HintKontext } from '@/components/tester-v4/hem/HintSparning'
import { Ikon3, Las3 } from './delar'

const versal = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function nar(v: VagDag, idag: string): { lang: string; kort: string; datum: string; datumKort: string } {
  if (!v.dag) return { lang: v.slag === 'valfritt' ? 'Har du ett prov?' : '', kort: 'Prov?', datum: 'valfritt', datumKort: 'valfritt' }
  if (v.dag === idag) return { lang: 'I dag', kort: 'I dag', datum: `${kortVeckodag(v.dag)} ${kortDatumV(v.dag)}`, datumKort: `${kortVeckodag(v.dag)} ${kortDatumV(v.dag).split(' ')[0]}` }
  return { lang: versal(veckodagNamn(v.dag)), kort: versal(kortVeckodag(v.dag)), datum: kortDatumV(v.dag), datumKort: kortDatumV(v.dag) }
}

export default function Vagen({ vagen, idag, kontext, harPlan }: { vagen: VagDag[]; idag: string; kontext: HintKontext; harPlan: boolean }) {
  if (!vagen.length) return null
  return (
    <section className="t3-sektion" aria-labelledby="t3-vagen" data-vagen>
      <div className="t3-sektion-huvud">
        <h2 id="t3-vagen" className="t3-h2">
          {harPlan ? 'Vägen till provet' : 'Vägen framåt'}
        </h2>
        <p className="t3-sektion-rad">
          Ett förslag per dag, valt ur dina resultat. Allt är öppet hela tiden<span className="hidden xl:inline">, du kan ta dem i den ordning du vill</span>.
        </p>
      </div>
      <ol className="t3-vagen" style={{ ['--t3-dagar' as string]: vagen.length }}>
        {vagen.map((v, i) => {
          const n = nar(v, idag)
          const las = v.handling?.las ?? null
          const inne = (
            <>
              <span className="t3-dag-nar">
                <span className="hidden xl:inline">{n.lang}</span>
                <span className="xl:hidden">{n.kort}</span>
                <small>
                  <span className="hidden xl:inline">{n.datum}</span>
                  <span className="xl:hidden">{n.datumKort}</span>
                </small>
              </span>
              <span className="t3-dag-ik">
                <Ikon3 ikon={v.ikon} size={22} />
              </span>
              <span className="t3-dag-text">
                <b>{v.rubrik}</b>
                <span className="t3-dag-skal">{v.text}</span>
                {las ? (
                  <span className="t3-dag-las">
                    <Las3 size={14} />
                    {las.chip}
                  </span>
                ) : null}
              </span>
              {v.slag === 'valfritt' ? <span className="t3-dag-valj xl:hidden">Välj</span> : null}
            </>
          )
          return (
            <li key={`${v.dag ?? 'x'}-${i}`} className="contents">
              {v.href ? (
                <Link
                  href={v.href}
                  className="t3-dag"
                  data-dag={v.slag}
                  aria-current={v.slag === 'idag' ? 'date' : undefined}
                  onClick={() => {
                    if (v.hint) hintKlickad(v.hint, kontext, i)
                  }}
                >
                  {inne}
                </Link>
              ) : (
                <div className="t3-dag" data-dag={v.slag}>
                  {inne}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
