/**
 * Byggdelarna i delningsbilderna (og:image, 1200 × 630).
 *
 * Formen är sajtens publika form (publikt omgång 3) och samma som grafiken
 * för de sociala kontona: indigo i botten, kort i delarnas fyra färger,
 * klack under allt som ligger på ytan och produkten visad som den ser ut.
 * Färgvärdena är ordagrant sajtens (globals.css, blocket PUBLIKT OMGÅNG 3).
 * Ändras de där ändras de här.
 *
 * Allt ritas av next/og (Satori): bara flexbox och absolut placering, varje
 * element med flera barn har display: flex, inga CSS-variabler, ingen
 * box-shadow. Klacken är därför en platta bakom ytan (Platta), inte en
 * skugga. Samma kod visas som vanlig HTML på /dashboard/og-preview.
 */
import type { CSSProperties, ReactNode } from 'react'

export type OgFarg = 'tran' | 'cv' | 'brev' | 'jobb'

interface Toner {
  vagg: string
  vagg2: string
  vagg3: string
  ink: string
  mjuk: string
  svag: string
  ton: string
  tonInk: string
  ljus: string
}

export const OG_FARG: Record<OgFarg, Toner> = {
  tran: { vagg: '#1B2246', vagg2: '#2B3470', vagg3: '#121737', ink: '#F5F6FC', mjuk: '#AEB4DA', svag: '#6F78B0', ton: '#DFE3F6', tonInk: '#3B4790', ljus: '#93A0EC' },
  cv: { vagg: '#113538', vagg2: '#1D4D51', vagg3: '#0B2628', ink: '#F1F8F7', mjuk: '#A3C9C8', svag: '#5C918F', ton: '#D7ECEA', tonInk: '#1E5F5F', ljus: '#7FCFCA' },
  brev: { vagg: '#3A1930', vagg2: '#56284A', vagg3: '#280F22', ink: '#FBF3F8', mjuk: '#D6AFC8', svag: '#9C6A8C', ton: '#F0DCE8', tonInk: '#6E2B59', ljus: '#E29DCB' },
  jobb: { vagg: '#1B3324', vagg2: '#2A4C37', vagg3: '#112219', ink: '#F2F8F2', mjuk: '#A9C9B1', svag: '#6A9676', ton: '#DCEBDD', tonInk: '#245C37', ljus: '#8FD3A0' },
}

export const OG_KOPPAR = { bas: '#E07A2F', ljus: '#F4B98A', ink: '#A8491A', text: '#1A1206', mjuk: '#FBE3D0' } as const
export const OG_LOGGA = { platta: '#F97316', klack: '#B4500C' } as const
export const OG_INK = { ett: '#1A1A1F', tva: '#4A4A55', tre: '#65656E' } as const
export const OG_POSITIV = { bas: '#2F7D5B', mjuk: '#DCEFE5' } as const

/** Klacken under vita ytor (ark, brickor), mörk nog på alla fyra färgerna. */
const KLACK_PAPPER = 'rgba(6, 8, 26, 0.36)'
const KANT_KORT = 'rgba(255, 255, 255, 0.16)'

/**
 * Familjenamnet är detsamma som på sajten (layout.tsx), så att
 * förhandsvisningen i HTML och den ritade bilden får samma snitt. Bilden
 * får det av ogBild, som skickar ttf-filerna till Satori i vikterna 500
 * och 800. Andra vikter finns inte i bilderna.
 */
export const OG_TYPSNITT = "'Schibsted Grotesk', 'Schibsted Grotesk Fallback', system-ui, sans-serif"

/* ------------------------------------------------------------------ */
/* Läge och platta                                                     */
/* ------------------------------------------------------------------ */

/** Illustrationens yta. Allt i den placeras absolut. */
export function OgYta({ children }: { children: ReactNode }) {
  return <div style={{ position: 'relative', display: 'flex', width: 560, height: 560 }}>{children}</div>
}

