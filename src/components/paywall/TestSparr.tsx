'use client'

/**
 * Spärrarna i testflödet i omgång 3:s utseende (skissens Sparr-kvot och
 * Sparr-test, steg 3b). Bara ritningen: PaywallCard och övningsprovets vägg
 * äger texterna ur paywall-copy, priset ur useKampanjPris(), köpet, länkarna,
 * påminnelsen och mätningen precis som förut, och lämnar färdiga element
 * hit (prisraden, köpknappen, det sekundära, påminnelsen).
 *
 *   SparrVagg  på startskärmen: väggen med hennes siffror och trappan till
 *              vänster, arket "Det här öppnar Premium för dig" till höger och,
 *              när dagens gratisnivå är gjord, remsan om i morgon nedtill.
 *   SparrArk   i arket bakom ett låst val (GraValSheet): provets bild eller
 *              trappan i mörkt, siffrorna och det som ingår på papper.
 *   SparrFot   telefonens fot: köpknappen och raden om i morgon.
 *
 * Hennes siffror (dagens resultat, nivån, mönstret, provets namn och dag,
 * dagar kvar) är valfria. Saknas en faller raden bort, aldrig ett påhittat
 * värde. Löftena följer kvoterna och låsningen: riktad träning bara för
 * typerna som har den, övningsprov bara för typerna som har ett.
 */

import type { ReactNode } from 'react'
import type { BetalvaggPlats } from '@/lib/analytics/events'
import type { TestTyp } from '@/components/illustrations/TestGlyfer'

export interface SparrData {
  /** Dagens resultat på grundnivån (kvotspärren). */
  resultat?: { ratt: number; antal: number } | null
  /** Hennes nivå i typen, 1 till 10. */
  niva?: number | null
  /** Mönstret som föll i dag, i klartext. */
  monster?: string | null
  /** Provet hon övar mot: namnet och dagen ("25 nov"). */
  prov?: { namn: string; dag?: string | null } | null
  /** Övningsprovets format: namnet (null: vårt format), antal och minuter. */
  format?: { namn: string | null; antal: number; minuter: number; text?: string | null } | null
  /** Genomgången av dagens test ("Gå igenom dagens missar"). */
  gaIgenomHref?: string | null
}

/** Typerna med riktad träning i ett mönster (matris, ord och text, siffror och tabeller, talserier, spatial, ordförråd). */
const RIKTAD: readonly TestTyp[] = ['matris', 'verbalt', 'numeriskt', 'talserier', 'spatial', 'ordforrad']
/** Typerna med övningsprov mot klockan. */
const PROV: readonly TestTyp[] = ['matris', 'figurer', 'deduktiv', 'verbalt', 'numeriskt']

const PROVETS_NIVA = 4

export function nivaText(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1).replace('.', ',')
}

function genitiv(namn: string): string {
  return /[sxz]$/i.test(namn) ? namn : `${namn}s`
}

function IkonLas({ size = 16, farg = 'var(--sess-lucka-ink)' }: { size?: number; farg?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 10.5V8a4.5 4.5 0 019 0v2.5" fill="none" stroke={farg} strokeWidth="2.4" strokeLinecap="round" />
      <rect x="5" y="10.5" width="14" height="10" rx="3" fill={farg} />
    </svg>
  )
}

function IkonBock({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 12.5l5 5L20 6.5" />
    </svg>
  )
}

function IkonFlagga({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 21V3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M8.5 4h12l-3.5 4.5L20.5 13h-12z" fill="var(--koppar)" />
    </svg>
  )
}

function IkonX() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

/* ------------------------------------------------------------- löftena */

export interface Lofte {
  id: 'trana' | 'riktad' | 'prov' | 'nivakoll'
  ikon: ReactNode
  titel: string
  text: string
  /** Raden på telefon: en rad, så att kortet ryms ovanför foten (steg 3b). */
  mobil: string
  /** Den korta formen i arket: fetstilt början och resten. */
  kort: [string, string]
}

/**
 * Det Premium öppnar, sant enligt låsningen (gratisniva.ts, tillgang.ts):
 *   träning   tranaGratis false, ingen dagsgräns med Premium (ett påbörjat
 *             återupptas, ett avslutat ger ett nytt)
 *   riktad    riktadePassGratis false; bara typerna med riktad start
 *   prov      provlageGratis false; ett övningsprov per typ och dag (429)
 *   nivåkoll  ommatningGratis false (gratis en gång), kurvaHistorikGratis false
 */
