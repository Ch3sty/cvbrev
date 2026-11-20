'use client'

/**
 * Rummens symbolbibliotek (spec-rummen-2026-10-10 avsnitt 4.5).
 *
 * Koordinaterna är tagna ordagrant ur konceptets <defs>
 * (docs/design/koncept-testvy-2026-10-10.html, symbolerna s-*, i-*, m-*
 * och gradienterna g-*). Konturer i currentColor, kopparytan i ILLU.accent
 * (som i inloggat pekar på --koppar), unika gradient-id via useIlluId.
 * Ingen symbol får en bakgrundscirkel.
 *
 * Storlekar: 24 (dörrar och ikoner, stroke 1,75), 48 (testtyperna, stroke
 * 2), 96 (tomt tillstånd), 120 (märkena, bas med graverad kant).
 *
 * Dörrarna och ikonerna har en ifylld form i currentColor, som i konceptet
 * (dörren i Rekryteringstester, punkten i Jobbsöket). Kopparn hör till
 * testtypernas symboler och märkena.
 */

import { ILLU, IlluSvg, useIlluId, type IlluProps } from './primitives'

const K = ILLU.accent

/* ------------------------------------------------------------ 24 px */

export interface IkonProps24 {
  className?: string
  size?: number
  title?: string
  /** Tjockare kontur för aktivt läge. Standard 1,75. */
  strokeWidth?: number
}

function Ikon24({ size = 24, className, title, strokeWidth, children }: IkonProps24 & { children: React.ReactNode }) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={strokeWidth ?? ILLU.stroke[24]}>
        {children}
      </g>
    </IlluSvg>
  )
}

/** Dörren till Rekryteringstester, "Tester" på mobil (#i-tran). */
export function DorrTran(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" opacity=".55" />
      <path d="M15.4 15.4h4.1v4.1h-4.1z" fill="currentColor" stroke="none" opacity=".9" />
    </Ikon24>
  )
}

/** Dörren till CV (#i-cv). */
export function DorrCv(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <rect x="4.5" y="3" width="15" height="18" rx="2.5" />
      <circle cx="9" cy="8.5" r="1.8" />
      <path d="M12.5 7.5h4M12.5 10h3M7.5 14h9M7.5 17h6" />
    </Ikon24>
  )
}

/** Dörren till Personliga brev (#i-brev). */
export function DorrBrev(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <rect x="4.5" y="3" width="15" height="18" rx="2.5" />
      <path d="M8 8h8M8 11.5h8M8 15h5" />
      <path d="M13.5 19.5c1.2-2.4 3-3.4 5.5-3.2" strokeWidth="2" />
    </Ikon24>
  )
}

/** Dörren till Jobbsöket (#i-jobb). */
export function DorrJobb(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M4 18c3-1 4-5 7-6s5 2 8-1" />
      <circle cx="4.5" cy="18" r="2" fill="currentColor" stroke="none" />
      <circle cx="11.5" cy="12" r="2" />
      <circle cx="19" cy="10.5" r="2.4" />
      <path d="M19 13v4.5" />
    </Ikon24>
  )
}

/** Profilen (#i-profil). */
export function DorrProfil(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" />
    </Ikon24>
  )
}

/** Stäng (#i-x). */
export function IkonX(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Ikon24>
  )
}

/** Chevron åt höger (#i-chev). */
export function IkonChev(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M9 6l6 6-6 6" />
    </Ikon24>
  )
}

/** Pil åt höger (#i-pil). */
export function IkonPil(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Ikon24>
  )
}

/** Lås (#i-las). */
export function IkonLas(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </Ikon24>
  )
}

/** Kalender (#i-kalender). */
export function IkonKalender(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Ikon24>
  )
}

/** Bock (#i-check). */
export function IkonCheck(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Ikon24>
  )
}

/** Information (#i-info). */
export function IkonInfo(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.5" />
    </Ikon24>
  )
}

/** Frågetecken i ring (skissen Provbladet, #i-fraga): hjälpraden. */
export function IkonFraga(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 .8-1 1.6" />
      <path d="M12 16.5v.3" />
    </Ikon24>
  )
}

/** Tillbaka, pil åt vänster (#i-tillbaka). */
export function IkonTillbaka(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Ikon24>
  )
}

