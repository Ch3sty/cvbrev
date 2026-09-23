/**
 * Prissidans och köpvägens scener (docs/design/spec-prissida-2026-09-22.html,
 * porterade enligt primitives.tsx: konturer i currentColor, fyllning via
 * --illu-fill, accenten via --illu-accent, aldrig hårdkodat vitt, aria-hidden
 * utan titel, focusable false, inga animationer).
 *
 * Sju scener i 240 × 200, hero-scenen i 520 × 400, gratispapperet i 56, tre
 * förtroendeikoner i 40 och elva radikoner i 16. Samma symboler återkommer på
 * prissidan, i spårvalet, i köpsteget och på kontosidan, så köparen känner
 * igen sig hela vägen.
 *
 * Färgen kommer från föräldern: på papper står scenen i text-ink-1, på
 * Allt-kortets ink-yta i text-white, och fyllningarna följer tokens. Inga
 * hooks, ingen 'use client': allt renderas på servern.
 */

import type { ReactNode } from 'react'

/**
 * Samma färgroller som ILLU i primitives.tsx, men skrivna här. primitives.tsx
 * är en klientmodul ('use client'), och ett objekt som importeras därifrån
 * till en serverkomponent blir en klientreferens vars fält är undefined.
 * Då försvinner varje fill och stroke som pekar på det, tyst. Scenerna
 * renderas på servern (heron, funktionskorten, förtroendekorten), så
 * konstanterna måste bo i en modul utan klientgräns.
 */
const ILLU = {
  fill: 'var(--illu-fill, #FFFFFF)',
  accent: 'var(--illu-accent, #D9480F)',
  soft: 'var(--illu-soft, #FBE7D3)',
  muted: 'var(--illu-muted, #C4B9A8)',
  onAccent: 'var(--illu-on-accent, #FFFFFF)',
} as const

export interface ScenProps {
  className?: string
  /** Tillgängligt namn. Utan titel är scenen dekorativ. */
  title?: string
}

interface ScenSvgProps extends ScenProps {
  w: number
  h: number
  children: ReactNode
}

/** Gemensam wrapper för rektangulära scener. Bredden styrs av CSS. */
function Scen({ w, h, className, title, children }: ScenSvgProps) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

const DISPLAY = 'var(--font-display), Inter, system-ui, sans-serif'
const BODY = 'Inter, system-ui, sans-serif'

/* Toner som scenerna lånar av systemet utöver ILLU. */
const INSUNKEN = 'var(--insunken)'
const INK_2 = 'var(--ink-2)'
const INK_3 = 'var(--ink-3)'
const ACCENT_INK = 'var(--accent-ink)'
const INK_HOVER = 'var(--ink-hover)'
const INK_1_MJUK = 'var(--ink-1-mjuk)'

/* ======================================================= scener 240 × 200 */

/** CV med analysmarkeringar och poängring. */
export function IlluScenCv({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="30" y="18" width="130" height="170" rx="12" fill={ILLU.fill} />
        <path d="M54 50h60M54 70h82M54 90h70M54 120h82M54 140h56M54 160h74" />
        <circle cx="180" cy="60" r="34" fill={ILLU.fill} />
      </g>
      <path d="M180 26a34 34 0 1 1-24 10" stroke={ILLU.accent} strokeWidth={6} />
      <text
        x="180"
        y="67"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight={700}
        fontSize={24}
        fill="currentColor"
      >
        74
      </text>
      <rect x="48" y="84" width="82" height="12" rx="3" fill={ILLU.soft} />
      <rect x="48" y="134" width="70" height="12" rx="3" fill={ILLU.soft} />
      <g transform="translate(150 118)">
        <circle r="12" fill={ILLU.accent} />
        <path d="M-4 0l3 3 6-6" stroke={ILLU.onAccent} strokeWidth={2.5} />
      </g>
      <g transform="translate(150 166)">
        <circle r="12" fill="currentColor" />
        <path d="M-4 0h8" stroke={ILLU.fill} strokeWidth={2.5} />
      </g>
    </Scen>
  )
}