export function sparrLoften(p: { testTyp?: TestTyp; data: SparrData; plats: BetalvaggPlats }): Lofte[] {
  const { testTyp, data } = p
  const ut: Lofte[] = []
  const niva = data.niva ?? null
  ut.push({
    id: 'trana',
    ikon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 20h4v-5h5v-5h5V5h4" />
      </svg>
    ),
    titel: niva != null ? `Träning från nivå ${nivaText(niva)} och uppåt` : 'Träning på din nivå',
    text: 'Uppgifterna följer dig mot provets nivå, så många omgångar du vill.',
    mobil: 'Uppgifterna följer dig mot provets nivå.',
    kort: ['Träning på din nivå varje dag', ', så många omgångar du vill'],
  })
  if (!testTyp || RIKTAD.includes(testTyp)) {
    ut.push({
      id: 'riktad',
      ikon: (
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
          <rect x="2" y="2" width="10" height="10" rx="3" fill="currentColor" />
          <rect x="16" y="2" width="10" height="10" rx="3" fill="currentColor" />
          <rect x="2" y="16" width="10" height="10" rx="3" fill="currentColor" />
          <rect x="16.9" y="16.9" width="8.2" height="8.2" rx="2.5" fill="none" stroke="var(--koppar)" strokeWidth="1.8" strokeDasharray="3 2.4" />
        </svg>
      ),
      titel: data.monster ? `${data.monster}, mönstret du missade` : 'Ett mönster i taget',
      text: data.monster ? 'Riktad träning på det som föll i dag, med regeln efter varje svar.' : 'Riktad träning på det du tappar, med regeln efter varje svar.',
      mobil: data.monster ? 'Riktad träning på det som föll i dag.' : 'Riktad träning på det du tappar.',
      kort: ['Riktad träning', ' på mönstret du tappar'],
    })
  }
  if (!testTyp || PROV.includes(testTyp)) {
    const f = data.format ?? null
    ut.push({
      id: 'prov',
      ikon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4.5l3 2M9.5 2.5h5" />
        </svg>
      ),
      titel: f?.namn ? `Övningsprov i ${genitiv(f.namn)} format` : 'Övningsprov mot klockan',
      text: f ? `${f.text ?? `${f.antal} uppgifter på ${f.minuter} minuter`}, mot klockan.` : 'Ett om dagen, i provets tempo, med genomgången efteråt.',
      mobil: f ? `${f.text ?? `${f.antal} uppgifter på ${f.minuter} minuter`}, mot klockan.` : 'Ett om dagen, i provets tempo.',
      kort: ['Övningsprov mot klockan', f?.namn ? `, ett om dagen, i samma format som ${f.namn}` : ', ett om dagen'],
    })
  }
  ut.push({
    id: 'nivakoll',
    ikon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 17l5-5 4 3 8-8" />
        <path d="M15 7h5v5" />
      </svg>
    ),
    titel: 'Ny nivåkoll varje vecka',
    text: 'Och hela din kurva, med varje regel du tappar.',
    mobil: 'Och hela din kurva.',
    kort: ['Ny nivåkoll varje vecka', ' och hela din kurva'],
  })
  return ut
}

/* --------------------------------------------------------------- trappan */