/*
 * Sessionsramens tre (plan-testflode-2026-11-20 avsnitt 7.4): krysset på
 * fel svar, klockan i startskärmens regel om omfånget och flaggan i regeln
 * om vad som sparas. Samma familj som övriga, stroke 1,75.
 */

/** Kryss för fel svar (bricka och Förklaringen). Mindre än IkonX, som stänger. */
export function IkonKryss(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M7.5 7.5l9 9M16.5 7.5l-9 9" />
    </Ikon24>
  )
}

/** Klockan: provets tid och omfånget. */
export function IkonKlocka(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9.5V13l2.5 1.75M9.5 3.5h5" />
    </Ikon24>
  )
}

/** Flaggan: det som räknas och sparas. */
export function IkonFlagga(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M6 21V4" />
      <path d="M6 4.5h10.5l-2 3.75 2 3.75H6" />
    </Ikon24>
  )
}

/** Penna (#i-penna). */
export function IkonPenna(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M4 20l4-1 11-11-3-3L5 16z" />
      <path d="M13 8l3 3" />
    </Ikon24>
  )
}

/*
 * Utseendets tre lägen (skiss-installningar-2026-10-12, #i-enhet, #i-sol,
 * #i-mane): segmentet i avatarmenyn. Samma stil som dörrarna, stroke 1,75,
 * en ifylld yta i currentColor på enheten.
 */

/** Följer systemet: skärmen med foten, ena hörnet fyllt (#i-enhet). */
export function IkonEnhet(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <rect x="3" y="4.5" width="18" height="12.5" rx="2.5" />
      <path d="M3 11h9V4.5" opacity=".55" />
      <path d="M12 17v3M8.5 20.5h7" />
      <path d="M3 11h9v6H5.5A2.5 2.5 0 0 1 3 14.5z" fill="currentColor" stroke="none" opacity=".35" />
    </Ikon24>
  )
}

/** Ljust: solen (#i-sol). */
export function IkonSol(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" />
    </Ikon24>
  )
}

/** Mörkt: månen (#i-mane). */
export function IkonMane(p: IkonProps24) {
  return (
    <Ikon24 {...p}>
      <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />
    </Ikon24>
  )
}

/* ------------------------------------------------------------ 48 px */

// Testtypernas sex symboler (matris, figurer, deduktiv, siffror, ord, person)
// bor i TestGlyfer.tsx utan 'use client', bredvid de tre nya, så att publika
// serverkomponenter kan rita dem (TestBredd, beslut om säljytorna 2026-11-15).
export { SymDeduktiv, SymFigurer, SymMatris, SymOrd, SymPerson, SymSiffror } from './TestGlyfer'

/** Vet inte (#s-vetinte): streckad ruta med frågetecken, punkten i koppar. */
export function SymVetInte(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <rect x="7" y="7" width="34" height="34" rx="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
      <path d="M19 20a5 5 0 1 1 7 4.6c-1.4.7-2 1.6-2 3.4" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <circle cx="24" cy="33" r="1.8" fill={K} />
    </IlluSvg>
  )
}

/* ------------------------------------------------------------ 96 px */

/** Planen utan punkter (#s-plan), tomt tillstånd i Träningen. */
export function SymPlan(p: IlluProps) {
  return (
    <IlluSvg box={96} {...p}>
      <path d="M12 70h72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".5" />
      <circle cx="18" cy="70" r="6" fill={K} />
      <circle cx="34" cy="70" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="48" cy="70" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="62" cy="70" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M80 56v28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 62C30 50 40 44 62 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 5" strokeLinecap="round" opacity=".6" />
    </IlluSvg>
  )
}

/* ------------------------------------------------------------ 120 px, märken */

/**
 * Märkenas bas (#m-bas): graverad kopparplatta med ljuskant och skuggkant.
 * Gradienterna #g-marke och #g-marke-kant får egna id per instans.
 */
