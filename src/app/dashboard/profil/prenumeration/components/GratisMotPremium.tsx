'use client'

/**
 * Jämförelse gratis mot Premium, inne i appen (A8).
 *
 * Delar datakällan med publika prissidan så raderna aldrig glider isär.
 * Kompaktare än den publika tabellen: ingen flikväxling, ingen hero, bara
 * de fakta som avgör om det är värt att uppgradera.
 */

import { COMPARISON, COMPARISON_INTRO } from '@/app/(public)/priser/components/priser-data'

function Cell({ value, strong }: { value: string; strong?: boolean }) {
  const isNo = value.toLowerCase() === 'nej'
  return (
    <td
      className={`px-3 py-2 align-top text-sm ${
        isNo ? 'text-ink-3' : strong ? 'font-medium text-ink-1' : 'text-ink-2'
      }`}
    >
      {value}
    </td>
  )
}

export default function GratisMotPremium() {
  return (
    <section className="rounded-xl border border-kant bg-panel p-4">
      <h2 className="text-kort text-ink-1">Gratis mot Premium</h2>
      <p className="mt-1 text-sm text-ink-2">{COMPARISON_INTRO}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr className="border-b border-kant">
              <th className="w-1/2 px-3 py-2 text-left text-sm font-medium text-ink-1">
                Funktion
              </th>
              <th className="px-3 py-2 text-left text-sm font-medium text-ink-2">Gratis</th>
              <th className="px-3 py-2 text-left text-sm font-medium text-ink-1">Premium</th>
            </tr>
          </thead>
          {COMPARISON.map((group) => (
            <tbody key={group.title}>
              <tr>
                <td colSpan={3} className="px-3 pb-1 pt-4 text-steg uppercase text-ink-3">
                  {group.title}
                </td>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-b border-kant last:border-0">
                  <td className="px-3 py-2 text-sm text-ink-2">{row.label}</td>
                  <Cell value={row.free} />
                  <Cell value={row.premium} strong />
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  )
}