function Trappa({ niva, prov, kort }: { niva: number | null; prov: SparrData['prov']; kort?: boolean }) {
  // Grund 1 till 4, avancerad 4 till 7, expert 7 till 10 (sidkortets gränser).
  const vanster = niva != null ? Math.min(0.97, Math.max(0.03, (niva - 1) / 9)) : null
  const pa = niva != null ? (niva < PROVETS_NIVA ? 'grund' : niva < 7 ? 'avancerad' : 'expert') : null
  // Lägst 52 px, så att namnet och raden alltid ryms i steget (telefonens lägre trappa).
  const hojd = { grund: 'max(32%, 52px)', avancerad: 'max(53%, 70px)', expert: 'max(76%, 88px)' } as const
  const aria = [
    niva != null ? `Du ligger på ${nivaText(niva)}.` : null,
    'Grundnivån ingår gratis, ett test om dagen. Provet ligger på avancerad nivå, som ingår i Premium, liksom expertnivån.',
    prov?.dag ? `Provet är ${prov.dag}.` : null,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div data-sparr-trappa>
      <div className="sparr-trappa h-[104px] lg:h-[216px]" role="img" aria-label={aria}>
        <div className="sparr-steg" data-steg="grund" style={{ height: hojd.grund }}>
          <b>Grund</b>
          {kort ? <span>gratis</span> : <span><span className="lg:hidden">gratis</span><span className="hidden lg:inline">gratis, ett test om dagen</span></span>}
        </div>
        <div className="sparr-steg" data-steg="avancerad" style={{ height: hojd.avancerad }}>
          {prov?.dag ? (
            <span className="absolute -top-[34px] left-3 flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold leading-4 !text-vagg-ink lg:-top-[38px]">
              <IkonFlagga size={24} />
              provet {prov.dag}
            </span>
          ) : null}
          <b>
            <IkonLas />
            Avancerad
          </b>
          <span>provets nivå</span>
        </div>
        <div className="sparr-steg" data-steg="expert" style={{ height: hojd.expert }}>
          <b>
            <IkonLas farg="var(--vagg-mjuk)" />
            Expert
          </b>
          {kort ? <span>i Premium</span> : <span><span className="lg:hidden">i Premium</span><span className="hidden lg:inline">ingår i Premium</span></span>}
        </div>
        {vanster != null && pa ? (
          <span className="sparr-du" style={{ left: `${(vanster * 100).toFixed(1)}%`, bottom: `calc(${hojd[pa]} - 6px)` }} aria-hidden="true">
            <b>du, nivå {nivaText(niva!)}</b>
            <i />
          </span>
        ) : null}
      </div>
      <div className="h-[3px] rounded-sm bg-vagg-2" />
    </div>
  )
}

/* ------------------------------------------------------------ väggen */

export interface SparrVyProps {
  slag: 'kvot' | 'premium'
  plats: BetalvaggPlats
  testTyp?: TestTyp
  data: SparrData
  dagarKvar: number | null
  /** Variantens rubrik ur paywall-copy ("Dagens grundnivåtest är gjort", "Träning på din nivå ingår i Premium"). */
  titel: string
  /** Variantens brödtext ur paywall-copy, när hennes siffror inte räcker till en egen rad. */
  body: string
  prisrad: ReactNode
  kop: ReactNode
  sekundar: ReactNode
  /** "Påminn mig i morgon" (POST /api/quota/remind), bara kvotspärren med kvotnyckel. */
  paminn?: ReactNode
  felrad?: ReactNode
  /** del 'kort': köpknappen står i foten på telefon. */
  del?: 'kort'
}

/** Rubriken på väggen: hennes resultat när det finns, annars variantens rubrik. */
/** Ingressen på telefon, högst två rader: bankens långa brödtexter byts mot en kort och sann rad. */
const KORT_INGRESS = 'Avancerad och expert i alla testtyper, träning utan tak och övningsprov mot klockan.'

function vaggRubrik(p: SparrVyProps): { eyebrow: string; rubrik: ReactNode; text: string; mobil: string } {
  const prov = p.data.prov ?? null
  const provText = prov ? `${prov.namn}${prov.dag ? ` ${prov.dag}` : ''} prövar avancerad nivå. Den öppnar du med Premium, och du kan börja nu.` : null
  if (p.slag === 'kvot') {
    const r = p.data.resultat ?? null
    return {
      eyebrow: p.titel,
      rubrik: r ? (
        <>
          {r.ratt} av {r.antal} på grundnivån.
          <br />
          Provet ligger ett steg upp.
        </>
      ) : (
        'Ett nytt grundnivåtest öppnar i morgon.'
      ),
      text: provText ?? p.body,
      mobil: prov ? `${prov.namn} prövar avancerad nivå. Den öppnar du med Premium.` : 'Avancerad nivå och träning utan tak öppnar du med Premium.',
    }
  }
  const text = provText ?? p.body
  return { eyebrow: p.titel, rubrik: arkRubrik(p.plats), text, mobil: text.length <= 90 ? text : KORT_INGRESS }
}