/** Matrislogik 3 × 3 med saknad ruta och klocka. */
export function IlluScenMatris({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="26" y="26" width="150" height="150" rx="12" fill={ILLU.fill} />
        <path d="M76 26v150M126 26v150M26 76h150M26 126h150" />
        <circle cx="51" cy="51" r="12" />
        <rect x="89" y="39" width="24" height="24" rx="4" />
        <path d="M151 39l12 24h-24z" />
        <rect x="39" y="89" width="24" height="24" rx="4" />
        <path d="M101 89l12 24h-24z" />
        <circle cx="151" cy="101" r="12" />
        <path d="M51 139l12 24h-24z" />
        <circle cx="101" cy="151" r="12" />
      </g>
      <rect x="132" y="132" width="38" height="38" rx="6" fill={ILLU.soft} />
      <text
        x="151"
        y="160"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight={700}
        fontSize={26}
        fill={ILLU.accent}
      >
        ?
      </text>
      <g stroke="currentColor" strokeWidth={4}>
        <circle cx="204" cy="62" r="24" fill={ILLU.fill} />
        <path d="M204 46v16l10 6M198 34h12" />
      </g>
      <path d="M204 38a24 24 0 0 1 24 24" stroke={ILLU.accent} strokeWidth={5} />
    </Scen>
  )
}

/** Annonsen blir ett personligt brev. */
export function IlluScenBrev({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="16" y="40" width="84" height="110" rx="10" fill={ILLU.fill} />
        <path d="M30 62h56M30 78h40M30 94h56M30 110h48M30 126h30" />
        <path d="M112 95h26" stroke={ILLU.accent} strokeWidth={5} />
        <path d="M132 87l8 8-8 8" stroke={ILLU.accent} strokeWidth={5} />
        <rect
          x="150"
          y="22"
          width="74"
          height="150"
          rx="10"
          fill={ILLU.fill}
          transform="rotate(4 187 97)"
        />
      </g>
      <g transform="rotate(4 187 97)" stroke="currentColor" strokeWidth={4}>
        <path d="M164 44h44M164 60h46M164 76h34M164 100h46M164 116h46M164 132h28" />
      </g>
      <g transform="rotate(4 187 97)">
        <rect x="162" y="148" width="26" height="8" rx="3" fill={ILLU.accent} />
      </g>
      <text
        x="58"
        y="30"
        textAnchor="middle"
        fontFamily={BODY}
        fontWeight={600}
        fontSize={11}
        fill={INK_3}
        letterSpacing={1}
      >
        ANNONSEN
      </text>
      <text
        x="187"
        y="192"
        textAnchor="middle"
        fontFamily={BODY}
        fontWeight={600}
        fontSize={11}
        fill={INK_3}
        letterSpacing={1}
      >
        DITT BREV
      </text>
    </Scen>
  )
}

/** Tre jobbträffar med matchningsgrad. */
export function IlluScenMatch({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="20" y="22" width="200" height="44" rx="10" fill={ILLU.fill} />
        <rect x="20" y="78" width="200" height="44" rx="10" fill={ILLU.fill} />
        <rect x="20" y="134" width="200" height="44" rx="10" fill={ILLU.fill} />
        <path d="M40 44h70M40 100h86M40 156h60" />
      </g>
      <rect x="150" y="34" width="56" height="20" rx="10" fill="currentColor" />
      <text
        x="178"
        y="48"
        textAnchor="middle"
        fontFamily={BODY}
        fontWeight={600}
        fontSize={11}
        fill={ILLU.fill}
      >
        92 %
      </text>
      <rect x="150" y="90" width="56" height="20" rx="10" fill={ILLU.soft} />
      <text
        x="178"
        y="104"
        textAnchor="middle"
        fontFamily={BODY}
        fontWeight={600}
        fontSize={11}
        fill={ACCENT_INK}
      >
        88 %
      </text>
      <rect x="150" y="146" width="56" height="20" rx="10" fill={INSUNKEN} />
      <text
        x="178"
        y="160"
        textAnchor="middle"
        fontFamily={BODY}
        fontWeight={600}
        fontSize={11}
        fill={INK_2}
      >
        81 %
      </text>
      <circle cx="120" cy="44" r="5" fill={ILLU.accent} />
    </Scen>
  )
}

