'use client'

import { useState } from 'react'

/**
 * Matchningsdemon: en fast exempelprofil mot fyra rekryterarsökningar. Varje
 * rad visar om profilen håller mot sökningens krav. Bara en full träff gör att
 * sökningen hittar profilen.
 */

const YOU = {
  role: 'Redovisningsekonom',
  region: 'Stockholm',
  test: { label: 'Matrislogik', pct: 10 }, // topp 10 %
  skills: ['Koncernredovisning', 'Bokslut'],
  style: 'Strukturerad',
}

type Req = { role: string; region: string; min: number; skill: string; style: string }
const SEARCHES: { name: string; req: Req }[] = [
  { name: 'Ekonomi · Stockholm', req: { role: 'Redovisningsekonom', region: 'Stockholm', min: 20, skill: 'Koncernredovisning', style: 'Strukturerad' } },
  { name: 'Annan region', req: { role: 'Redovisningsekonom', region: 'Göteborg', min: 20, skill: 'Koncernredovisning', style: 'Strukturerad' } },
  { name: 'Högre testkrav', req: { role: 'Redovisningsekonom', region: 'Stockholm', min: 5, skill: 'Bokslut', style: 'Strukturerad' } },
  { name: 'Annan arbetsstil', req: { role: 'Redovisningsekonom', region: 'Stockholm', min: 20, skill: 'Koncernredovisning', style: 'Utåtriktad' } },
]

type Row = { key: string; etikett: string; you: string; req: string; ok: boolean }

function buildRows(req: Req): Row[] {
  return [
    { key: 'role', etikett: 'Yrkesroll', you: YOU.role, req: req.role, ok: req.role === YOU.role },
    { key: 'region', etikett: 'Region', you: YOU.region, req: req.region, ok: req.region === YOU.region },
    { key: 'test', etikett: 'Test', you: `${YOU.test.label} · topp ${YOU.test.pct} %`, req: `Minst topp ${req.min} %`, ok: YOU.test.pct <= req.min },
    { key: 'skill', etikett: 'Kompetens', you: YOU.skills.join(', '), req: req.skill, ok: YOU.skills.includes(req.skill) },
    { key: 'style', etikett: 'Arbetsstil', you: YOU.style, req: req.style, ok: req.style === YOU.style },
  ]
}

export default function BliUpptacktMatchning() {
  const [sIdx, setSIdx] = useState(0)
  const rows = buildRows(SEARCHES[sIdx].req)
  const matched = rows.filter((r) => r.ok).length
  const allMatch = matched === rows.length

  return (
    <section aria-label="Så här matchas du" className="scroll-mt-24">
      <p className="text-steg uppercase text-ink-3">Så här matchas du</p>
      <h2 className="mt-2 text-h2-pub text-ink-1">Rekryteraren hittar dig för att du passar</h2>
      <p className="mt-3 max-w-[60ch] text-base leading-[27px] text-ink-2">
        När en rekryterare söker i kandidatpoolen jämför vi din profil, dina testresultat och din arbetsstil med det
        rekryteraren letar efter. Välj en sökning nedan och se att bara det som stämmer räknas som träff.
      </p>

      <div className="mt-6 rounded-xl border border-kant bg-panel p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Välj en sökning">
          <span className="mr-1 text-meta text-ink-3">Välj en sökning:</span>
          {SEARCHES.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setSIdx(i)}
              aria-pressed={i === sIdx}
              className={`inline-flex min-h-11 items-center rounded-lg border px-3 text-sm font-medium transition-colors ${
                i === sIdx ? 'border-ink-1 bg-ink-1 text-white' : 'border-kant-stark bg-panel text-ink-1 hover:bg-insunken'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-kant">
          <div className="hidden grid-cols-[120px_1fr_1fr_88px] gap-4 border-b border-kant bg-insunken px-4 py-2 text-steg uppercase text-ink-3 sm:grid">
            <span>Krav</span>
            <span>Din profil</span>
            <span>Rekryterarens sökning</span>
            <span className="text-right">Läge</span>
          </div>
          <ul className="divide-y divide-kant" aria-live="polite">
            {rows.map((r) => (
              <li key={r.key} className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[120px_1fr_1fr_88px] sm:items-center">
                <span className="text-meta text-ink-3">{r.etikett}</span>
                <span className={`text-right text-meta font-medium sm:order-last ${r.ok ? 'text-positiv' : 'text-ink-3'}`}>
                  {r.ok ? 'Stämmer' : 'Stämmer inte'}
                </span>
                <span className="text-sm text-ink-1">{r.you}</span>
                <span className={`text-sm ${r.ok ? 'text-ink-1' : 'text-ink-3 line-through'}`}>{r.req}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-sm font-medium text-ink-1">
          {allMatch
            ? 'Full träff. Din profil syns för den här rekryteraren.'
            : `${matched} av ${rows.length} stämmer. Den här sökningen hittar dig inte.`}
        </p>
        <p className="mt-1 text-meta text-ink-3">
          Bara rekryterare vars sökning matchar din profil ser dig. Ingen bläddrar bland alla.
        </p>
      </div>
    </section>
  )
}
