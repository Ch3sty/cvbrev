'use client'

import { useState } from 'react'

/**
 * Matchningsdemon: en fast exempelprofil mot fyra rekryterarsökningar. Varje
 * rad visar om profilen håller mot sökningens krav. Bara en full träff gör att
 * sökningen hittar profilen.
 *
 * Publikt omgång 3 (skissen bli-upptackt): tabellen är ett möte, profilen
 * till vänster och sökningen till höger med en bock mellan varje par.
 * Exemplet är Sara Lindström, projektledare i Västra Götaland. Allt för
 * första sökningen står i serverns HTML. Klasserna bu- står i
 * bli-upptackt.css.
 */

const YOU = {
  role: 'Projektledare',
  region: 'Västra Götaland',
  test: { label: 'Matrislogik', pct: 15 }, // topp 15 %
  skills: ['LOU', 'budgetansvar'],
  style: 'Strukturerad',
}

type Req = { role: string; region: string; min: number; skill: string; style: string }
const SEARCHES: { name: string; req: Req }[] = [
  { name: 'Bygg, Västra Götaland', req: { role: 'Projektledare', region: 'Västra Götaland', min: 20, skill: 'LOU', style: 'Strukturerad' } },
  { name: 'Annan region', req: { role: 'Projektledare', region: 'Stockholm', min: 20, skill: 'LOU', style: 'Strukturerad' } },
  { name: 'Högre testkrav', req: { role: 'Projektledare', region: 'Västra Götaland', min: 5, skill: 'budgetansvar', style: 'Strukturerad' } },
  { name: 'Annan arbetsstil', req: { role: 'Projektledare', region: 'Västra Götaland', min: 20, skill: 'LOU', style: 'Utåtriktad' } },
]

type Row = { key: string; etikett: string; sokEtikett: string; you: string; req: string; ok: boolean }

function buildRows(req: Req): Row[] {
  return [
    { key: 'role', etikett: 'Yrkesroll', sokEtikett: 'Söker roll', you: YOU.role, req: req.role, ok: req.role === YOU.role },
    { key: 'region', etikett: 'Region', sokEtikett: 'I region', you: YOU.region, req: req.region, ok: req.region === YOU.region },
    { key: 'test', etikett: 'Test', sokEtikett: 'Test, minst', you: `${YOU.test.label}, topp ${YOU.test.pct} %`, req: `Minst topp ${req.min} %`, ok: YOU.test.pct <= req.min },
    { key: 'skill', etikett: 'Kompetens', sokEtikett: 'Kompetens', you: YOU.skills.join(', '), req: req.skill, ok: YOU.skills.includes(req.skill) },
    { key: 'style', etikett: 'Arbetsstil', sokEtikett: 'Arbetsstil', you: YOU.style, req: req.style, ok: req.style === YOU.style },
  ]
}

function Bock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 12.5l3.8 3.8 7.4-8.3" />
    </svg>
  )
}

function Streck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M7 12h10" />
    </svg>
  )
}

export default function BliUpptacktMatchning() {
  const [sIdx, setSIdx] = useState(0)
  const rows = buildRows(SEARCHES[sIdx].req)
  const matched = rows.filter((r) => r.ok).length
  const allMatch = matched === rows.length

  return (
    <section aria-label="Så här matchas du" className="bu-matchning">
      <div className="p3-sekt-huvud">
        <p className="p3-ey">Så här matchas du</p>
        <h2 className="p3-h2">Rekryteraren hittar dig för att du passar</h2>
        <p className="p3-varde">
          När en rekryterare söker i kandidatpoolen jämför vi din profil, dina testresultat och din arbetsstil med det
          rekryteraren letar efter. Välj en sökning nedan och se att bara det som stämmer räknas som träff.
        </p>
        <div className="bu-sokval" role="group" aria-label="Välj en sökning">
          <span>Välj en sökning:</span>
          {SEARCHES.map((s, i) => (
            <button key={s.name} type="button" onClick={() => setSIdx(i)} aria-pressed={i === sIdx}>
              {s.name}
            </button>
          ))}
        </div>
        <p className="p3-liten">Bara rekryterare vars sökning matchar din profil ser dig. Ingen bläddrar bland alla.</p>
      </div>

      <div className="bu-mote" aria-live="polite">
        <div className="bu-mote-huvud">
          <span>Din profil</span>
          <span />
          <span>Rekryterarens sökning</span>
        </div>
        {rows.map((r) => (
          <div key={r.key} className={`bu-mote-rad ${r.ok ? '' : 'bu-ej'}`.trim()}>
            <div>
              <small>{r.etikett}</small>
              {r.you}
            </div>
            <i>
              {r.ok ? <Bock /> : <Streck />}
              <span className="sr-only">{r.ok ? 'Stämmer' : 'Stämmer inte'}</span>
            </i>
            <div>
              <small>{r.sokEtikett}</small>
              {r.req}
            </div>
          </div>
        ))}
        <p className={`bu-mote-svar ${allMatch ? '' : 'bu-ej'}`.trim()}>
          <b>
            {allMatch
              ? 'Full träff. Din profil syns för den här rekryteraren.'
              : `${matched} av ${rows.length} stämmer. Den här sökningen hittar dig inte.`}
          </b>
        </p>
      </div>
    </section>
  )
}