/** Jobbcoachen: två pratbubblor. */
export function IlluScenCoach({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <path
          d="M24 40a12 12 0 0 1 12-12h110a12 12 0 0 1 12 12v44a12 12 0 0 1-12 12H70l-24 22V96H36a12 12 0 0 1-12-12z"
          fill={ILLU.fill}
        />
        <path d="M46 52h72M46 70h50" />
        <path
          d="M216 110a12 12 0 0 0-12-12H94a12 12 0 0 0-12 12v44a12 12 0 0 0 12 12h80l24 22v-22h6a12 12 0 0 0 12-12z"
          fill="currentColor"
        />
      </g>
      <path d="M104 122h80M104 140h56" stroke={ILLU.fill} strokeWidth={4} />
      <circle cx="196" cy="140" r="5" fill={ILLU.accent} />
    </Scen>
  )
}

/**
 * Allt: tre papper på tråden. Ritad för ink-ytan: konturerna tar
 * currentColor (vit på Allt-kortet) och papperen fylls i ink-hover.
 */
export function IlluScenAllt({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <path d="M20 150h200" stroke={ILLU.accent} strokeWidth={4} />
      <g stroke="currentColor" strokeWidth={4}>
        <rect
          x="28"
          y="34"
          width="72"
          height="96"
          rx="10"
          fill={INK_HOVER}
          transform="rotate(-5 64 82)"
        />
        <rect x="84" y="24" width="72" height="106" rx="10" fill={INK_HOVER} />
        <rect
          x="140"
          y="34"
          width="72"
          height="96"
          rx="10"
          fill={INK_HOVER}
          transform="rotate(5 176 82)"
        />
        <path d="M100 48h40M100 64h40M100 80h24" />
        <path d="M45 56h36M45 72h24" transform="rotate(-5 64 82)" />
        <path d="M157 56h36M157 72h24" transform="rotate(5 176 82)" />
      </g>
      <circle cx="64" cy="150" r="8" fill="currentColor" />
      <circle cx="120" cy="150" r="8" fill="currentColor" />
      <circle cx="176" cy="150" r="8" fill="currentColor" />
      <circle cx="120" cy="150" r="4" fill={ILLU.accent} />
      <text
        x="120"
        y="184"
        textAnchor="middle"
        fontFamily={BODY}
        fontWeight={600}
        fontSize={11}
        fill={INK_1_MJUK}
        letterSpacing={1}
      >
        CV · TESTER · JOBB
      </text>
    </Scen>
  )
}

/**
 * Räkna ut: en räknare med resultatet i orange i displayen och ett kvitto
 * lutat 6 grader bakom, där uträkningen står i rader. Hubben och de nio
 * kalkylatorerna.
 */
export function IlluScenKalkylator({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g transform="rotate(6 182 96)" stroke="currentColor" strokeWidth={4}>
        <rect x="146" y="30" width="72" height="124" rx="10" fill={ILLU.fill} />
        <path d="M162 56h40M162 74h28M162 92h40M162 110h20M162 134h40" />
      </g>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="34" y="18" width="128" height="166" rx="14" fill={ILLU.fill} />
        <rect x="50" y="34" width="96" height="42" rx="6" fill={INSUNKEN} />
        <rect x="50" y="90" width="26" height="22" rx="5" />
        <rect x="85" y="90" width="26" height="22" rx="5" />
        <rect x="120" y="90" width="26" height="22" rx="5" />
        <rect x="50" y="120" width="26" height="22" rx="5" />
        <rect x="85" y="120" width="26" height="22" rx="5" />
        <rect x="120" y="120" width="26" height="22" rx="5" />
        <rect x="50" y="150" width="26" height="22" rx="5" />
        <rect x="85" y="150" width="26" height="22" rx="5" />
        <rect x="120" y="150" width="26" height="22" rx="5" fill="currentColor" />
      </g>
      <path d="M127 158h12M127 164h12" stroke={ILLU.fill} strokeWidth={3} />
      <text
        x="138"
        y="64"
        textAnchor="end"
        fontFamily={DISPLAY}
        fontWeight={800}
        fontSize={22}
        fill={ILLU.accent}
      >
        26 912
      </text>
    </Scen>
  )
}

/* ========================================================= hero 520 × 400 */