function MarkeBas({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-marke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0A061" />
          <stop offset=".5" stopColor="#D9702A" />
          <stop offset="1" stopColor="#9E4515" />
        </linearGradient>
        <linearGradient id={`${id}-kant`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FFD9B8" />
          <stop offset="1" stopColor="#B55A1E" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill={`url(#${id}-marke)`} />
      <circle cx="60" cy="60" r="56" fill="none" stroke={`url(#${id}-kant)`} strokeWidth="1.5" opacity=".8" />
      <circle cx="60" cy="60" r="47" fill="none" stroke="#FFF" strokeOpacity=".28" strokeWidth="1" />
      <circle cx="60" cy="60" r="44" fill="none" stroke="#5A2708" strokeOpacity=".35" strokeWidth="1" />
    </>
  )
}

/** Första mätningen (#m-matning). */
export function MarkeMatning(p: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={120} {...p}>
      <MarkeBas id={id} />
      <path d="M34 60h52" stroke="#3F1A06" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 60h52" stroke="#FFE2C8" strokeOpacity=".7" strokeWidth="1.25" strokeLinecap="round" transform="translate(0 -1.5)" />
      <circle cx="52" cy="60" r="7" fill="#FFF2E6" />
      <circle cx="52" cy="60" r="7" fill="none" stroke="#7A3410" strokeOpacity=".4" />
    </IlluSvg>
  )
}

/** Första veckan (#m-vecka). */
export function MarkeVecka(p: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={120} {...p}>
      <MarkeBas id={id} />
      <g stroke="#FFF2E6" strokeWidth="3" strokeLinecap="round">
        <path d="M60 24v10" />
        <path d="M60 24v10" transform="rotate(51.4 60 60)" />
        <path d="M60 24v10" transform="rotate(102.8 60 60)" />
        <path d="M60 24v10" transform="rotate(154.2 60 60)" />
        <path d="M60 24v10" transform="rotate(205.6 60 60)" />
        <path d="M60 24v10" transform="rotate(257 60 60)" />
        <path d="M60 24v10" transform="rotate(308.4 60 60)" opacity=".4" strokeDasharray="2 3" />
      </g>
      <text x="60" y="68" textAnchor="middle" fontFamily="Schibsted Grotesk,Inter,sans-serif" fontWeight="800" fontSize="26" fill="#FFF2E6">
        7
      </text>
    </IlluSvg>
  )
}

/** Nivån upp (#m-niva). */
export function MarkeNiva(p: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={120} {...p}>
      <MarkeBas id={id} />
      <path d="M36 76h48" stroke="#3F1A06" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 76L54 58l10 8 20-22" fill="none" stroke="#FFF2E6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="84" cy="44" r="5" fill="#FFF2E6" />
    </IlluSvg>
  )
}

/** Generalrepetitionen (#m-general). */
export function MarkeGeneral(p: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={120} {...p}>
      <MarkeBas id={id} />
      <rect x="38" y="36" width="44" height="48" rx="6" fill="none" stroke="#FFF2E6" strokeWidth="3" />
      <path d="M48 50h24M48 60h24M48 70h14" stroke="#FFF2E6" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      <path d="M70 72l4 4 8-9" fill="none" stroke="#FFF2E6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </IlluSvg>
  )
}

/** Provdagen (#m-prov). */
export function MarkeProv(p: IlluProps) {
  const id = useIlluId()
  return (
    <IlluSvg box={120} {...p}>
      <MarkeBas id={id} />
      <path d="M60 30v60" stroke="#3F1A06" strokeOpacity=".45" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 30v60" stroke="#FFF2E6" strokeWidth="2" strokeLinecap="round" transform="translate(-1.5 0)" />
      <path d="M60 32l20 10-20 10z" fill="#FFF2E6" />
    </IlluSvg>
  )
}

/* ------------------------------------------------------------ gradienter */

/**
 * Instrumentens gradienter (#g-koppar-h, #g-yta, #g-lyster) med id-prefix.
 * Renderas inuti Kurva och Nivaskala (våg 3b) som <defs>; id:na blir
 * `${prefix}-koppar-h`, `${prefix}-yta` och `${prefix}-lyster`.
 */
export function Gradienter({ prefix }: { prefix: string }) {
  return (
    <defs>
      <linearGradient id={`${prefix}-koppar-h`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#C4621F" />
        <stop offset="1" stopColor="#F4B98A" />
      </linearGradient>
      <linearGradient id={`${prefix}-yta`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#E07A2F" stopOpacity=".38" />
        <stop offset="1" stopColor="#E07A2F" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${prefix}-lyster`} cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#F4B98A" stopOpacity=".55" />
        <stop offset=".55" stopColor="#E07A2F" stopOpacity=".18" />
        <stop offset="1" stopColor="#E07A2F" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}
