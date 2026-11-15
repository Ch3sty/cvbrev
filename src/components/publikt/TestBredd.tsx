/**
 * Testelementet Nio (granskning-art-director.md avsnitt 2, beslut om
 * säljytorna 2026-11-15, skiss-fore-efter.html): testbredden som bild. Nio
 * testtyper som nio glyfer, i ett rutnät 3×3 där elementet är kortets bild
 * eller på en rad där kortet redan har en bild.
 *
 * Glyferna står i en färg. Den typ kortet handlar om (markerad) får mörkare
 * bläck och kopparaccenten, aldrig en färgad platta bakom; är någon markerad
 * blir de övriga ink-3. Raden skalar till spaltens bredd: högst 280 px, nio
 * lika kolumner och varje glyf högst 24 px, så att ingen symbol klipps i en
 * smal spalt (ägarens granskning 2026-11-15).
 *
 * Serverkomponent utan hooks: ingen klient-JS, fast geometri i CSS
 * (globals.css, prefix tb-), alltså CLS noll. Används både publikt och i
 * inloggat (PaywallCard), därför bor stilen i globals.css.
 */

import { TESTGLYFER, TEST_TYPER, type TestTyp } from '@/components/illustrations/TestGlyfer'

export type { TestTyp }

export type TestBreddProps = {
  form: 'rutnat' | 'rad'
  /** Den typ kortet handlar om. Får ink-1 och kopparaccenten. */
  markerad?: TestTyp
  /** Flera markerade, för I-provet. Övriga blir ink-3. */
  markerade?: readonly TestTyp[]
  /** Caption under elementet. Tomt ger ingen caption. */
  text?: string
  /** 'ljus' (papper, ton, insunken) eller 'vagg' (bläck, premium, vägg). */
  yta?: 'ljus' | 'vagg'
  /** Skärmläsartext för hela elementet. */
  label: string
  className?: string
}

export default function TestBredd({ form, markerad, markerade, text, yta = 'ljus', label, className }: TestBreddProps) {
  const valda = new Set<TestTyp>(markerade ?? (markerad ? [markerad] : []))
  return (
    <figure role="img" aria-label={label} className={`tb tb-${form} tb-${yta}${className ? ` ${className}` : ''}`}>
      <ol className="tb-glyfer" data-nagon-markerad={valda.size > 0 ? '' : undefined}>
        {TEST_TYPER.map((typ) => {
          const Glyf = TESTGLYFER[typ]
          return (
            <li key={typ} data-typ={typ} data-markerad={valda.has(typ) ? '' : undefined}>
              <Glyf />
            </li>
          )
        })}
      </ol>
      {text ? <figcaption className="tb-text">{text}</figcaption> : null}
    </figure>
  )
}
