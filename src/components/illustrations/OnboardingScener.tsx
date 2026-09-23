/**
 * Onboardingens scener (docs/design/spec-onboarding-2026-09-22.html),
 * porterade enligt primitives.tsx: konturer i currentColor, fyllning via
 * --illu-fill, accenten via --illu-accent, aldrig hårdkodat vitt,
 * aria-hidden utan titel, focusable false, inga animationer.
 *
 * Två välkomstscener i 380 × 220 (i-valkommen-cv, i-valkommen-test) och åtta
 * brickikoner i 240 × 200 som saknas i PriserScener (profil, upp, mall,
 * linkedin, diag, kurva, person, oga). De fem som redan finns där (cv,
 * matris, brev, match, coach) återanvänds via BRICKA_IKON i KomIgangArk.
 *
 * Samma latenta fälla som PriserScener: primitives.tsx är en klientmodul, så
 * färgrollerna skrivs här i stället för att importeras. Inga hooks, ingen
 * 'use client': scenerna renderas på servern.
 */

import type { ReactNode } from 'react'

const ILLU = {
  fill: 'var(--illu-fill, #FFFFFF)',
  accent: 'var(--illu-accent, #D9480F)',
  soft: 'var(--illu-soft, #FBE7D3)',
  muted: 'var(--illu-muted, #C4B9A8)',
  onAccent: 'var(--illu-on-accent, #FFFFFF)',
} as const

const INSUNKEN = 'var(--insunken)'
const INK_3 = 'var(--ink-3)'
const INK_2 = 'var(--ink-2)'
const ACCENT_INK = 'var(--accent-ink)'
const DISPLAY = 'var(--font-display), Inter, system-ui, sans-serif'
const BODY = 'Inter, system-ui, sans-serif'

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

/* ================================================ välkomstscener 380 × 220 */

/** Två CV och en uppladdningspil på tråden (CV-paketet och Hela paketet). */
export function IlluValkommenCv({ className, title }: ScenProps) {
  return (
    <Scen w={380} h={220} className={className} title={title}>
      <rect width="380" height="220" rx="14" fill={INSUNKEN} />
      <path d="M30 180h320" stroke={ILLU.accent} strokeWidth={4} />
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="60" y="40" width="110" height="140" rx="12" fill={ILLU.fill} transform="rotate(-4 115 110)" />
        <rect x="200" y="30" width="120" height="150" rx="12" fill={ILLU.fill} />
        <path d="M222 60h76M222 84h76M222 108h50M222 140h76" />
      </g>
      <g transform="rotate(-4 115 110)" stroke="currentColor" strokeWidth={4}>
        <path d="M80 70h70M80 92h70M80 114h40" />
      </g>
      <g transform="rotate(-4 115 110)">
        <rect x="78" y="128" width="50" height="10" rx="3" fill={ILLU.soft} />
      </g>
      <circle cx="115" cy="180" r="10" fill="currentColor" />
      <circle cx="260" cy="180" r="12" fill={ILLU.fill} stroke="currentColor" strokeWidth={4} />
      <circle cx="260" cy="180" r="5" fill={ILLU.accent} />
      <g stroke={ILLU.accent} strokeWidth={6}>
        <path d="M330 90V50M316 64l14-14 14 14" />
      </g>
    </Scen>
  )
}

/** Matrislogik och en klocka (Träningspaketet). */
export function IlluValkommenTest({ className, title }: ScenProps) {
  return (
    <Scen w={380} h={220} className={className} title={title}>
      <rect width="380" height="220" rx="14" fill={INSUNKEN} />
      <path d="M30 180h320" stroke={ILLU.accent} strokeWidth={4} />
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="70" y="40" width="120" height="120" rx="12" fill={ILLU.fill} />
        <path d="M110 40v120M150 40v120M70 80h120M70 120h120" />
        <circle cx="90" cy="60" r="8" />
        <rect x="122" y="52" width="16" height="16" rx="3" />
        <path d="M170 52l8 16h-16z" />
        <rect x="82" y="92" width="16" height="16" rx="3" />
        <path d="M130 92l8 16h-16z" />
        <circle cx="170" cy="100" r="8" />
        <path d="M90 132l8 16h-16z" />
        <circle cx="130" cy="140" r="8" />
        <circle cx="270" cy="90" r="40" fill={ILLU.fill} />
        <path d="M270 62v28l18 10M258 42h24" />
      </g>
      <rect x="154" y="124" width="32" height="32" rx="5" fill={ILLU.soft} />
      <text x="170" y="148" textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={22} fill={ILLU.accent}>
        ?
      </text>
      <path d="M270 50a40 40 0 0 1 40 40" stroke={ILLU.accent} strokeWidth={6} />
      <circle cx="130" cy="180" r="12" fill={ILLU.fill} stroke="currentColor" strokeWidth={4} />
      <circle cx="130" cy="180" r="5" fill={ILLU.accent} />
    </Scen>
  )
}

/* ==================================================== brickikoner 240 × 200 */

/** Profilkort med porträtt och en ifylld rad. */
export function IlluBrickaProfil({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="30" y="30" width="180" height="140" rx="14" fill={ILLU.fill} />
        <circle cx="80" cy="90" r="22" />
        <path d="M48 150a32 32 0 0 1 64 0" />
        <path d="M124 70h60M124 92h60M124 114h36" />
      </g>
      <rect x="124" y="132" width="44" height="14" rx="4" fill={ILLU.soft} />
      <circle cx="188" cy="139" r="6" fill={ILLU.accent} />
    </Scen>
  )
}

