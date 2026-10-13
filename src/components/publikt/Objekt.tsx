/**
 * Objekten: 64 × 64 konturer i currentColor med en kopparyta
 * (spec-publikt-v2 del A avsnitt 3). Färgen kommer från rummet
 * (--rum-ink på ljus yta, vitt på vägg). Alltid aria-hidden: texten bredvid
 * säger vad objektet visar.
 */

import type { ReactNode } from 'react'

export type ObjektTyp =
  | 'matris'
  | 'cv'
  | 'match'
  | 'brev'
  | 'chat'
  | 'mallar'
  | 'linkedin'
  | 'upptackt'
  | 'exempel'
  | 'sokta'
  | 'person'
  | 'klocka'
  | 'yrke'
  | 'kompetens'
  | 'utbildning'
  | 'plats'
  | 'sprak'
  | 'erfarenhet'
  | 'monster'
  | 'logik'
  | 'lasning'
  | 'kritiskt'
  | 'rakna'
  | 'tabell'
  | 'prova'
  | 'rapport'
  | 'uppat'
  | 'ladda'
  | 'karta'

const K = 'var(--koppar)'

const FORMER: Record<ObjektTyp, ReactNode> = {
  /** Jobbkartan: den vikta kartan från menyns ikon, med en kopparnål. */
  karta: (
    <>
      <path d="M8 16 23 10l18 6 15-6v38l-15 6-18-6-15 6z" />
      <path d="M23 10v38M41 16v38" opacity=".45" />
      <path d="M32 20a7 7 0 0 1 7 7c0 5-7 12-7 12s-7-7-7-12a7 7 0 0 1 7-7z" fill={K} stroke="none" />
      <circle cx="32" cy="27" r="2.5" fill="var(--panel)" stroke="none" />
    </>
  ),
  matris: (
    <>
      <rect x="6" y="6" width="52" height="52" rx="8" />
      <path d="M23 6v52M41 6v52M6 23h52M6 41h52" opacity=".45" />
      <circle cx="14.5" cy="14.5" r="3.5" />
      <path d="M28 18h8v-7" />
      <path d="M49.5 11l4 7h-8z" />
      <path d="M49.5 29l4 7h-8z" />
      <circle cx="32" cy="32" r="3.5" />
      <rect x="44" y="44" width="10" height="10" rx="2" fill={K} stroke="none" />
    </>
  ),
  cv: (
    <>
      <rect x="10" y="6" width="40" height="52" rx="6" />
      <circle cx="22" cy="19" r="4" />
      <path d="M31 17h12M18 31h28M18 39h28M18 47h18" />
      <circle cx="50" cy="12" r="9" fill="var(--panel)" />
      <path d="M50 4a8 8 0 1 1-7 4" stroke={K} strokeWidth="3" />
    </>
  ),
  match: (
    <>
      <rect x="6" y="10" width="52" height="18" rx="6" />
      <rect x="6" y="36" width="52" height="18" rx="6" />
      <path d="M14 19h20M14 45h14" />
      <circle cx="48" cy="19" r="4" fill={K} stroke="none" />
      <circle cx="48" cy="45" r="4" />
    </>
  ),
  brev: (
    <>
      <path d="M12 6h26l14 14v36a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <path d="M38 6v14h14M18 30h24M18 38h28M18 46h28" />
      <rect x="18" y="51" width="18" height="4" rx="2" fill={K} stroke="none" />
    </>
  ),
  chat: (
    <>
      <path d="M8 12a6 6 0 0 1 6-6h26a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H24l-10 8V32h0a6 6 0 0 1-6-6z" />
      <path
        d="M56 34a6 6 0 0 0-6-6H30a6 6 0 0 0-6 6v12a6 6 0 0 0 6 6h18l8 7V52a6 6 0 0 0 0 0z"
        fill="currentColor"
        stroke="none"
        opacity=".9"
      />
      <path d="M32 38h16M32 44h10" stroke={K} />
    </>
  ),
  mallar: (
    <>
      <rect x="6" y="12" width="34" height="44" rx="5" />
      <rect x="24" y="6" width="34" height="44" rx="5" fill="var(--panel)" />
      <path d="M32 18h18M32 26h18M32 34h12" />
      <rect x="32" y="40" width="10" height="4" rx="2" fill={K} stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <rect x="8" y="8" width="48" height="48" rx="8" />
      <circle cx="22" cy="24" r="4" />
      <path d="M22 32v14M34 46V32M34 38a6 6 0 0 1 12 0v8" />
    </>
  ),
  upptackt: (
    <>
      <circle cx="30" cy="26" r="10" />
      <path d="M12 54c2-10 9-16 18-16s16 6 18 16" />
      <circle cx="48" cy="18" r="9" fill="var(--panel)" />
      <path d="M48 13v10M43 18h10" stroke={K} />
    </>
  ),
  exempel: (
    <>
      <path d="M8 14h20a6 6 0 0 1 6 6v34a4 4 0 0 0-4-4H8z" />
      <path d="M56 14H36a6 6 0 0 0-6 6v34a4 4 0 0 1 4-4h22z" />
      <path d="M14 24h10M14 32h10M40 24h10M40 32h10" />
    </>
  ),
  sokta: (
    <>
      <path d="M8 20h48M8 32h48M8 44h48" opacity=".5" />
      <circle cx="16" cy="20" r="4" fill={K} stroke="none" />
      <circle cx="32" cy="32" r="4" fill={K} stroke="none" />
      <circle cx="48" cy="44" r="4" />
      <path d="M16 20l16 12 16 12" />
    </>
  ),
  person: (
    <>
      <circle cx="20" cy="18" r="8" />
      <path d="M8 40c2-8 7-12 12-12s10 4 12 12" />
      <path d="M40 14h16M40 24h12M40 34h16M40 44h8" />
      <rect x="40" y="52" width="14" height="4" rx="2" fill={K} stroke="none" />
    </>
  ),
  klocka: (
    <>
      <circle cx="32" cy="34" r="22" />
      <path d="M32 20v14l9 6M26 8h12M32 8v4" />
      <path d="M32 12a22 22 0 0 1 19 11" stroke={K} strokeWidth="3" />
    </>
  ),
  yrke: (
    <>
      <rect x="8" y="12" width="48" height="40" rx="6" />
      <circle cx="22" cy="28" r="6" />
      <path d="M14 44c1-6 4-9 8-9s7 3 8 9M36 24h14M36 32h10" />
      <rect x="36" y="40" width="12" height="4" rx="2" fill={K} stroke="none" />
    </>
  ),
  kompetens: (
    <>
      <rect x="6" y="10" width="26" height="12" rx="6" />
      <rect x="36" y="10" width="22" height="12" rx="6" />
      <rect x="6" y="26" width="18" height="12" rx="6" />
      <rect x="28" y="26" width="30" height="12" rx="6" />
      <rect x="6" y="42" width="30" height="12" rx="6" />
      <rect x="40" y="42" width="18" height="12" rx="6" fill={K} stroke="none" />
    </>
  ),
  utbildning: (
    <>
      <path d="M6 24 32 12l26 12-26 12z" />
      <path d="M16 29v14c0 4 7 8 16 8s16-4 16-8V29" />
      <path d="M58 24v14" />
      <circle cx="58" cy="42" r="4" fill={K} stroke="none" />
    </>
  ),
  plats: (
    <>
      <circle cx="32" cy="34" r="24" strokeDasharray="4 4" opacity=".55" />
      <path d="M32 46c-7-8-12-13-12-19a12 12 0 0 1 24 0c0 6-5 11-12 19z" />
      <circle cx="32" cy="27" r="4" fill={K} stroke="none" />
    </>
  ),
  sprak: (
    <>
      <path d="M8 12a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H22l-8 7v-7h0a6 6 0 0 1-6-6z" />
      <path d="M16 16h18M16 23h10" />
      <path d="M56 34a6 6 0 0 0-6-6H30a6 6 0 0 0-6 6v10a6 6 0 0 0 6 6h16l8 7v-7a6 6 0 0 0 2-6z" />
      <path d="M32 38h16M32 45h8" stroke={K} strokeWidth="3" />
    </>
  ),
  erfarenhet: (
    <>
      <path d="M6 40h52" />
      <circle cx="14" cy="40" r="5" fill="var(--panel)" />
      <circle cx="32" cy="40" r="5" fill="var(--panel)" />
      <circle cx="50" cy="40" r="6" fill={K} stroke="none" />
      <path d="M14 35V22h12M32 35V16h12" opacity=".6" />
    </>
  ),
  monster: (
    <>
      <circle cx="16" cy="16" r="6" />
      <circle cx="32" cy="16" r="6" />
      <circle cx="48" cy="16" r="6" />
      <path d="M10 40h12v12H10zM26 40h12v12H26z" />
      <rect x="42" y="40" width="12" height="12" fill={K} stroke="none" />
      <path d="M16 26v8M32 26v8M48 26v8" opacity=".4" />
    </>
  ),
  logik: (
    <>
      <path d="M10 50 24 22h16l14 28" />
      <path d="M18 40h28" />
      <circle cx="32" cy="12" r="5" fill={K} stroke="none" />
      <path d="M32 17v5" />
    </>
  ),
  lasning: (
    <>
      <rect x="10" y="8" width="44" height="48" rx="5" />
      <path d="M18 20h28M18 28h28M18 36h18" />
      <rect x="18" y="44" width="16" height="4" rx="2" fill={K} stroke="none" />
    </>
  ),
  kritiskt: (
    <>
      <circle cx="20" cy="20" r="8" />
      <circle cx="44" cy="20" r="8" />
      <circle cx="32" cy="44" r="8" />
      <path d="M20 28l12 8M44 28l-12 8" opacity=".5" />
      <path d="M28 44h8" stroke={K} strokeWidth="3" />
    </>
  ),
  rakna: (
    <>
      <path d="M12 48 30 14M34 50l18-36" opacity=".5" />
      <path d="M8 32h20M36 32h20" />
      <circle cx="32" cy="32" r="5" fill={K} stroke="none" />
    </>
  ),
  tabell: (
    <>
      <rect x="8" y="12" width="48" height="40" rx="4" />
      <path d="M8 24h48M8 36h48M24 12v40M40 12v40" opacity=".5" />
      <rect x="40" y="36" width="16" height="12" fill={K} stroke="none" opacity=".9" />
    </>
  ),
  prova: (
    <>
      <rect x="8" y="12" width="48" height="40" rx="8" />
      <path d="M20 32l8 8 16-16" />
    </>
  ),
  rapport: (
    <>
      <rect x="12" y="8" width="40" height="48" rx="6" />
      <path d="M20 22h24M20 30h24M20 38h14" />
      <path d="M38 44l4 4 8-8" stroke={K} />
    </>
  ),
  uppat: (
    <>
      <path d="M10 48 24 28l12 12 18-24" />
      <path d="M44 16h10v10" />
      <path d="M8 56h48" />
    </>
  ),
  ladda: (
    <>
      <path d="M32 8v32M20 28l12 12 12-12" />
      <path d="M10 44v8a4 4 0 0 0 4 4h36a4 4 0 0 0 4-4v-8" />
      <rect x="24" y="52" width="16" height="4" rx="2" fill={K} stroke="none" />
    </>
  ),
}

export default function Objekt({
  typ,
  storlek = 64,
  className = '',
}: {
  typ: ObjektTyp
  storlek?: 34 | 40 | 52 | 64
  className?: string
}) {
  const storleksKlass = storlek === 64 ? '' : `pub-obj-${storlek}`
  return (
    <div className={`pub-obj ${storleksKlass} ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 64 64" width={storlek} height={storlek} focusable="false">
        {FORMER[typ]}
      </svg>
    </div>
  )
}
