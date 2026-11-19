/**
 * Ingångskortet Din utveckling på Hem (skissen Hem A): minigrafen med fyra
 * veckor för planens första typ (eller typen med mest data), teckenförklaringen,
 * Så ligger du till och senaste övningsprovet. Knappen Öppna Din utveckling.
 * Utan mätning säger kortet att kurvan börjar med Nivåkollen.
 *
 * Server component.
 */

import Link from 'next/link'
import { IkonChev, IkonPil } from '@/components/illustrations/RumSymboler'
import { kortDatum } from '@/lib/traning/rubrik'
import { DELTYP_NAMN } from '@/lib/traning/mittTest'
import { UTVECKLING_HREF, menyHref, utvecklingHref } from '@/lib/tester/v4/rutter'
import type { TestTypId, TesterV4Data } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'
import { fokusTyp } from './hemData'
import MiniGraf, { harKurva, miniGrafModell } from './MiniGraf'
import SaLiggerDuTill from './SaLiggerDuTill'

const U = HEM_V4.ingangUtv

export const KNAPP_MORK =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-1 px-[18px] text-sm font-semibold text-papper hover:bg-ink-hover'

function Legend({ andra, traning, provdag, planNamn }: { andra: boolean; traning: boolean; provdag: boolean; planNamn: string | null }) {
  return (
    <ul className="flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-xs text-ink-2" aria-label="Teckenförklaring">
      <li className="inline-flex items-center gap-1.5">
        <i aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full border-2 border-koppar" />
        {U.legend.nivakoll}
      </li>
      {traning ? (
        <li className="inline-flex items-center gap-1.5">
          <i aria-hidden="true" className="inline-block h-[7px] w-[7px] rounded-full bg-koppar-ljus" />
          {U.legend.trana}
        </li>
      ) : null}
      {provdag ? (
        <li className="inline-flex items-center gap-1.5">
          <i aria-hidden="true" className="inline-block w-3.5 border-t-2 border-dashed border-ink-3" />
          {U.legend.provdag}
        </li>
      ) : null}
      {andra ? (
        <li className="inline-flex items-center gap-1.5">
          <i aria-hidden="true" className="inline-block h-0.5 w-3.5 bg-ink-3 opacity-60" />
          {planNamn ? U.legend.utanfor(planNamn) : U.legend.andra}
        </li>
      ) : null}
    </ul>
  )
}

function ProvRing({ ratt, antal }: { ratt: number; antal: number }) {
  const r = 22
  const omkrets = 2 * Math.PI * r
  const del = antal > 0 ? Math.max(0, Math.min(1, ratt / antal)) : 0
  return (
    <svg viewBox="0 0 56 56" role="img" aria-label={U.provAria(ratt, antal)} className="h-[52px] w-[52px] shrink-0 sm:h-14 sm:w-14">
      <circle cx="28" cy="28" r={r} fill="none" style={{ stroke: 'var(--kant)' }} strokeWidth="6" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        style={{ stroke: 'var(--ton-ink)' }}
        strokeWidth="6"
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        strokeDasharray={`${(del * omkrets).toFixed(1)} ${omkrets.toFixed(1)}`}
      />
      <text x="28" y="27" textAnchor="middle" className="font-display" style={{ fontSize: 14, fontWeight: 800, fill: 'var(--ink-1)' }}>
        {ratt}
      </text>
      <text x="28" y="38" textAnchor="middle" style={{ fontSize: 8.5, fontWeight: 600, fill: 'var(--ink-3)' }}>
        av {antal}
      </text>
    </svg>
  )
}

function SenasteProv({ data, typ }: { data: TesterV4Data; typ: TestTypId }) {
  const prov = data.menyer[typ]?.senaste.prov.at(-1)
  if (!prov || !prov.resultat) return null
  const plan = data.plan
  const nasta = plan?.ovningsprov?.foreslagenDag && plan.ovningsprov.foreslagenDag >= data.idag ? plan.ovningsprov.foreslagenDag : null
  return (
    <div className="flex items-center gap-3 border-t border-kant pt-3 sm:gap-3.5" data-senaste-prov>
      <ProvRing ratt={prov.resultat.ratt} antal={prov.resultat.antal} />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <b className="text-sm font-semibold leading-[19px] text-ink-1">{U.provRubrik(prov.provNamn ?? 'Övningsprov', kortDatum(prov.dag))}</b>
        {nasta ? <span className="text-[12.5px] leading-[17px] text-ink-3 sm:text-meta">{U.provNasta(kortDatum(nasta))}</span> : null}
      </span>
      <Link href={menyHref(typ)} className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-[13px] font-semibold text-ink-2 underline decoration-kant-stark underline-offset-4">
        {U.provNytt}
      </Link>
    </div>
  )
}

export default function UtvecklingIngang({ data }: { data: TesterV4Data }) {
  const typ = fokusTyp(data)
  const plan = data.plan
  const m = typ ? miniGrafModell(data.kurva, typ, data.idag, plan) : null
  const visaGraf = !!m && harKurva(m)
  const historikLast = !data.gratis.premium && !data.gratis.harHistorik
  return (
    <section aria-labelledby="ingang-utv" className="flex min-w-0 flex-col gap-3 rounded-2xl border border-kant bg-papper p-4 sm:gap-3.5 sm:px-5 sm:pb-5 sm:pt-[18px]" data-ingang="utveckling">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-ey text-ink-3">{U.eyebrow}</p>
          <h2 id="ingang-utv" className="font-display text-[20px] font-bold leading-6 tracking-[-.02em] text-ink-1 sm:text-[21px] sm:leading-[25px]">
            {typ ? U.rubrik(DELTYP_NAMN[typ].toLowerCase()) : U.rubrikUtan}
          </h2>
        </div>
        <Link href={utvecklingHref(typ)} className="-my-1 inline-flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap text-[13px] font-semibold text-ink-2">
          <span className="sm:hidden">{U.helaKort}</span>
          <span className="hidden sm:inline">{U.hela}</span>
          <IkonChev size={16} />
        </Link>
      </div>

      {visaGraf && m ? (
        <>
          <MiniGraf m={m} planNamn={plan?.namn ?? null} />
          <Legend andra={m.andra.length > 0} traning={m.traningar.length > 0} provdag={!!m.provdag} planNamn={plan?.namn ?? null} />
          {historikLast ? <p className="text-meta text-ink-3">{U.historikLast}</p> : null}
        </>
      ) : (
        <p className="rounded-xl bg-papper-2 px-4 py-3.5 text-sm leading-[21px] text-ink-2" data-kurva-tom>
          {U.tom}
        </p>
      )}

      <SaLiggerDuTill typer={data.typer} plan={plan} />
      {typ ? <SenasteProv data={data} typ={typ} /> : null}

      <div className="mt-auto flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
        <Link href={UTVECKLING_HREF} className={`${KNAPP_MORK} w-full sm:w-auto`}>
          {U.knapp}
          <IkonPil size={16} />
        </Link>
        {visaGraf ? <span className="hidden text-meta text-ink-3 sm:inline">{U.fot}</span> : null}
      </div>
    </section>
  )
}
