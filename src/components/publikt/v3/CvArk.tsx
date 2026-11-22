/**
 * CV-arket med nålar och poängbricka (delar/cv-ark.html, skissen cv-analys).
 *
 * Arket visar analysens delar som numrerade nålar; en del kan vara vald
 * (kopparram). Med poang flyter en bricka med talet ovanför arket, med
 * fynd en bricka om delen där CV:t tappar, med kvar ett kopparchip.
 * Allt innehåll är props med Sara Lindström som förval. Exempel, aldrig
 * verkliga resultat: aria-label säger "Exempel".
 */

import type { CSSProperties, ReactNode } from 'react'

export interface ArkRad {
  text: string
  tid?: string
}

export interface ArkDel {
  rubrik: string
  rader?: readonly ArkRad[]
  /** Grå textrader: 'hel', 'm' (84 %), 'k' (62 %), 's' (46 %). */
  linjer?: readonly ('hel' | 'm' | 'k' | 's')[]
}

export const SARA_KONTAKT = 'sara.lindstrom@exempel.se · 070-123 45 67 · Göteborg'

export const SARA_DELAR: readonly ArkDel[] = [
  { rubrik: 'Profil', linjer: ['hel', 'm', 'k'] },
  {
    rubrik: 'Arbetslivserfarenhet',
    rader: [{ text: 'Projektledare, Nordanvind Energi', tid: '2021 – pågående' }],
    linjer: ['m', 'hel', 'k'],
  },
  { rubrik: 'Kompetenser', linjer: ['m', 'k'] },
  { rubrik: 'Utbildning', rader: [{ text: 'Civilingenjör, industriell ekonomi', tid: '2013 – 2018' }], linjer: ['s'] },
  { rubrik: 'Språk', linjer: ['s'] },
]

function Linjer({ linjer }: { linjer?: ArkDel['linjer'] }) {
  if (!linjer?.length) return null
  return (
    <>
      {linjer.map((l, i) => (
        <i key={i} className={`p3-l ${l === 'hel' ? '' : `p3-${l}`}`.trim()} />
      ))}
    </>
  )
}

/** Den svävande brickan: ett stort tal och en rad. Används också fritt (position med style). */
export function Svav({
  stor,
  under,
  mindre,
  statisk,
  gungar,
  sen,
  className = '',
  style,
  children,
}: {
  stor?: ReactNode
  under?: ReactNode
  /** Mindre tal ("3 av 4"). */
  mindre?: boolean
  /** I flödet i stället för absolut placerad. */
  statisk?: boolean
  /** Gungar långsamt (av under prefers-reduced-motion). */
  gungar?: boolean
  sen?: boolean
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const k = ['p3-svav', mindre ? 'p3-mindre' : '', statisk ? 'p3-statisk' : '', gungar ? 'p3-gungar' : '', sen ? 'p3-sen' : '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={k} style={style}>
      {stor !== undefined ? <div className="p3-stor">{stor}</div> : null}
      {under ? <div className="p3-under">{under}</div> : null}
      {children}
    </div>
  )
}

export function CvArk({
  namn = 'Sara Lindström',
  kontakt = SARA_KONTAKT,
  delar,
  vald = 3,
  nalar = true,
  poang,
  kvar,
  fynd,
  liten,
  luta = true,
  ariaLabel = 'Exempel: Sara Lindströms CV med analysens delar utmärkta',
}: {
  namn?: string
  kontakt?: string
  /** Delarna under namnet. Namnet och kontakten är del 1. */
  delar?: readonly ArkDel[]
  /** Nålens nummer som är vald (kopparram), 0 för ingen. */
  vald?: number
  nalar?: boolean
  /** Brickan ovanför arket: { tal: 93, text: 'av 100 i dag' }. */
  poang?: { tal: ReactNode; text: ReactNode }
  /** Kopparchip uppe till höger ("7 poäng kvar till 100"). */
  kvar?: ReactNode
  /** Brickan nere till höger: delen där CV:t tappar. andel i procent (0 till 100). */
  fynd?: { rubrik: string; poang: string; andel: number; text: ReactNode }
  /** Mindre nålar och namn, för små ytor. */
  liten?: boolean
  /** Arket står lite snett när det har brickor runt sig (standard). false för rakt. */
  luta?: boolean
  ariaLabel?: string
}) {
  const allaDelar: readonly ArkDel[] = delar ?? [
    SARA_DELAR[0],
    {
      rubrik: 'Arbetslivserfarenhet',
      rader: [
        { text: 'Projektledare, Nordanvind Energi', tid: '2021 – pågående' },
        { text: 'Biträdande projektledare, Halda Logistik', tid: '2018 – 2021' },
      ],
    },
    ...SARA_DELAR.slice(2),
  ]
  const ark = (
    <div className={`p3-ark ${liten ? 'p3-liten-ark' : ''}`.trim()} role="img" aria-label={ariaLabel}>
      <div className={`p3-del ${vald === 1 ? 'p3-vald' : ''}`.trim()}>
        {nalar ? <span className="p3-nal">1</span> : null}
        <div className="p3-ark-namn">{namn}</div>
        <span className="p3-ark-kontakt">{kontakt}</span>
      </div>
      {allaDelar.map((d, i) => {
        const nr = i + 2
        const radLinjer: ArkDel['linjer'] = d.rader?.length && !d.linjer ? ['m', 'hel', 'k'] : undefined
        return (
          <div key={d.rubrik + i} className={`p3-del ${vald === nr ? 'p3-vald' : ''}`.trim()}>
            {nalar ? <span className="p3-nal">{nr}</span> : null}
            <div className="p3-ark-rubrik">{d.rubrik}</div>
            {d.rader?.map((r, j) => (
              <div key={j}>
                <div className="p3-ark-rad">
                  {r.text}
                  {r.tid ? <span>{r.tid}</span> : null}
                </div>
                {radLinjer ? <Linjer linjer={j % 2 ? ['hel', 'm', 's'] : radLinjer} /> : null}
              </div>
            ))}
            <Linjer linjer={d.linjer} />
          </div>
        )
      })}
    </div>
  )
  if (!poang && !fynd && !kvar) {
    return ark
  }
  const k = ['p3-instr', poang || kvar ? 'p3-med-poang' : '', fynd ? 'p3-med-fynd' : ''].filter(Boolean).join(' ')
  return (
    <div className={k} style={luta ? undefined : ({ ['--ark-rot' as string]: '0deg' } as CSSProperties)}>
      {kvar ? <span className="p3-chip p3-chip-koppar p3-kvar">{kvar}</span> : null}
      {poang ? <Svav className="p3-poang" stor={poang.tal} under={poang.text} gungar /> : null}
      {ark}
      {fynd ? (
        <Svav className="p3-fynd" gungar sen>
          <b>
            {fynd.rubrik} <span>{fynd.poang}</span>
          </b>
          <div className="p3-stapel p3-koppar">
            <i style={{ width: `${Math.max(0, Math.min(100, fynd.andel))}%` }} />
          </div>
          <p>{fynd.text}</p>
        </Svav>
      ) : null}
    </div>
  )
}