/** Veckan på skrivbordet: CV med poäng, personligt brev, matris och tråden. */
export function IlluScenHero({ className, title }: ScenProps) {
  const bock = (cx: number) => (
    <g key={cx}>
      <circle cx={cx} cy="330" r="12" fill="currentColor" />
      <path
        d={`M${cx - 5} 330l4 4 7-7`}
        stroke={ILLU.fill}
        strokeWidth={3}
      />
    </g>
  )
  return (
    <Scen w={520} h={400} className={className} title={title}>
      <rect width="520" height="400" rx="20" fill={INSUNKEN} />
      <path d="M40 330h440" stroke={ILLU.accent} strokeWidth={5} />
      <g stroke="currentColor" strokeWidth={4}>
        <rect
          x="52"
          y="60"
          width="170"
          height="220"
          rx="14"
          fill={ILLU.fill}
          transform="rotate(-4 137 170)"
        />
        <rect x="230" y="40" width="200" height="250" rx="14" fill={ILLU.fill} />
        <rect
          x="330"
          y="150"
          width="150"
          height="150"
          rx="14"
          fill={ILLU.fill}
          transform="rotate(6 405 225)"
        />
      </g>
      <g transform="rotate(-4 137 170)" stroke="currentColor" strokeWidth={4}>
        <path d="M76 96h100M76 118h120M76 140h90M76 176h120M76 198h80" />
      </g>
      <g transform="rotate(-4 137 170)">
        <rect x="72" y="132" width="98" height="14" rx="3" fill={ILLU.soft} />
      </g>
      <g stroke="currentColor" strokeWidth={4}>
        <path d="M256 76h120M256 100h150M256 124h100M256 160h150M256 184h110M256 208h150M256 232h70" />
      </g>
      <g transform="translate(330 150) rotate(6 75 75)" stroke="currentColor" strokeWidth={4}>
        <path d="M50 20v110M100 20v110M20 60h110M20 100h110" />
        <circle cx="35" cy="40" r="8" />
        <rect x="66" y="32" width="18" height="18" rx="3" />
        <path d="M115 30l9 20h-18z" />
        <rect x="26" y="70" width="18" height="18" rx="3" />
        <path d="M75 68l9 20h-18z" />
        <circle cx="115" cy="80" r="8" />
        <path d="M35 108l9 20h-18z" />
        <circle cx="75" cy="118" r="8" />
      </g>
      <g transform="translate(330 150) rotate(6 75 75)">
        <rect x="102" y="104" width="26" height="26" rx="4" fill={ILLU.soft} />
        <text
          x="115"
          y="123"
          textAnchor="middle"
          fontFamily={DISPLAY}
          fontWeight={700}
          fontSize={18}
          fill={ILLU.accent}
        >
          ?
        </text>
      </g>
      {[80, 150, 220].map(bock)}
      <circle cx="290" cy="330" r="14" fill={ILLU.fill} stroke="currentColor" strokeWidth={4} />
      <circle cx="290" cy="330" r="6" fill={ILLU.accent} />
      <circle cx="360" cy="330" r="12" fill={ILLU.fill} stroke={ILLU.muted} strokeWidth={4} />
      <circle cx="420" cy="330" r="12" fill={ILLU.fill} stroke={ILLU.muted} strokeWidth={4} />
      <circle cx="480" cy="330" r="12" fill={ILLU.fill} stroke={ILLU.muted} strokeWidth={4} />
      <text x="80" y="366" textAnchor="middle" fontFamily={BODY} fontSize={12} fontWeight={500} fill={INK_3}>
        Dag 1
      </text>
      <text x="290" y="366" textAnchor="middle" fontFamily={BODY} fontSize={12} fontWeight={600} fill="currentColor">
        Dag 4
      </text>
      <text x="480" y="366" textAnchor="middle" fontFamily={BODY} fontSize={12} fontWeight={500} fill={INK_3}>
        Dag 7
      </text>
      <rect x="250" y="252" width="90" height="26" rx="13" fill="currentColor" />
      <text x="295" y="270" textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={12} fill={ILLU.fill}>
        Poäng 74
      </text>
    </Scen>
  )
}

/* ================================================================ 56 */

/** Gratis: ett litet papper med en accentpunkt. */
export function IlluScenGratis({ className, title }: ScenProps) {
  return (
    <Scen w={56} h={56} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={2}>
        <rect x="12" y="6" width="32" height="44" rx="5" fill={ILLU.fill} />
        <path d="M20 18h16M20 26h16M20 34h10" />
      </g>
      <circle cx="40" cy="42" r="6" fill={ILLU.accent} />
    </Scen>
  )
}

/* ============================================== förtroendeikoner, 40 */

interface Ikon40Props extends ScenProps {
  children: ReactNode
}