/** Ett föremål på ytan: plats, bredd och lutning. */
export function Lage({
  x,
  y,
  b,
  h,
  rot,
  children,
}: {
  x: number
  y: number
  b: number
  h?: number
  rot?: number
  children: ReactNode
}) {
  // Satori tål inte nycklar med värdet undefined: de sätts bara när de finns.
  const stil: CSSProperties = { position: 'absolute', left: x, top: y, width: b, display: 'flex' }
  if (h !== undefined) stil.height = h
  if (rot) stil.transform = `rotate(${rot}deg)`
  return <div style={stil}>{children}</div>
}

/**
 * En yta med klack. Den yttre plattan har klackens färg och är lika stor
 * som ytan plus klackens djup nedtill, så den syns bara under ytan, precis
 * som box-shadow: 0 9px 0 gör på sajten.
 */
export function Platta({
  yta,
  klack,
  radie = 28,
  djup = 9,
  kant,
  pad = 18,
  stil,
  children,
}: {
  yta: string
  klack: string
  radie?: number
  djup?: number
  kant?: string
  pad?: number | string
  stil?: CSSProperties
  children?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexGrow: 1, minWidth: 0, background: klack, borderRadius: radie, paddingBottom: djup }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
          background: yta,
          borderRadius: radie,
          padding: pad,
          ...(kant ? { border: `2px solid ${kant}` } : null),
          ...stil,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Ikoner och figurer                                                  */
/* ------------------------------------------------------------------ */

/** Delarnas ikoner, samma ritningar som dörrarna i menyn. Grupper, inte fragment: Satori skriver inte ut fragment i en svg. */
export function OgIkon({ namn, farg, s }: { namn: OgFarg; farg: string; s: number }) {
  const linje = { fill: 'none', stroke: farg, strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      {namn === 'tran' ? (
        <g>
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" {...linje} />
          <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" {...linje} />
          <rect x="16" y="16" width="3.2" height="3.2" rx="0.8" fill={farg} />
        </g>
      ) : null}
      {namn === 'cv' ? (
        <g>
          <rect x="4.5" y="3" width="15" height="18" rx="2.5" {...linje} />
          <circle cx="9" cy="8.5" r="1.6" {...linje} />
          <path d="M12.5 8.5h4M8 13h8M8 16.5h8" {...linje} />
        </g>
      ) : null}
      {namn === 'brev' ? (
        <g>
          <path d="M6.5 3h9l4 4v12a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" {...linje} />
          <path d="M8.5 9.5h7M8.5 13h7M8.5 16.5h4" {...linje} />
        </g>
      ) : null}
      {namn === 'jobb' ? (
        <g>
          <path d="M4 17.5c3-.2 3.6-4.2 6.4-4.6 2.6-.4 3 2 5.4 1.4 2-.5 2.6-3 4.2-6.3" {...linje} />
          <circle cx="4" cy="17.5" r="1.7" {...linje} />
          <circle cx="10.6" cy="12.8" r="1.7" {...linje} />
          <path d="M20 4v5M20 4.3l-3.4 1.2 3.4 1.3" {...linje} />
        </g>
      ) : null}
    </svg>
  )
}

/** Dörren: delens ikon på ljus bricka. */
export function OgDorr({ farg, ikon, s = 36 }: { farg: OgFarg; ikon?: OgFarg; s?: number }) {
  const f = OG_FARG[farg]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: s,
        height: s,
        borderRadius: Math.round(s * 0.3),
        background: f.ink,
      }}
    >
      <OgIkon namn={ikon ?? farg} farg={f.vagg} s={Math.round(s * 0.64)} />
    </div>
  )
}

export type OgFigurNamn = 't' | 'c' | 'k' | 'tp' | 'cp' | 'kp' | 'tx' | 'cx' | 'kx'

/** Matrisens figurer, samma ritningar som i sajtens testram. */
export function OgFigur({ f, s, farg = '#1B2246' }: { f: OgFigurNamn; s: number; farg?: string }) {
  const linje = { fill: 'none', stroke: farg, strokeWidth: 3, strokeLinejoin: 'round', strokeLinecap: 'round' } as const
  const form = f[0]
  const tillagg = f.slice(1)
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
      {form === 't' ? <path d="M20 6l15 27H5z" {...linje} /> : null}
      {form === 'c' ? <circle cx="20" cy="20" r="14" {...linje} /> : null}
      {form === 'k' ? <rect x="6" y="6" width="28" height="28" rx="3" {...linje} /> : null}
      {tillagg === 'p' ? <circle cx="20" cy={form === 't' ? 24 : 20} r="3" fill={farg} /> : null}
      {tillagg === 'x' ? <path d={form === 't' ? 'M15 25h10M20 20v10' : 'M13 20h14M20 13v14'} {...linje} /> : null}
    </svg>
  )
}

