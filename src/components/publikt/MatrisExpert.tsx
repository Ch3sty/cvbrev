/**
 * Expertfrågan i matrislogik (v7e-plus-p2-17, facit C), som statisk SVG.
 *
 * En källa för alla ställen där matrisen syns publikt: telefonens
 * SkarmMatris, den svävande matrisbrickan, testtypskortet och, i del B,
 * artikelns provkort (spec-publikt-v2 del B avsnitt 2.1). Ingen JavaScript.
 *
 * Regeln: per rad roterar formen (triangel, cirkel, kvadrat), fyllningen och
 * märket. Tredje raden saknar en cirkel med ljus fyllning och plus: C.
 */

export type MatrisForm = 'triangel' | 'cirkel' | 'kvadrat'
export type MatrisFyllning = 'ljus' | 'mork'
export type MatrisMarke = 'plus' | 'minus' | 'prick'

export interface MatrisRuta {
  form: MatrisForm
  fyllning: MatrisFyllning
  marke: MatrisMarke
}

/** De åtta rutorna i läsordning. Den nionde är luckan. */
export const MATRIS_EXPERT_RUTOR: readonly MatrisRuta[] = [
  { form: 'triangel', fyllning: 'ljus', marke: 'plus' },
  { form: 'cirkel', fyllning: 'mork', marke: 'minus' },
  { form: 'kvadrat', fyllning: 'ljus', marke: 'prick' },
  { form: 'cirkel', fyllning: 'mork', marke: 'prick' },
  { form: 'kvadrat', fyllning: 'ljus', marke: 'plus' },
  { form: 'triangel', fyllning: 'mork', marke: 'minus' },
  { form: 'kvadrat', fyllning: 'ljus', marke: 'minus' },
  { form: 'triangel', fyllning: 'mork', marke: 'prick' },
]

/** Svarsalternativen A till F. */
export const MATRIS_EXPERT_ALTERNATIV: readonly { bokstav: string; ruta: MatrisRuta }[] = [
  { bokstav: 'A', ruta: { form: 'cirkel', fyllning: 'ljus', marke: 'minus' } },
  { bokstav: 'B', ruta: { form: 'kvadrat', fyllning: 'mork', marke: 'plus' } },
  { bokstav: 'C', ruta: { form: 'cirkel', fyllning: 'ljus', marke: 'plus' } },
  { bokstav: 'D', ruta: { form: 'kvadrat', fyllning: 'mork', marke: 'minus' } },
  { bokstav: 'E', ruta: { form: 'cirkel', fyllning: 'ljus', marke: 'prick' } },
  { bokstav: 'F', ruta: { form: 'kvadrat', fyllning: 'mork', marke: 'prick' } },
]

export const MATRIS_EXPERT_FACIT = 'C'

/** Frågans id i banken, för spårbarhet. */
export const MATRIS_EXPERT_ID = 'v7e-plus-p2-17'

const FYLLNING: Record<MatrisFyllning, string> = {
  ljus: 'var(--papper-skarm)',
  mork: 'var(--kant-stark)',
}

/** En ruta som innehåll i en SVG med viewBox 0 0 100 100. */
export function MatrisFigur({ ruta, streck }: { ruta: MatrisRuta; streck: number }) {
  const dy = ruta.form === 'triangel' ? 9 : 0
  const fyll = FYLLNING[ruta.fyllning]
  return (
    <g stroke="var(--ink-1)" strokeWidth={streck} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {ruta.form === 'triangel' ? <path d="M50 18 L82 80 L18 80 Z" fill={fyll} /> : null}
      {ruta.form === 'cirkel' ? <circle cx="50" cy="50" r="30" fill={fyll} /> : null}
      {ruta.form === 'kvadrat' ? <rect x="20" y="20" width="60" height="60" rx="4" fill={fyll} /> : null}
      {ruta.marke === 'plus' ? <path d={`M40 ${50 + dy} H60 M50 ${40 + dy} V${60 + dy}`} /> : null}
      {ruta.marke === 'minus' ? <path d={`M40 ${50 + dy} H60`} /> : null}
      {ruta.marke === 'prick' ? <circle cx="50" cy={50 + dy} r="5" fill="var(--ink-1)" stroke="none" /> : null}
    </g>
  )
}

/** Luckan: streckad ram och frågetecken. */
export function MatrisLucka({ streck }: { streck: number }) {
  return (
    <g fill="none" stroke="var(--ink-3)" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="16" width="68" height="68" rx="8" strokeWidth={streck * 0.72} strokeDasharray="5 4" />
      <path d="M38 40 A12 12 0 1 1 55 51 Q50 55 50 62" strokeWidth={streck * 1.4} />
      <circle cx="50" cy="73" r="3.2" fill="var(--ink-3)" stroke="none" />
    </g>
  )
}

/** Rutnätet och alternativen i telefonens storlek (SkarmMatris). */
export function MatrisExpertSkarm() {
  return (
    <>
      <div className="s-matris">
        <div className="s-matris-g">
          {MATRIS_EXPERT_RUTOR.map((r, i) => (
            <div key={i}>
              <svg viewBox="0 0 100 100" focusable="false">
                <MatrisFigur ruta={r} streck={3.6} />
              </svg>
            </div>
          ))}
          <div className="s-lucka">
            <svg viewBox="0 0 100 100" focusable="false">
              <MatrisLucka streck={3.6} />
            </svg>
          </div>
        </div>
      </div>
      <div className="s-alt">
        {MATRIS_EXPERT_ALTERNATIV.map((a) => (
          <div key={a.bokstav}>
            <b>{a.bokstav}</b>
            <svg viewBox="0 0 100 100" focusable="false">
              <MatrisFigur ruta={a.ruta} streck={3.6} />
            </svg>
          </div>
        ))}
      </div>
    </>
  )
}

/** Matrisbrickan i miniatyr: 96 × 96, svävande objekt och testtypskort. */
export function MatrisBricka({ className = 'pub-mini-matris', bredd = 96 }: { className?: string; bredd?: number }) {
  const pos = [6, 34, 62]
  return (
    <svg viewBox="0 0 96 96" width={bredd} height={bredd} fill="none" className={className} aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="90" height="90" rx="14" fill="var(--panel)" stroke="var(--ink-1)" strokeWidth="2.5" />
      <path d="M34 6v84M62 6v84M6 34h84M6 62h84" stroke="var(--kant-stark)" strokeWidth="1.5" />
      {MATRIS_EXPERT_RUTOR.map((r, i) => (
        <svg key={i} x={pos[i % 3]} y={pos[Math.floor(i / 3)]} width="28" height="28" viewBox="0 0 100 100">
          <MatrisFigur ruta={r} streck={9} />
        </svg>
      ))}
      <svg x={pos[2]} y={pos[2]} width="28" height="28" viewBox="0 0 100 100">
        <MatrisLucka streck={8.67} />
      </svg>
    </svg>
  )
}