function Ikon40({ className, title, children }: Ikon40Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={40}
      height={40}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

/** Hänglås med accentpunkt: kortbetalning via Stripe. */
export function IkonPrisLas(props: ScenProps) {
  return (
    <Ikon40 {...props}>
      <rect x="8" y="17" width="24" height="17" rx="4" />
      <path d="M13 17v-4a7 7 0 0 1 14 0v4" />
      <circle cx="20" cy="26" r="2" fill={ILLU.accent} stroke="none" />
    </Ikon40>
  )
}

/** Pekare: säg upp med ett klick. */
export function IkonPrisKlick(props: ScenProps) {
  return (
    <Ikon40 {...props}>
      <path d="M11 8l18 9-8 3-3 8z" />
      <path d="M21 20l8 8" />
    </Ikon40>
  )
}

/** Kronor i en ring: priser i kronor, moms ingår. */
export function IkonPrisKr(props: ScenProps) {
  return (
    <Ikon40 {...props}>
      <circle cx="20" cy="20" r="14" />
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight={700}
        fontSize={14}
        fill="currentColor"
        stroke="none"
      >
        kr
      </text>
    </Ikon40>
  )
}

/* ================================================== radikoner, 16 */

export type RadIkonNamn =
  | 'mall'
  | 'analys'
  | 'brev'
  | 'linkedin'
  | 'matris'
  | 'timer'
  | 'forkl'
  | 'kurva'
  | 'match'
  | 'chat'
  | 'oga'

const RAD_IKONER: Record<RadIkonNamn, ReactNode> = {
  mall: (
    <>
      <rect x="2.5" y="2" width="11" height="12" rx="2" />
      <path d="M5 6h6M5 9h6M5 12h3" />
    </>
  ),
  analys: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14M5 7h4" />
    </>
  ),
  brev: (
    <>
      <rect x="2" y="4" width="12" height="9" rx="2" />
      <path d="M2 6l6 4 6-4" />
    </>
  ),
  linkedin: (
    <>
      <circle cx="8" cy="5.5" r="3" />
      <path d="M3 14a5 5 0 0 1 10 0" />
    </>
  ),
  matris: (
    <>
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <path d="M6 2v12M10 2v12M2 6h12M2 10h12" />
    </>
  ),
  timer: (
    <>
      <circle cx="8" cy="9" r="5.5" />
      <path d="M8 6v3l2 1.5M6 2h4" />
    </>
  ),
  forkl: (
    <>
      <path d="M8 2a5 5 0 0 1 3 9v2H5v-2a5 5 0 0 1 3-9z" />
      <path d="M6.5 15h3" />
    </>
  ),
  kurva: <path d="M2 13l4-5 3 3 5-7" />,
  match: (
    <>
      <rect x="2" y="3" width="12" height="4" rx="1.5" />
      <rect x="2" y="9" width="12" height="4" rx="1.5" />
    </>
  ),
  chat: (
    <path d="M3 3h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-3 3v-3H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
  ),
  oga: (
    <>
      <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
      <circle cx="8" cy="8" r="2" />
    </>
  ),
}

/** Liten ikon i "Så här fungerar det"-listorna, 16 px i currentColor. */
export function RadIkon({ namn, className }: { namn: RadIkonNamn; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {RAD_IKONER[namn]}
    </svg>
  )
}

/* ============================================ linjens scener, 240 × 200
 * docs/design/analys-visuell-linje-2026-09-22.html, "Nya illustrationer som
 * behövs", och analys-artiklar-2026-09-23.html. Samma språk som scenerna
 * ovan: konturer i currentColor (stroke 4), papper i --illu-fill, en
 * accentyta högst en tiondel av motivet, ett rörligt element lutat 4 till 8
 * grader, inga bakgrundscirklar, aldrig hex, aldrig gradient.
 */

/** Uppföljning: en hög ansökningar i en låda, ett brev lyfter ur högen lutat 6 grader. */
export function IlluScenUppfoljning({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="52" y="96" width="136" height="36" rx="8" fill={ILLU.fill} />
        <rect x="46" y="110" width="148" height="36" rx="8" fill={ILLU.fill} />
        <path d="M30 124v44a10 10 0 0 0 10 10h160a10 10 0 0 0 10-10v-44" fill={ILLU.fill} />
        <path d="M30 124h52a8 8 0 0 1 8 8v4a8 8 0 0 0 8 8h44a8 8 0 0 0 8-8v-4a8 8 0 0 1 8-8h52" />
      </g>
      <g transform="rotate(6 120 60)" stroke="currentColor" strokeWidth={4}>
        <rect x="70" y="22" width="100" height="72" rx="10" fill={ILLU.fill} />
        <path d="M70 32l50 34 50-34" />
      </g>
      <g transform="rotate(6 120 60)">
        <circle cx="166" cy="26" r="10" fill={ILLU.accent} />
      </g>
    </Scen>
  )
}

