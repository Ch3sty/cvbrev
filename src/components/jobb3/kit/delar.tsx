/**
 * Jobbsökets små delar: knappar, brickor, piller, taggar, betyg, matchringen
 * och tjänstens lilla fyrstegsbana. Allt tar data som props och skriver
 * ingen egen färg: klasserna står i src/app/jobb3.css.
 *
 * Knapparna är länkar när de får `href`, annars riktiga knappar.
 * Serverkomponenter (inga hooks); onClick fungerar när de används i en klientvy.
 */

import Link from 'next/link'
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import { IkonBock } from './ikoner'

type KnappBas = {
  children: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  disabled?: boolean
  className?: string
  'aria-label'?: string
  /** Extern länk: öppnas i ny flik. */
  extern?: boolean
}

function Knapp({ klass, children, href, onClick, type = 'button', disabled, className, extern, ...rest }: KnappBas & { klass: string }) {
  const cls = className ? `${klass} ${className}` : klass
  if (href && !disabled) {
    if (extern || /^(https?:|mailto:|tel:)/.test(href)) {
      return (
        <a href={href} className={cls} onClick={onClick} aria-label={rest['aria-label']} {...(extern ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={cls} onClick={onClick} aria-label={rest['aria-label']}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={rest['aria-label']}>
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ knappar */

export interface StorKnappProps extends KnappBas {
  /** 'normal' 60 px på dator, 'mellan' 56, 'lag' 52 (Jobbcoachens Skicka). Telefon: alltid 56 och full bredd. */
  storlek?: 'normal' | 'mellan' | 'lag'
  /** Står på golvet (mjukare skugga på dator, som i panelerna). */
  golv?: boolean
  /** Full bredd också på dator (Rapportens knapp, arkens fot). */
  bred?: boolean
}

/** Primärknappen i koppar. EN per skärm. */
export function StorKnapp({ storlek = 'normal', golv, bred, className, ...p }: StorKnappProps) {
  const k = ['j3-stor', storlek !== 'normal' ? storlek : '', golv ? 'golv' : '', bred ? 'bred' : '', className ?? ''].filter(Boolean).join(' ')
  return <Knapp klass={k} {...p} />
}

export interface LitenKnappProps extends KnappBas {
  /** Höjd: 44 (grund), 48 (Matchade jobb, uppföljningen) eller 52 (telefonens fot). */
  storlek?: 44 | 48 | 52
  /** 'vit' (grund), 'kop' (köp, bara i betalväggar), 'streckad' (Annat), 'morkt' (på väggens mörka kort). */
  variant?: 'vit' | 'kop' | 'streckad' | 'morkt'
  bred?: boolean
  /** Ikon före texten, ritas i rummets gröna. */
  ikon?: ReactNode
}

/** Den vita knappen med tjock underkant. */
export function LitenKnapp({ storlek = 44, variant = 'vit', bred, ikon, children, className, ...p }: LitenKnappProps) {
  const k = ['j3-liten', storlek !== 44 ? `s${storlek}` : '', variant !== 'vit' ? variant : '', bred ? 'bred' : '', className ?? ''].filter(Boolean).join(' ')
  return (
    <Knapp klass={k} {...p}>
      {ikon}
      {children}
    </Knapp>
  )
}

/** Ikonknappen i annonsens fot på telefon (Spara, Markera som sökt): 56 x 56. */
export function IkonKnapp({ children, etikett, ...p }: Omit<KnappBas, 'aria-label'> & { etikett: string }) {
  return (
    <Knapp klass="j3-liten ikon" aria-label={etikett} {...p}>
      {children}
    </Knapp>
  )
}

/** Glasknappen i väggen ("Logga sökt tjänst", "Redigera"). */
export function GlasKnapp({ ikon, children, ...p }: KnappBas & { ikon?: ReactNode }) {
  return (
    <Knapp klass="j3-glas" {...p}>
      {ikon}
      {children}
    </Knapp>
  )
}

/** Textlänk på golvet, eller på väggen med `vagg`. */
export function TextLank({ vagg, mjuk, liten, ...p }: KnappBas & { vagg?: boolean; mjuk?: boolean; liten?: boolean }) {
  const k = vagg ? `j3-lank-vagg${mjuk ? ' mjuk' : ''}` : `j3-lank${liten ? ' liten' : ''}`
  return <Knapp klass={k} {...p} />
}

/* ------------------------------------------------------------------ väggens brickor */

/** Bricka i väggen (chip): data, aldrig en knapp om den inte har href. */
export function Chip({ children, href, liten }: { children: ReactNode; href?: string; liten?: boolean }) {
  const k = liten ? 'j3-chip liten' : 'j3-chip'
  if (href) {
    return (
      <Link href={href} className={k}>
        {children}
      </Link>
    )
  }
  return <span className={k}>{children}</span>
}

/** Glasbrickan med en kort text (orterna i "Så söker vi åt dig"). */
export function VaggEtikett({ children }: { children: ReactNode }) {
  return <span className="j3-vchip">{children}</span>
}

function MalPips({ antal, mal }: { antal: number; mal: number }) {
  return (
    <span className="j3-malpips" aria-hidden="true">
      {Array.from({ length: mal }, (_, i) => (
        <i key={i} data-fylld={i < antal ? '' : undefined} />
      ))}
    </span>
  )
}

export interface VeckansMalProps {
  antal: number
  mal: number
  /** "Ändra" öppnar arket Ändra veckans mål. */
  onAndra?: MouseEventHandler<HTMLElement>
  andraHref?: string
  /** Den korta formen bredvid ögonbrynet på telefon. */
  kompakt?: boolean
}

/**
 * Veckans mål som bricka i väggen (BYGGSPEC F4): rutor för målet, fyllda för
 * det som är sökt. Nått mål: "Veckans mål klart: 3 av 3". Ingen svit, ingen
 * bestraffning. Rutorna fyller aldrig mer än målet.
 */
export function VeckansMal({ antal, mal, onAndra, andraHref, kompakt }: VeckansMalProps) {
  const klart = antal >= mal
  const sr = `${Math.min(antal, mal)} av ${mal}`
  if (kompakt) {
    return (
      <span className="j3-mal-kort">
        <MalPips antal={antal} mal={mal} />
        <span className="sr-only">Veckans mål: </span>
        {klart ? `Målet klart: ${sr}` : `${sr} sökta i veckan`}
      </span>
    )
  }
  return (
    <>
      <span className="j3-chip">
        <MalPips antal={antal} mal={mal} />
        {klart ? `Veckans mål klart: ${antal} av ${mal}` : `Veckans mål: ${antal} av ${mal} sökta`}
      </span>
      {onAndra || andraHref ? (
        <TextLank vagg mjuk href={andraHref} onClick={onAndra}>
          Ändra
        </TextLank>
      ) : null}
    </>
  )
}

/** Den stora brickan på tjänstens vägg (92 på dator, 64 på telefon). Kopparring när det är tyst. */
export function StorBricka({ kod, tyst }: { kod: string; tyst?: boolean }) {
  return (
    <span className={tyst ? 'j3-storbricka tyst' : 'j3-storbricka'} aria-hidden="true">
      {kod}
    </span>
  )
}

export type VaggBrickTon = 'vit' | 'tyst' | 'tom' | 'int' | 'av'

/** Bricka på väggen (facken, statistikens grupper). Tagg ovanför, t.ex. "15 dagar". */
export function VaggBricka({ kod, ton = 'vit', stor, tagg, taggLjus, href, etikett }: { kod: string; ton?: VaggBrickTon; stor?: boolean; tagg?: string; taggLjus?: boolean; href?: string; etikett?: string }) {
  const k = ['j3-vb', stor ? 'stor' : '', ton !== 'vit' ? ton : ''].filter(Boolean).join(' ')
  const inner = (
    <>
      {tagg ? <i className={taggLjus ? 'ljus' : undefined}>{tagg}</i> : null}
      {kod}
    </>
  )
  if (href) {
    return (
      <Link href={href} className={k} aria-label={etikett}>
        {inner}
      </Link>
    )
  }
  return (
    <span className={k} aria-hidden={etikett ? undefined : true} aria-label={etikett} role={etikett ? 'img' : undefined}>
      {inner}
    </span>
  )
}

/* ------------------------------------------------------------------ golvets brickor och märken */

export type BrickTon = 'standard' | 'tyst' | 'tom' | 'slut' | 'int' | 'las'

export interface BrickaProps {
  /** Företagets två första bokstäver. */
  kod?: string
  /** 'standard' (grön ton), 'tyst' (följ upp), 'tom' (Ska sökas, streckad), 'slut' (avslutad, grå), 'int' (intervju i statistiken), 'las' (dold träff). */
  ton?: BrickTon
  /** Storlek på telefon: 44 (grund), 48, 56. */
  mobil?: 44 | 48 | 56
  /** Storlek på dator: 44, 48 (grund), 56, 60. */
  dator?: 44 | 48 | 56 | 60
  /** Kopparring runt brickan (tyst, i väggens kopplingar). */
  ring?: boolean
  /** Innehåll i stället för koden (en ikon). */
  children?: ReactNode
}

/** Brickan: rummets figur. En sökt tjänst är en bricka på väg mot flaggan. */
export function Bricka({ kod, ton = 'standard', mobil = 44, dator = 48, ring, children }: BrickaProps) {
  const k = ['j3-bricka', mobil !== 44 ? `m${mobil}` : '', `d${dator}`, ton !== 'standard' ? ton : '', ring ? 'ring' : '', children ? 'ikon' : ''].filter(Boolean).join(' ')
  return (
    <span className={k} aria-hidden="true">
      {children ?? kod}
    </span>
  )
}

/** Taggarna Ny och Exempel (riktigt gränssnitt). Aldrig "Nytt i flödet". */
export function Tagg({ children, variant = 'ny', liten }: { children: ReactNode; variant?: 'ny' | 'exempel' | 'premium'; liten?: boolean }) {
  const k = ['j3-tagg', variant !== 'ny' ? variant : '', liten ? 'liten' : ''].filter(Boolean).join(' ')
  return <span className={k}>{children}</span>
}

export type Status = 'vantar' | 'folj-upp' | 'intervju' | 'vantar-besked' | 'avslutad' | 'erbjudande'

const STATUS_TEXT: Record<Status, string> = {
  vantar: 'Väntar svar',
  'folj-upp': 'Följ upp',
  intervju: 'Intervju',
  'vantar-besked': 'Väntar besked',
  avslutad: 'Avslutad',
  erbjudande: 'Erbjudande',
}

/** Statuspillret. Avslag och avslutat är grått, aldrig rött. `vit` på tonade rader. */
export function StatusPiller({ status, children, vit }: { status: Status; children?: ReactNode; vit?: boolean }) {
  return <span className={`j3-pill ${status}${vit ? ' vit' : ''}`}>{children ?? STATUS_TEXT[status]}</span>
}

/** Antalet bredvid en grupprubrik ("Följ upp 1"). */
export function Antal({ children, tyst }: { children: ReactNode; tyst?: boolean }) {
  return <span className={tyst ? 'j3-antal tyst' : 'j3-antal'}>{children}</span>
}

/* ------------------------------------------------------------------ datum */

const MANAD = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

/** Datumbrickan "NOV 24". `pa="golv"` på papper. Tar ett Date eller manad+dag. */
export function DatumBricka({ datum, manad, dag, pa = 'vagg' }: { datum?: Date; manad?: string; dag?: number; pa?: 'vagg' | 'golv' }) {
  const m = manad ?? (datum ? MANAD[datum.getMonth()] : '')
  const d = dag ?? (datum ? datum.getDate() : '')
  return (
    <span className={pa === 'golv' ? 'j3-datum golv' : 'j3-datum'} aria-hidden="true">
      <span>{m}</span>
      <span>{d}</span>
    </span>
  )
}

/** Datumbrickan med intervjutiden och "Ändra tid" (tjänstens vägg, och på papper på telefon). */
export function DatumRuta({ bricka, rubrik, rad, pa = 'vagg' }: { bricka: ReactNode; rubrik: ReactNode; rad?: ReactNode; pa?: 'vagg' | 'golv' }) {
  return (
    <div className={pa === 'golv' ? 'j3-datumruta golv' : 'j3-datumruta'}>
      {bricka}
      <span>
        <b>{rubrik}</b>
        {rad ? <span className="rad">{rad}</span> : null}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ betyg */

/**
 * Betyget som fem prickar (1 till 5). 'normal' 12 px på papper, 'vagg' på
 * väggen, 'mini' under frågorna på telefon, 'stor' 40 px (det bedömda svaret).
 */
export function Prickar({ antal, av = 5, variant = 'normal', etikett }: { antal: number; av?: number; variant?: 'normal' | 'vagg' | 'mini' | 'stor' | 'mellan'; etikett?: string }) {
  const k = variant === 'normal' ? 'j3-prickar' : variant === 'mellan' ? 'j3-prickar mellan' : `j3-prickar ${variant}`
  return (
    <span className={k} role={etikett ? 'img' : undefined} aria-label={etikett} aria-hidden={etikett ? undefined : true}>
      {Array.from({ length: av }, (_, i) => (
        <i key={i} data-pa={i < antal ? '' : undefined} />
      ))}
    </span>
  )
}

/** Betyget eller antalet som rutor (frågekorten, intervjuraden, veckorna på väggen). */
export function Rutor({ antal, av = 5, variant = 'golv', etikett }: { antal: number; av?: number; variant?: 'golv' | 'morkt' | 'vagg'; etikett?: string }) {
  const k = variant === 'golv' ? 'j3-rutor' : `j3-rutor ${variant}`
  return (
    <span className={k} role={etikett ? 'img' : undefined} aria-label={etikett} aria-hidden={etikett ? undefined : true}>
      {Array.from({ length: av }, (_, i) => (
        <i key={i} data-pa={i < antal ? '' : undefined} />
      ))}
    </span>
  )
}

/** "Upp från 2 av 5" bredvid det bedömda svaret. */
export function UppMarke({ children }: { children: ReactNode }) {
  return <span className="j3-upp">{children}</span>
}

/* ------------------------------------------------------------------ kompetens */

/** Kompetensbrickan: har (bock) eller saknas (streckad, "SAP saknas i ditt CV"). */
export function Kompetens({ children, saknas }: { children: ReactNode; saknas?: boolean }) {
  if (saknas) return <span className="j3-komp saknas">{children}</span>
  return (
    <span className="j3-komp">
      <IkonBock size={12} bredd={2.6} />
      {children}
    </span>
  )
}

/** Raden med kompetensbrickor. */
export function KompetensRad({ har, saknas }: { har: string[]; saknas?: string[] }) {
  return (
    <span className="j3-komprad">
      {har.map((k) => (
        <Kompetens key={k}>{k}</Kompetens>
      ))}
      {(saknas ?? []).map((k) => (
        <Kompetens key={k} saknas>
          {`${k} saknas i ditt CV`}
        </Kompetens>
      ))}
    </span>
  )
}

/* ------------------------------------------------------------------ matchringen */

const RING = {
  48: { vb: 52, r: 21, sw: 6, font: 15, ty: 31, yta: true, ljus: false },
  52: { vb: 52, r: 21, sw: 6, font: 15, ty: 31, yta: true, ljus: false },
  64: { vb: 64, r: 26, sw: 8, font: 16, ty: 37, yta: false, ljus: true },
  112: { vb: 112, r: 44, sw: 12, font: 30, ty: 66, yta: true, ljus: false },
} as const

/** Matchringen: procent matchgrad mot CV:t, grön båge. 48 och 52 i listor, 64 i korten, 112 i annonsen. */
export function Matchring({ procent, storlek = 52, className }: { procent: number; storlek?: 48 | 52 | 64 | 112; className?: string }) {
  const s = RING[storlek]
  const c = s.vb / 2
  const omkrets = 2 * Math.PI * s.r
  const p = Math.max(0, Math.min(100, Math.round(procent)))
  return (
    <svg className={className ? `j3-ring ${className}` : 'j3-ring'} width={storlek} height={storlek} viewBox={`0 0 ${s.vb} ${s.vb}`} role="img" aria-label={`${p} procent matchgrad`}>
      <circle cx={c} cy={c} r={s.r} className={`spar${s.ljus ? ' ljus' : ''}${s.yta ? ' yta' : ''}`} fill={s.yta ? undefined : 'none'} strokeWidth={s.sw} />
      <circle cx={c} cy={c} r={s.r} className="fyll" fill="none" strokeWidth={s.sw} strokeLinecap="round" strokeDasharray={`${((omkrets * p) / 100).toFixed(1)} ${omkrets.toFixed(1)}`} transform={`rotate(-90 ${c} ${c})`} />
      <text x={c} y={s.ty} textAnchor="middle" fontSize={s.font}>
        {p}
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ fyrstegsbanan */

export type FyrSteg = 1 | 2 | 3 | 4

const FYR_X = [10, 47, 85, 122]
const FYR_NAMN = ['sökt', 'svar', 'intervju', 'erbjudande']

/**
 * Tjänstens lilla bana (132 x 20): sökt, svar, intervju, erbjudande. Det
 * aktuella steget är stort; tyst gör det ihåligt i koppar; avslutad gör hela
 * banan grå (aldrig röd).
 */
export function FyrstegsBana({ steg, tyst, avslutad }: { steg: FyrSteg; tyst?: boolean; avslutad?: boolean }) {
  const fyll = avslutad ? 'var(--j3-slut-ink)' : 'var(--j3-bock)'
  const i = steg - 1
  const etikett = `Steg ${steg} av 4: ${FYR_NAMN[i]}${tyst ? ', tyst' : ''}${avslutad ? ', avslutad' : ''}`
  return (
    <svg className="j3-fyrsteg" width="132" height="20" viewBox="0 0 132 20" role="img" aria-label={etikett}>
      <path d="M10 10h112" style={{ stroke: 'var(--j3-spar)' }} strokeWidth="3" strokeLinecap="round" />
      {i > 0 ? <path d={`M10 10h${FYR_X[i] - 10}`} style={{ stroke: fyll }} strokeWidth="3" strokeLinecap="round" /> : null}
      {FYR_X.map((x, j) => {
        if (j < i) return <circle key={j} cx={x} cy="10" r="6" style={{ fill: fyll }} />
        if (j === i) {
          if (tyst) return <circle key={j} cx={x} cy="10" r="8" style={{ fill: 'var(--j3-papper)', stroke: 'var(--koppar)' }} strokeWidth="3" />
          return <circle key={j} cx={x} cy="10" r="8" style={{ fill: fyll, stroke: 'var(--j3-papper)' }} strokeWidth="2.5" />
        }
        return <circle key={j} cx={x} cy="10" r="5" style={{ fill: 'var(--j3-papper)', stroke: 'var(--j3-prick)' }} strokeWidth="2.5" />
      })}
    </svg>
  )
}
