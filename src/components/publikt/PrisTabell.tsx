/**
 * Jämförelsetabellen gratis mot Premium som riktig tabell med th scope.
 * Datan ur priser-data.ts (COMPARISON), så tabellen och spärrarna läser
 * samma gränser. Sidledsscroll bara inne i ramen om den inte ryms.
 */

import type { ComparisonCell, ComparisonGroup } from '@/app/(public)/priser/components/priser-data'

function Cell({ c, betald }: { c: ComparisonCell; betald?: boolean }) {
  const klass = c.ton === 'nej' ? 'pub-nej' : betald ? 'pub-prem' : undefined
  return (
    <td className={klass}>
      {c.text}
      {c.sub ? <small>{c.sub}</small> : null}
    </td>
  )
}

export default function PrisTabell({
  grupper,
  kolumner,
}: {
  grupper: readonly ComparisonGroup[]
  kolumner: { caption: string; funktion: string; gratis: string; premium: string }
}) {
  return (
    <div className="pub-tabell-ram">
      <table className="pub-tabell">
        <caption className="sr-only">{kolumner.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{kolumner.funktion}</th>
            <th scope="col">{kolumner.gratis}</th>
            <th scope="col">{kolumner.premium}</th>
          </tr>
        </thead>
        {grupper.map((g) => (
          <tbody key={g.title}>
            <tr className="pub-grupp">
              <th scope="rowgroup" colSpan={3}>
                {g.title}
              </th>
            </tr>
            {g.rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">
                  {r.label}
                  {r.sub ? <small>{r.sub}</small> : null}
                </th>
                <Cell c={r.free} />
                <Cell c={r.premium} betald />
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  )
}