/** CV-mallar: tre CV-ark i solfjäder, det främsta med textrader och ett accentstreck vid rubriken. */
export function IlluScenMallar({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="40" y="36" width="96" height="128" rx="10" fill={ILLU.fill} transform="rotate(-8 88 100)" />
        <rect x="104" y="36" width="96" height="128" rx="10" fill={ILLU.fill} transform="rotate(8 152 100)" />
        <rect x="72" y="26" width="96" height="140" rx="10" fill={ILLU.fill} />
        <circle cx="96" cy="54" r="10" fill={ILLU.fill} />
        <path d="M114 50h36M114 62h24M88 104h60M88 118h60M88 132h44M88 146h56" />
      </g>
      <rect x="86" y="80" width="40" height="8" rx="3" fill={ILLU.accent} />
    </Scen>
  )
}

/** Biblioteket: tre ark i solfjäder med textrader på det främsta, accentstreck vid en rad. */
export function IlluScenBibliotek({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="36" y="44" width="104" height="132" rx="10" fill={ILLU.fill} transform="rotate(-6 88 110)" />
        <rect x="100" y="44" width="104" height="132" rx="10" fill={ILLU.fill} transform="rotate(6 152 110)" />
        <rect x="68" y="24" width="104" height="148" rx="10" fill={ILLU.fill} />
        <path d="M86 50h68M86 66h52M86 92h68M86 106h68M86 120h48M86 134h68M86 148h40" />
      </g>
      <rect x="82" y="100" width="76" height="12" rx="3" fill={ILLU.soft} />
      <rect x="82" y="100" width="8" height="12" rx="2" fill={ILLU.accent} />
    </Scen>
  )
}

/** LinkedIn-profilen: en profilsida med foto till vänster och ett förstoringsglas över rubrikraden. */
export function IlluScenLinkedin({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="24" y="30" width="176" height="140" rx="12" fill={ILLU.fill} />
        <circle cx="62" cy="74" r="20" fill={ILLU.fill} />
        <path d="M96 64h72M96 84h48M44 118h136M44 136h116M44 154h80" />
      </g>
      <rect x="92" y="58" width="42" height="12" rx="3" fill={ILLU.accent} />
      <g transform="rotate(-6 150 78)" stroke="currentColor" strokeWidth={4}>
        <circle cx="140" cy="68" r="28" fill="none" />
        <path d="M160 88l26 26" strokeWidth={6} />
      </g>
    </Scen>
  )
}

/** Bli upptäckt: ett anonymt kort med maskade rader och ett öga som öppnas. */
export function IlluScenUpptackt({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="30" y="36" width="140" height="132" rx="12" fill={ILLU.fill} />
        <circle cx="64" cy="72" r="16" fill={ILLU.fill} />
        <path d="M92 66h56M92 80h36" />
      </g>
      <rect x="48" y="104" width="104" height="12" rx="4" fill={INSUNKEN} />
      <rect x="48" y="126" width="88" height="12" rx="4" fill={INSUNKEN} />
      <rect x="48" y="148" width="64" height="8" rx="3" fill={INSUNKEN} />
      <g transform="rotate(-6 188 70)" stroke="currentColor" strokeWidth={4}>
        <path d="M152 70s14-24 36-24 36 24 36 24-14 24-36 24-36-24-36-24z" fill={ILLU.fill} />
      </g>
      <g transform="rotate(-6 188 70)">
        <circle cx="188" cy="70" r="9" fill={ILLU.accent} />
      </g>
    </Scen>
  )
}

/** Skapa CV: ett ark där tre rader skrivs in, en penna lutad 8 grader. */
export function IlluScenSkapaCv({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="40" y="20" width="120" height="164" rx="12" fill={ILLU.fill} />
        <path d="M60 48h60M60 66h80M60 84h46" />
      </g>
      <path d="M60 118h80M60 136h80M60 154h56" stroke={ILLU.muted} strokeWidth={4} strokeDasharray="2 10" />
      <g transform="rotate(8 176 110)" stroke="currentColor" strokeWidth={4}>
        <path d="M168 40h20v104l-10 18-10-18z" fill={ILLU.fill} />
        <path d="M168 62h20" />
      </g>
      <g transform="rotate(8 176 110)">
        <path d="M172 154l6 10 6-10z" fill={ILLU.accent} />
      </g>
    </Scen>
  )
}