export function SparrVagg(p: SparrVyProps) {
  const loften = sparrLoften({ testTyp: p.testTyp, data: p.data, plats: p.plats }).filter((l) => l.id !== 'nivakoll').slice(0, 3)
  const r = vaggRubrik(p)
  const kvar = p.slag === 'kvot'
  return (
    <div className="flex flex-col gap-5 lg:gap-10" data-sparr-vagg={p.slag}>
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,590px)_480px] lg:gap-x-[50px]">
        <div className="min-w-0">
          <p className="res-ey" style={{ color: 'var(--sess-lucka-ink)' }} data-sparr-eyebrow>
            {r.eyebrow}
          </p>
          <h1 className="res-h1 mt-2 lg:mt-3" data-langre="" data-sparr-rubrik>
            {r.rubrik}
          </h1>
          <p className="mt-2.5 max-w-[500px] text-[15px] leading-[22px] text-vagg-mjuk lg:mt-4 lg:text-[18px] lg:leading-7">
            <span className="hidden lg:inline">{r.text}</span>
            <span className="lg:hidden">{r.mobil}</span>
          </p>
          <div className="mt-9 lg:mt-14">
            <Trappa niva={p.data.niva ?? null} prov={p.data.prov ?? null} />
          </div>
        </div>
        <section className="sparr-ark" aria-label="Det här öppnar Premium för dig" data-sparr-ark>
          <div className="sparr-hu">
            <IkonLas size={18} />
            Det här öppnar Premium för dig
          </div>
          <div className="px-4 pb-5 pt-2 lg:px-[22px] lg:pb-6 lg:pt-2.5">
            {p.dagarKvar != null && p.dagarKvar >= 0 && p.slag === 'premium' ? (
              <p className="mt-2 text-sm font-semibold leading-5 text-ink-1" data-sparr-dagar>
                {p.dagarKvar === 0 ? 'Provet är i dag.' : p.dagarKvar === 1 ? 'En dag kvar till provet.' : `${p.dagarKvar} dagar kvar till provet.`}
              </p>
            ) : null}
            <div data-sparr-loften>
              {loften.map((l) => (
                <div key={l.id} className="sparr-p" data-lofte={l.id}>
                  <span className="sparr-ik">{l.ikon}</span>
                  <div className="min-w-0">
                    <b>{l.titel}</b>
                    <span className="max-lg:!hidden">{l.text}</span>
                    <span className="lg:!hidden">{l.mobil}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 border-t-[1.5px] pt-4" style={{ borderColor: 'var(--sess-res-radlinje)' }}>
              <p className="sparr-pris" data-sparr-pris>
                {p.prisrad}
              </p>
            </div>
            <div className={`mt-4 ${p.del === 'kort' ? 'max-lg:mt-0' : ''}`}>{p.kop}</div>
            <div className="mt-2.5 flex justify-center">{p.sekundar}</div>
            {p.felrad}
          </div>
        </section>
      </div>
      {kvar ? (
        <div className={`res-rem ${p.del === 'kort' ? 'hidden lg:flex' : ''}`} data-sparr-imorgon>
          <div className="flex gap-0.5" role="img" aria-label="I dag är grundnivåtestet gjort. I morgon öppnar ett nytt.">
            <span className="res-dag min-w-[60px]" data-dag="gjord">
              <i>
                <IkonBock />
              </i>
              i dag
            </span>
            <span className="res-dag min-w-[60px]" data-dag="ny">
              <i>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </i>
              i morgon
            </span>
          </div>
          <p className="m-0 flex-1 text-[15px] leading-[22px] text-vagg-mjuk">
            <b className="font-semibold text-vagg-ink">I morgon öppnar ett nytt grundnivåtest, gratis.</b>
            <br />
            I vilken testtyp du vill.{p.data.gaIgenomHref ? ' Genomgången av dagens test är öppen redan nu.' : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {p.paminn}
            {p.data.gaIgenomHref ? (
              <a href={p.data.gaIgenomHref} className="res-tyst" data-sparr-ga-igenom>
                Gå igenom dagens missar
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Telefonens fot: köpknappen och, på kvotspärren, raden om i morgon med påminnelsen. */
export function SparrFot({ kop, slag, paminn }: { kop: ReactNode; slag: 'kvot' | 'premium'; paminn?: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-2" data-sparr-fot={slag}>
      {kop}
      {slag === 'kvot' ? (
        <p className="m-0 flex flex-wrap items-center justify-center gap-x-1.5 text-center text-sm leading-5 text-ink-2">
          Nytt grundnivåtest i morgon, gratis. {paminn}
        </p>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------- arket */

function ProvBild() {
  const prickar: [number, number][][] = [[[40, 40]], [[27, 40], [53, 40]], [[40, 26], [26, 52], [54, 52]], [[27, 40], [53, 40]], [[40, 26], [26, 52], [54, 52]], [[27, 27], [53, 27], [27, 53], [53, 53]], [[40, 26], [26, 52], [54, 52]], [[27, 27], [53, 27], [27, 53], [53, 53]]]
  return (
    <div className="relative" aria-hidden="true">
      <div className="opacity-50">
        <div className="sparr-prov">
          <div className="flex items-center gap-2.5">
            <div className="grid flex-1 grid-cols-[repeat(20,minmax(0,1fr))] gap-[3px]">
              {Array.from({ length: 20 }, (_, i) => (
                <i key={i} className="h-2 rounded bg-[color:var(--sess-bit)]" />
              ))}
            </div>
            <span className="inline-flex h-7 items-center gap-1 rounded-[10px] bg-papper px-2 font-sess-display text-[13px] font-bold text-ink-1">40:00</span>
          </div>
          <div className="mt-3 grid grid-cols-[minmax(0,164px)_minmax(0,1fr)] gap-5">
            <div className="grid grid-cols-3 gap-[5px] rounded-[14px] p-[9px]" style={{ background: 'var(--sess-brade)' }}>
              {prickar.map((pr, i) => (
                <i key={i} className="flex aspect-square items-center justify-center rounded-[7px] bg-white">
                  <svg viewBox="0 0 80 80" className="h-2/3 w-2/3">
                    {pr.map(([x, y], k) => (
                      <circle key={k} cx={x} cy={y} r="9" fill="var(--sess-figur)" />
                    ))}
                  </svg>
                </i>
              ))}
              <i className="aspect-square rounded-[7px] border-2 border-dashed" style={{ borderColor: 'var(--koppar)' }} />
            </div>
            <div>
              <div className="h-[9px] w-[86%] rounded bg-[color:var(--sess-serie-ljus)]" />
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} className="aspect-[1.15] rounded-[10px] border-2 bg-white" style={{ borderColor: 'var(--sess-kant)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="sparr-ingar">
        <IkonLas size={18} />
        Ingår i Premium
      </span>
    </div>
  )
}

/** Arkets rubrik per plats: skissens för övningsprovet, korta och sanna för de andra. */
function arkRubrik(plats: BetalvaggPlats): string {
  switch (plats) {
    case 'generalrepetition':
    case 'provlage':
      return 'Gör provet en gång innan det gäller'
    case 'dag2':
      return 'Träna på din nivå varje dag'
    case 'riktat':
      return 'Träna mönstret som föll'
    case 'ommatning':
      return 'Mät nivån igen när du vill'
    case 'kurva':
    case 'historik':
      return 'Se hela din kurva'
    case 'kvot':
      return 'Fortsätt i dag med Premium'
    default:
      return 'Provet ligger på avancerad nivå'
  }
}

export interface SparrArkProps extends Omit<SparrVyProps, 'del' | 'paminn'> {
  /** Raden under länkarna (PASS_COPY.betalvagg.text). */
  fotrad?: string | null
  onStang?: (() => void) | null
  /** Övningsprovets bild i stället för trappan. */
  provbild?: boolean
}

export function SparrArk(p: SparrArkProps) {
  const loften = sparrLoften({ testTyp: p.testTyp, data: p.data, plats: p.plats })
  const prov = p.provbild || p.plats === 'generalrepetition' || p.plats === 'provlage'
  // Provets löfte först på provets spärr (skissen).
  const ordnade = prov ? [...loften.filter((l) => l.id === 'prov'), ...loften.filter((l) => l.id !== 'prov' && l.id !== 'riktad')] : loften.filter((l) => l.id !== 'riktad')
  const niva = p.data.niva ?? null
  const sif: { tal: string; etikett: string }[] = []
  if (p.dagarKvar != null && p.dagarKvar >= 0) sif.push({ tal: String(p.dagarKvar), etikett: 'dagar kvar till provet' })
  if (niva != null) sif.push({ tal: nivaText(niva), etikett: 'din nivå i dag' })
  if (niva != null && niva < PROVETS_NIVA) sif.push({ tal: nivaText(PROVETS_NIVA - niva), etikett: 'kvar till provets nivå' })
  const f = p.data.format ?? null
  return (
    <section className="grid grid-cols-1 overflow-hidden lg:grid-cols-[470px_minmax(0,1fr)]" aria-label={p.titel} data-sparr-arket>
      <div className="relative overflow-hidden px-4 pb-4 pt-4 lg:flex lg:flex-col lg:px-[30px] lg:pb-7 lg:pt-[30px]" style={{ background: 'var(--vagg)', color: 'var(--vagg-ink)' }}>
        <svg width="300" height="300" viewBox="0 0 300 300" aria-hidden="true" className="pointer-events-none absolute -bottom-[130px] -left-[130px]">
          <circle cx="150" cy="150" r="150" fill="var(--sess-res-panel)" />
        </svg>
        <p className="res-ey relative hidden lg:block" style={{ color: 'var(--vagg-mjuk)' }}>
          {prov ? 'Så ser övningsprovet ut' : 'Nivåerna'}
        </p>
        <div className={`relative mt-3.5 ${prov ? '' : 'lg:flex lg:flex-1 lg:flex-col lg:justify-center'}`}>{prov ? <ProvBild /> : <Trappa niva={niva} prov={p.data.prov ?? null} kort />}</div>
        {prov ? (
          <p className="relative mt-4 hidden text-[15px] leading-[22px] text-vagg-mjuk lg:block">
            {f ? `${f.text ?? `${f.antal} uppgifter på ${f.minuter} minuter`} och inga förklaringar under tiden.` : 'Mot klockan och inga förklaringar under tiden.'} Efteråt ser du var tiden gick och vilket mönster som föll.
          </p>
        ) : null}
      </div>
      <div className="relative flex flex-col bg-papper px-4 pb-5 pt-5 text-ink-1 lg:px-[34px] lg:pb-[26px] lg:pt-[30px]">
        {p.onStang ? (
          <button type="button" onClick={p.onStang} aria-label="Stäng" className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[color:var(--sess-indigo-mjuk)] text-ink-1 lg:right-4 lg:top-4" data-sparr-stang>
            <IkonX />
          </button>
        ) : null}
        <p className="res-ey pr-12" style={{ color: 'var(--sess-rad3-ink)' }} data-sparr-eyebrow>
          {p.titel}
        </p>
        <h2 className="mt-2 max-w-[440px] pr-10 font-sess-display text-[26px] font-extrabold leading-[30px] tracking-[-.02em] lg:text-[36px] lg:leading-10" data-sparr-rubrik>
          {arkRubrik(p.plats)}
        </h2>
        {sif.length ? (
          <div className="sparr-sif mt-5" role="img" aria-label={sif.map((s) => `${s.tal} ${s.etikett}`).join('. ')} data-sparr-siffror>
            {sif.map((s) => (
              <div key={s.etikett}>
                <b>{s.tal}</b>
                <span>{s.etikett}</span>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-5 flex flex-col gap-2.5" data-sparr-loften>
          {ordnade.map((l) => (
            <div key={l.id} className="sparr-ing" data-lofte={l.id}>
              <i>
                <IkonBock size={13} />
              </i>
              <span>
                <b className="font-semibold">{l.kort[0]}</b>
                {l.kort[1]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-[18px]">
          <div className="border-t-[1.5px] pt-4" style={{ borderColor: 'var(--sess-res-radlinje)' }}>
            <p className="sparr-pris" data-sparr-pris>
              {p.prisrad}
            </p>
          </div>
          <div className="mt-3.5">{p.kop}</div>
          <div className="mt-2 flex flex-wrap justify-between gap-x-4">{p.sekundar}</div>
          {p.felrad}
          {p.fotrad ? <p className="mt-1.5 text-[13px] leading-[18px] text-[color:var(--sess-res-sub)]">{p.fotrad}</p> : null}
        </div>
      </div>
    </section>
  )
}