/**
 * Sajtens kontrollräknade matrisuppgift (Testram): varje rad har en
 * triangel, en cirkel och en kvadrat, rad två med prick, rad tre med kors.
 * Cirkeln med kors saknas.
 */
export const OG_MATRIS: readonly (OgFigurNamn | null)[] = ['t', 'c', 'k', 'cp', 'kp', 'tp', 'kx', 'tx', null]

/** En vit bricka på brädet, med den nedsänkta kanten nedtill. */
export function OgBricka({ s, children }: { s: number; children: ReactNode }) {
  const r = Math.min(12, Math.round(s * 0.22))
  return (
    <div style={{ display: 'flex', flexShrink: 0, width: s, height: s, borderRadius: r, background: '#D5D9EC' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: s,
          height: s - Math.max(3, Math.round(s * 0.09)),
          borderRadius: r,
          background: '#FFFFFF',
          color: '#1B2246',
          fontWeight: 800,
          fontSize: Math.round(s * 0.46),
          letterSpacing: -0.5,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** Luckan: streckad i koppar med frågetecken. */
export function OgLucka({ s }: { s: number }) {
  const r = Math.min(12, Math.round(s * 0.22))
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: s,
        height: s,
        borderRadius: r,
        background: '#2B3470',
        border: `3px dashed ${OG_KOPPAR.bas}`,
        color: OG_KOPPAR.ljus,
        fontWeight: 800,
        fontSize: Math.round(s * 0.5),
        lineHeight: 1,
      }}
    >
      ?
    </div>
  )
}

/** Brädet i testet: mörk platta, vita brickor, luckan sist. */
export function OgBrade({ b }: { b: number }) {
  const lucka = Math.max(5, Math.round(b * 0.03))
  const pad = Math.max(7, Math.round(b * 0.04))
  const s = Math.floor((b - 2 * pad - 2 * lucka) / 3)
  return (
    <div style={{ display: 'flex', flexShrink: 0, width: b, background: '#0E1330', borderRadius: 20, paddingBottom: 5 }}>
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: pad, borderRadius: 20, background: '#1B2246' }}>
        {[0, 1, 2].map((rad) => (
          <div key={rad} style={{ display: 'flex', justifyContent: 'space-between', marginTop: rad ? lucka : 0 }}>
            {[0, 1, 2].map((kol) => {
              const f = OG_MATRIS[rad * 3 + kol]
              return f ? (
                <OgBricka key={kol} s={s}>
                  <OgFigur f={f} s={Math.round(s * 0.56)} />
                </OgBricka>
              ) : (
                <OgLucka key={kol} s={s} />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Svarsklossen bredvid brädet. Den valda står i delens ton. */
export function OgSvar({ s, f, vald }: { s: number; f: OgFigurNamn; vald?: boolean }) {
  const kant = vald ? '#3B4790' : '#C8CEEC'
  return (
    <div style={{ display: 'flex', flexShrink: 0, width: s, borderRadius: 13, background: kant, paddingBottom: 4 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: s,
          height: s,
          borderRadius: 13,
          border: `2px solid ${kant}`,
          background: vald ? '#EEF0FB' : '#FFFFFF',
        }}
      >
        <OgFigur f={f} s={Math.round(s * 0.54)} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Kortet, arket och brickan                                           */
/* ------------------------------------------------------------------ */

/** Kortet i en dels färg (startsidans kort): dörr, namn och innehåll. */
export function OgKort({
  farg,
  x,
  y,
  b,
  h,
  rot,
  namn,
  ikon,
  hoger,
  pad = 18,
  namnStorlek = 22,
  children,
}: {
  farg: OgFarg
  x: number
  y: number
  b: number
  h?: number
  rot?: number
  namn?: string
  ikon?: OgFarg
  /** Något till höger i huvudet, till exempel räknaren i testet. */
  hoger?: ReactNode
  pad?: number
  namnStorlek?: number
  children?: ReactNode
}) {
  const f = OG_FARG[farg]
  return (
    <Lage x={x} y={y} b={b} h={h} rot={rot}>
      <Platta yta={f.vagg2} klack={f.vagg3} kant={KANT_KORT} pad={pad} stil={{ color: f.ink }}>
        {namn ? (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <OgDorr farg={farg} ikon={ikon} s={Math.round(namnStorlek * 1.64)} />
            <div
              style={{
                display: 'flex',
                marginLeft: 10,
                fontSize: namnStorlek,
                fontWeight: 800,
                letterSpacing: -0.3,
                lineHeight: 1,
                color: f.ink,
                whiteSpace: 'nowrap',
              }}
            >
              {namn}
            </div>
            {hoger ? <div style={{ display: 'flex', marginLeft: 'auto' }}>{hoger}</div> : null}
          </div>
        ) : null}
        {children}
      </Platta>
    </Lage>
  )
}

/** En platta i delens färg bakom ett ark, så att delen syns i bilden. */
export function OgBakplatta({ farg, x, y, b, h, rot }: { farg: OgFarg; x: number; y: number; b: number; h: number; rot?: number }) {
  const f = OG_FARG[farg]
  return (
    <Lage x={x} y={y} b={b} h={h} rot={rot}>
      <Platta yta={f.vagg2} klack={f.vagg3} kant={KANT_KORT} radie={44} djup={11} pad={0} />
    </Lage>
  )
}

/** Arket: CV:t och brevet. */
export function OgArk({
  x,
  y,
  b,
  h,
  rot,
  pad = 22,
  children,
}: {
  x: number
  y: number
  b: number
  h?: number
  rot?: number
  pad?: number | string
  children?: ReactNode
}) {
  return (
    <Lage x={x} y={y} b={b} h={h} rot={rot}>
      <Platta yta="#FFFFFF" klack={KLACK_PAPPER} radie={8} djup={9} pad={pad} stil={{ color: OG_INK.ett }}>
        {children}
      </Platta>
    </Lage>
  )
}

/** Ett ark i flödet (inne i ett kort), utan egen plats. */
export function OgBlad({ pad = 18, radie = 10, stil, children }: { pad?: number | string; radie?: number; stil?: CSSProperties; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', ...stil }}>
      <Platta yta="#FFFFFF" klack="rgba(6, 8, 26, 0.3)" radie={radie} djup={5} pad={pad} stil={{ color: OG_INK.ett }}>
        {children}
      </Platta>
    </div>
  )
}

/** Den svävande vita brickan. */
export function OgSvav({
  x,
  y,
  b,
  rot,
  pad = '14px 18px 16px',
  radie = 22,
  children,
}: {
  x: number
  y: number
  b: number
  rot?: number
  pad?: number | string
  radie?: number
  children?: ReactNode
}) {
  return (
    <Lage x={x} y={y} b={b} rot={rot}>
      <Platta yta="#FFFFFF" klack={KLACK_PAPPER} radie={radie} djup={7} pad={pad} stil={{ color: OG_INK.ett }}>
        {children}
      </Platta>
    </Lage>
  )
}

/** En textrad på arket, ritad som linje. */
export function Linje({
  b = '100%',
  h = 6,
  farg = '#DCDAD5',
  mt = 8,
}: {
  b?: number | string
  h?: number
  farg?: string
  mt?: number
}) {
  return <div style={{ display: 'flex', flexShrink: 0, width: b, height: h, marginTop: mt, borderRadius: h / 2, background: farg }} />
}

/** Rubriken för en del på arket: kort mörk linje över en tunn regel. */
export function ArkRubrik({ b = '38%', mt = 16, h = 7 }: { b?: number | string; mt?: number; h?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, marginTop: mt, paddingBottom: 5, borderBottom: '2px solid #C9C6BF' }}>
      <div style={{ display: 'flex', width: b, height: h, borderRadius: h / 2, background: '#8E8A99' }} />
    </div>
  )
}

/** Bocken i en lista: grön när kravet har fått svar, grå annars. */
export function OgBock({ s = 22, pa = true }: { s?: number; pa?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: s,
        height: s,
        borderRadius: Math.round(s * 0.28),
        background: pa ? OG_POSITIV.mjuk : '#EDEBF0',
      }}
    >
      {pa ? (
        <svg width={Math.round(s * 0.72)} height={Math.round(s * 0.72)} viewBox="0 0 24 24" fill="none">
          <path d="M6 12.5l4 4 8-9" stroke={OG_POSITIV.bas} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </div>
  )
}

/** Analysens sju delar som en rad. De som tappar poäng står i koppar. */
export function OgSju({ farg, h = 16 }: { farg: OgFarg; h?: number }) {
  const delar: [number, boolean][] = [
    [10, false],
    [15, false],
    [35, true],
    [12, false],
    [8, false],
    [5, true],
    [15, false],
  ]
  return (
    <div style={{ display: 'flex', height: h }}>
      {delar.map(([vikt, tappar], i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexGrow: vikt,
            flexBasis: 0,
            marginLeft: i ? 4 : 0,
            borderRadius: 5,
            background: tappar ? OG_KOPPAR.bas : OG_FARG[farg].ljus,
          }}
        />
      ))}
    </div>
  )
}

/** En del som tappar poäng: namn, poäng och stapel i koppar. */
export function OgTapp({ namn, poang, andel, storlek = 16, mt = 15 }: { namn: string; poang: string; andel: number; storlek?: number; mt?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: mt }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: storlek, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex' }}>{namn}</div>
        <div style={{ display: 'flex' }}>{poang}</div>
      </div>
      <div style={{ display: 'flex', height: 8, marginTop: 6, borderRadius: 4, background: 'rgba(255, 255, 255, 0.16)' }}>
        <div style={{ display: 'flex', width: `${andel}%`, height: 8, borderRadius: 4, background: OG_KOPPAR.bas }} />
      </div>
    </div>
  )
}

/** Vägen i Jobbsöket: prickad linje, ringar och flaggan i koppar. */
export function OgMinistig({ farg, b }: { farg: OgFarg; b: number }) {
  const f = OG_FARG[farg]
  return (
    <svg width={b} height={Math.round((b * 112) / 228)} viewBox="0 -10 228 112" fill="none">
      <path
        d="M12 92C50 92 54 68 88 64s42-12 64-24 36-16 50-22"
        stroke={f.ink}
        strokeOpacity="0.6"
        strokeWidth="3.4"
        strokeDasharray="1 8.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="92" r="7" fill={f.vagg2} stroke={f.ink} strokeWidth="3.4" />
      <circle cx="88" cy="64" r="9.5" fill={OG_KOPPAR.bas} stroke={f.ink} strokeWidth="3.4" />
      <circle cx="152" cy="40" r="7" fill={f.vagg2} stroke={f.ink} strokeWidth="3.4" />
      <path d="M202 18V-6" stroke={f.ink} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M202 -6l20 7-20 8z" fill={OG_KOPPAR.bas} />
      <circle cx="202" cy="18" r="5.5" fill={f.ink} />
    </svg>
  )
}

/** Raden under bilden i ett kort: fet början, mjuk fortsättning. */
export function OgRad({ farg, fet, text, storlek = 17, mt = 14 }: { farg: OgFarg; fet?: string; text?: string; storlek?: number; mt?: number }) {
  const f = OG_FARG[farg]
  return (
    <div style={{ display: 'flex', marginTop: mt, fontSize: storlek, lineHeight: 1.25, whiteSpace: 'nowrap' }}>
      {fet ? <div style={{ display: 'flex', fontWeight: 800, color: f.ink }}>{fet}</div> : null}
      {text ? <div style={{ display: 'flex', fontWeight: 500, color: f.mjuk, marginLeft: fet ? 6 : 0 }}>{text}</div> : null}
    </div>
  )
}

/** Delens dörr som märke i hörnet på en bakplatta. */
export function OgMarke({ farg, x, y, rot }: { farg: OgFarg; x: number; y: number; rot?: number }) {
  return (
    <Lage x={x} y={y} b={64} rot={rot}>
      <div style={{ display: 'flex', width: 64, height: 70, borderRadius: 19, background: OG_FARG[farg].vagg3 }}>
        <OgDorr farg={farg} s={64} />
      </div>
    </Lage>
  )
}