/** Om oss: skrivbordet från cvbrev till Jobbcoach. Ett brev till vänster, CV och matris samlade till höger. */
export function IlluScenSkrivbordet({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="16" y="60" width="70" height="92" rx="10" fill={ILLU.fill} transform="rotate(-6 51 106)" />
        <path d="M30 84h40M30 98h32M30 112h40M30 126h24" transform="rotate(-6 51 106)" />
        <rect x="112" y="28" width="80" height="108" rx="10" fill={ILLU.fill} />
        <path d="M126 50h52M126 64h40M126 90h52M126 104h52M126 118h32" />
        <rect x="150" y="104" width="74" height="74" rx="10" fill={ILLU.fill} transform="rotate(6 187 141)" />
        <path d="M175 108v66M199 108v66M152 130h70M152 154h70" transform="rotate(6 187 141)" />
      </g>
      <path d="M92 100h14" stroke="currentColor" strokeWidth={4} strokeDasharray="2 8" />
      <g transform="rotate(6 187 141)">
        <rect x="203" y="158" width="16" height="16" rx="3" fill={ILLU.accent} />
      </g>
      <text x="51" y="176" textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={11} fill={INK_3} letterSpacing={1}>
        CVBREV
      </text>
    </Scen>
  )
}

/** Intervjun: två stolar mot varandra och ett ark mellan dem. */
export function IlluScenIntervju({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <path d="M40 60v70h44M40 130v44M84 130v44M40 100h44v30" />
        <path d="M200 60v70h-44M200 130v44M156 130v44M200 100h-44v30" />
        <rect x="100" y="86" width="40" height="52" rx="6" fill={ILLU.fill} transform="rotate(-6 120 112)" />
      </g>
      <g transform="rotate(-6 120 112)">
        <rect x="108" y="98" width="24" height="6" rx="2" fill={ILLU.accent} />
      </g>
    </Scen>
  )
}

/* ========================================================= hero 520 × 400 */

/**
 * Sållet: ett CV går in i ett såll av tre streckade spalter och kommer ut på
 * andra sidan med en accentbock. Startsidans hero.
 */
export function IlluScenSallet({ className, title }: ScenProps) {
  return (
    <Scen w={520} h={400} className={className} title={title}>
      <rect width="520" height="400" rx="20" fill={INSUNKEN} />
      <g transform="rotate(-6 110 190)" stroke="currentColor" strokeWidth={5}>
        <rect x="46" y="100" width="128" height="176" rx="14" fill={ILLU.fill} />
        <circle cx="78" cy="136" r="14" fill={ILLU.fill} />
        <path d="M102 130h52M102 146h36M66 180h92M66 200h92M66 220h70M66 240h86" />
      </g>
      <g stroke="currentColor" strokeWidth={5} strokeDasharray="4 14">
        <path d="M226 76v240M262 76v240M298 76v240" />
      </g>
      <rect x="206" y="60" width="112" height="272" rx="14" stroke={ILLU.muted} strokeWidth={4} />
      <text x="262" y="44" textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={13} fill={INK_3} letterSpacing={1.5}>
        REKRYTERINGSSYSTEMET
      </text>
      <g stroke="currentColor" strokeWidth={5}>
        <rect x="348" y="96" width="128" height="176" rx="14" fill={ILLU.fill} />
        <circle cx="380" cy="132" r="14" fill={ILLU.fill} />
        <path d="M404 126h52M404 142h36M368 176h92M368 196h92M368 216h70M368 236h86" />
      </g>
      <g transform="translate(466 104)">
        <circle r="24" fill={ILLU.accent} />
        <path d="M-10 0l7 7 13-14" stroke={ILLU.onAccent} strokeWidth={5} />
      </g>
      <text x="110" y="316" textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={13} fill={INK_3} letterSpacing={1.5}>
        DITT CV
      </text>
      <text x="412" y="316" textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={13} fill={INK_3} letterSpacing={1.5}>
        TILL REKRYTERAREN
      </text>
    </Scen>
  )
}
