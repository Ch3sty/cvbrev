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
      className={`py-2 px-3 text-sm align-top ${
        isNo ? 'text-neutral-400' : strong ? 'text-neutral-900 font-medium' : 'text-neutral-600'
      }`}
    >
      {value}
    </td>
  )
}

export default function GratisMotPremium() {
  return (
    <section className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
        Gratis mot Premium
      </h2>
      <p className="text-sm text-neutral-600 mt-1">{COMPARISON_INTRO}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2 px-3 text-left text-sm font-semibold text-neutral-900 w-1/2">
                Funktion
              </th>
              <th className="py-2 px-3 text-left text-sm font-semibold text-neutral-600">
                Gratis
              </th>
              <th className="py-2 px-3 text-left text-sm font-semibold text-orange-700">
                Premium
              </th>
            </tr>
          </thead>
          {COMPARISON.map((group) => (
            <tbody key={group.title}>
              <tr>
                <td
                  colSpan={3}
                  className="pt-4 pb-1 px-3 text-xs font-semibold uppercase tracking-wide text-neutral-500"
                >
                  {group.title}
                </td>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2 px-3 text-sm text-neutral-700">{row.label}</td>
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
