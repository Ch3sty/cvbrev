/**
 * Bankbredden (art director 2026-11-19, docs/design/bankbredd-2026-11-19.md
 * avsnitt 3): ett stort tal och åtta staplar. "Över 3 500 uppgifter" i
 * display, bredvid en stapel per testtyp med Nio-glyfen under. Talen per typ
 * står aldrig på ytan, bara i figurens aria-label och i stapelns title.
 *
 * Linjär skala med noll som bas: höjden är antal / största antal (--v).
 * Staplarna står i en färg; den typ kortet handlar om får kopparn på stapel
 * och glyf, övriga glyfer dämpas (samma regel som TestBredd). Personlighets-
 * testet har ingen bank och därför ingen stapel.
 *
 * Serverkomponent utan hooks: ingen klient-JS, fast geometri i CSS
 * (globals.css, prefix bb-), alltså CLS noll. Läser bara den rena filen
 * bankbredd.ts, aldrig bankerna, så den kan ritas i klientkomponenter.
 */

import { TESTGLYFER, TEST_TYP_NAMN } from '@/components/illustrations/TestGlyfer'
import { BANK_MAX, BANK_PER_TYP, BANK_TYPER, BANK_VISAT, bankTal, type BankTyp } from '@/lib/tester/bankbredd'

export type { BankTyp }

export type BankbreddProps = {
  /** 'rad': 32 px tal och 40 px staplar (PaywallCard, kort, slutkort). 'platta': 48/56 px tal och 72 px staplar (stationen på /priser). */
  form: 'rad' | 'platta'
  /** Den typ kortet handlar om: kopparn på stapel och glyf, övriga glyfer dämpas. */
  markerad?: BankTyp
  /** 'ljus' (papper, panel) eller 'vagg' (bläck, premium, vägg). */
  yta?: 'ljus' | 'vagg'
  /** Följeraden. Tomt ger ingen rad. */
  text?: string
  /** Skärmläsartext. Utelämnad byggs den av talen (bankbreddLabel). */
  label?: string
  className?: string
}

const versal = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "Över 3 500 uppgifter i åtta testtyper: matrislogik 499, …, numeriskt resonemang 288", plus ", {typ} låst" när något är markerat. */
export function bankbreddLabel(markerad?: BankTyp): string {
  const lista = BANK_TYPER.map((t) => `${TEST_TYP_NAMN[t]} ${BANK_PER_TYP[t]}`).join(', ')
  return `Över ${bankTal(BANK_VISAT)} uppgifter i åtta testtyper: ${lista}${markerad ? `, ${TEST_TYP_NAMN[markerad]} låst` : ''}.`
}

export default function Bankbredd({ form, markerad, yta = 'ljus', text, label, className }: BankbreddProps) {
  return (
    <figure
      role="img"
      aria-label={label ?? bankbreddLabel(markerad)}
      className={`bb bb-${form} bb-${yta}${className ? ` ${className}` : ''}`}
    >
      <p className="bb-tal">
        <span className="bb-over">över</span>
        <b>{bankTal(BANK_VISAT)}</b>
        <span className="bb-enhet">uppgifter</span>
      </p>
      <ol className="bb-staplar" data-nagon-markerad={markerad ? '' : undefined}>
        {BANK_TYPER.map((typ) => {
          const Glyf = TESTGLYFER[typ]
          const n = BANK_PER_TYP[typ]
          return (
            <li
              key={typ}
              data-typ={typ}
              data-markerad={typ === markerad ? '' : undefined}
              style={{ '--v': (n / BANK_MAX).toFixed(3) } as React.CSSProperties}
              title={`${versal(TEST_TYP_NAMN[typ])}, ${n} uppgifter`}
            >
              <i />
              <Glyf />
            </li>
          )
        })}
      </ol>
      {text ? <figcaption className="bb-text">{text}</figcaption> : null}
    </figure>
  )
}