/** Ett ark på väg upp ur mappen, pilen i accent. */
export function IlluBrickaUpp({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <path d="M50 120v40a12 12 0 0 0 12 12h116a12 12 0 0 0 12-12v-40" />
        <rect x="80" y="28" width="80" height="104" rx="10" fill={ILLU.fill} />
        <path d="M100 60h40M100 78h40M100 96h24" />
      </g>
      <g stroke={ILLU.accent} strokeWidth={6}>
        <path d="M200 66v-40M184 42l16-16 16 16" />
      </g>
      <circle cx="60" cy="150" r="6" fill={ILLU.accent} />
    </Scen>
  )
}

/** Tre mallar i solfjäder. */
export function IlluBrickaMall({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="24" y="30" width="80" height="120" rx="8" fill={ILLU.fill} />
        <rect x="80" y="50" width="80" height="120" rx="8" fill={ILLU.fill} />
        <rect x="136" y="30" width="80" height="120" rx="8" fill={ILLU.fill} />
        <path d="M152 56h48M152 72h32M152 100h48M152 116h48" />
        <path d="M96 76h48M96 92h30M96 120h48" />
        <path d="M40 56h48M40 72h30M40 100h48" />
      </g>
      <rect x="152" y="132" width="24" height="8" rx="3" fill={ILLU.accent} />
      <path d="M176 20l8 8-8 8" stroke="currentColor" strokeWidth={4} transform="translate(30 6)" />
    </Scen>
  )
}

/** Profilsida med sökglas. */
export function IlluBrickaLinkedin({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="30" y="40" width="180" height="120" rx="14" fill={ILLU.fill} />
        <path d="M30 80h180" />
        <circle cx="70" cy="60" r="10" />
        <path d="M96 60h60" />
        <path d="M52 108h136M52 128h96" />
      </g>
      <circle cx="190" cy="60" r="8" fill={ILLU.accent} />
      <g stroke="currentColor" strokeWidth={4}>
        <circle cx="196" cy="150" r="16" fill={ILLU.fill} />
        <path d="M208 162l14 14" />
      </g>
    </Scen>
  )
}

/** Fyra testtyper i en ruta var. */
export function IlluBrickaDiag({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="30" y="30" width="80" height="60" rx="8" fill={ILLU.fill} />
        <rect x="130" y="30" width="80" height="60" rx="8" fill={ILLU.fill} />
        <rect x="30" y="110" width="80" height="60" rx="8" fill={ILLU.fill} />
        <rect x="130" y="110" width="80" height="60" rx="8" fill={ILLU.fill} />
        <path d="M46 46h20v20H46zM76 46h20v20H76z" />
        <path d="M146 50h48M146 62h32M146 74h40" />
        <path d="M46 140l12-8 12 12 18-16" />
        <path d="M146 126h48M146 140h48M146 154h26" />
      </g>
      <text x="70" y="163" textAnchor="middle" fontFamily={BODY} fontSize={10} fontWeight={600} fill={INK_3}>
        NUMERISKT
      </text>
      <text x="70" y="82" textAnchor="middle" fontFamily={BODY} fontSize={10} fontWeight={600} fill={INK_3}>
        MATRIS
      </text>
      <text x="170" y="82" textAnchor="middle" fontFamily={BODY} fontSize={10} fontWeight={600} fill={INK_3}>
        VERBALT
      </text>
      <text x="170" y="163" textAnchor="middle" fontFamily={BODY} fontSize={10} fontWeight={600} fill={INK_3}>
        PERSONLIGHET
      </text>
      <circle cx="200" cy="40" r="8" fill={ILLU.accent} />
    </Scen>
  )
}

/** Kurvan uppåt, sista punkten i accent. */
export function IlluBrickaKurva({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <path d="M30 170h180M30 170V30" />
        <path d="M50 140l40-20 30 10 40-40 40-20" strokeWidth={5} />
      </g>
      <circle cx="200" cy="70" r="8" fill={ILLU.accent} />
      <circle cx="50" cy="140" r="5" fill="currentColor" />
      <circle cx="90" cy="120" r="5" fill="currentColor" />
      <circle cx="120" cy="130" r="5" fill="currentColor" />
      <circle cx="160" cy="90" r="5" fill="currentColor" />
    </Scen>
  )
}

/** Personlighetsprofilen: ringen och tolkningen bredvid. */
export function IlluBrickaPerson({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <circle cx="80" cy="100" r="50" fill={ILLU.fill} />
        <path d="M60 92h40M60 108h28" />
        <rect x="140" y="50" width="80" height="100" rx="10" fill={ILLU.fill} />
        <path d="M156 74h48M156 92h48M156 110h30" />
      </g>
      <path d="M130 100h6" stroke={ILLU.accent} strokeWidth={5} />
      <rect x="156" y="124" width="36" height="10" rx="3" fill={ILLU.soft} />
      <circle cx="204" cy="129" r="5" fill={ILLU.accent} />
    </Scen>
  )
}

/** Bli upptäckt: profilkortet och ögat. */
export function IlluBrickaOga({ className, title }: ScenProps) {
  return (
    <Scen w={240} h={200} className={className} title={title}>
      <g stroke="currentColor" strokeWidth={4}>
        <rect x="40" y="40" width="160" height="120" rx="14" fill={ILLU.fill} />
        <circle cx="90" cy="90" r="22" />
        <path d="M58 140a32 32 0 0 1 64 0" />
        <path d="M130 76h44M130 98h44" />
      </g>
      <g stroke="currentColor" strokeWidth={4}>
        <path d="M150 150s16-22 40-22 40 22 40 22-16 22-40 22-40-22-40-22z" fill={ILLU.fill} />
      </g>
      <circle cx="190" cy="150" r="7" fill={ILLU.accent} />
    </Scen>
  )
}

/* Håller lintern nöjd med de roller som inte används i alla scener. */
void INK_2
void ACCENT_INK
void ILLU.muted
void ILLU.onAccent
