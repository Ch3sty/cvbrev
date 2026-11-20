// Lägesreglerna (plan-testflode-2026-11-20 avsnitt 2) och ordlistan (6):
// flaggorna per läge, och att ramens texter håller skrivreglerna.

import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { harTillbaka, lagesregler, sistaKnapp } from '../lagesregler'
import { SESSION } from '../copy'

describe('lägesreglerna', () => {
  it('Nivåkollen: tyst, linjär, ingen klocka, inget hopp', () => {
    expect(lagesregler('nivakoll')).toEqual({ aterkoppling: 'efter', navigering: 'linjar', tid: 'ingen', hopp: 'nej', gest: 'bekrafta', facit: true })
  })
  it('nivåtest: fri navigering, mjuk gräns, hopp tillåtet', () => {
    expect(lagesregler('nivatest')).toEqual({ aterkoppling: 'efter', navigering: 'fri', tid: 'mjuk', hopp: 'ja', gest: 'bekrafta', facit: true })
    expect(harTillbaka(lagesregler('nivatest'))).toBe(true)
  })
  it('Träna: direkt med förklaringen på, efter med den av, alltid samma gest', () => {
    expect(lagesregler('trana').aterkoppling).toBe('direkt')
    expect(lagesregler('trana', { forklaringEfterSvar: false }).aterkoppling).toBe('efter')
    expect(lagesregler('trana', { forklaringEfterSvar: false }).gest).toBe('bekrafta')
    expect(lagesregler('trana').hopp).toBe('vet_inte')
    expect(lagesregler('trana').tid).toBe('referens')
  })
  it('övningsprov: hård gräns, fri utom i adaptiva format', () => {
    expect(lagesregler('ovningsprov').tid).toBe('hard')
    expect(lagesregler('ovningsprov', { adaptiv: true }).navigering).toBe('linjar')
  })
  it('bara personlighet har ett tryck', () => {
    for (const l of ['nivakoll', 'nivatest', 'trana', 'ovningsprov', 'iprov'] as const) expect(lagesregler(l).gest).toBe('bekrafta')
    expect(lagesregler('personlighet').gest).toBe('ett_tryck')
  })
  it('publikt: ingen klocka, inget facit, ingen väg tillbaka, Visa resultatet sist', () => {
    expect(lagesregler('publikt')).toEqual({ aterkoppling: 'efter', navigering: 'linjar', tid: 'ingen', hopp: 'nej', gest: 'bekrafta', facit: false })
    expect(harTillbaka(lagesregler('publikt'))).toBe(false)
    expect(sistaKnapp('publikt')).toBe('visa_resultatet')
    expect(SESSION.avbryt.titel('publikt')).toBe('Avbryta provet?')
    expect(SESSION.avbryt.text('publikt')).toBe('Inget sparas.')
  })
  it('sista knappen', () => {
    expect(sistaKnapp('nivakoll')).toBe('visa_resultatet')
    expect(sistaKnapp('trana')).toBe('visa_resultatet')
    expect(sistaKnapp('nivatest')).toBe('lamna_in')
    expect(sistaKnapp('ovningsprov')).toBe('lamna_in')
  })
})

describe('ordlistan', () => {
  it('avbryt- och inlämningsdialogen', () => {
    expect(SESSION.avbryt.titel('nivatest')).toBe('Avbryta nivåtestet?')
    expect(SESSION.avbryt.titel('trana')).toBe('Avbryta träningen?')
    expect(SESSION.avbryt.titel('nivakoll')).toBe('Avbryta Nivåkollen?')
    expect(SESSION.avbryt.text('nivatest')).toBe('Dina svar sparas. Du kan fortsätta från startsidan.')
    expect(SESSION.avbryt.text('ovningsprov')).toBe('Avbryter du sparas inget resultat.')
    expect(SESSION.lamnaIn.text(3)).toBe('3 uppgifter är obesvarade och räknas som fel.')
    expect(SESSION.lamnaIn.text(0)).toBe('Alla uppgifter är besvarade.')
  })
  it('undertiteln', () => {
    expect(SESSION.undertitel('nivatest', 'grund')).toBe('Nivåtest, grundnivå')
    expect(SESSION.undertitel('trana', 'avancerad')).toBe('Träna, avancerad nivå')
    expect(SESSION.undertitel('nivakoll')).toBe('Nivåkollen')
    expect(SESSION.undertitel('ovningsprov', null, 'Aon scales ix')).toBe('Övningsprov, samma format som Aon scales ix')
  })

  it('inga talstreck, inga mittpunkter och aldrig "pass" i ramens användartext', () => {
    const rot = path.resolve(__dirname, '..')
    const filer: string[] = []
    const gå = (d: string) => {
      for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f)
        if (f === '__tests__') continue
        if (fs.statSync(p).isDirectory()) gå(p)
        else if (/\.(tsx?|css)$/.test(f)) filer.push(p)
      }
    }
    gå(rot)
    for (const fil of filer) {
      const kod = fs.readFileSync(fil, 'utf8')
      // Strängar i användartext: '...', "...", `...` och JSX-text.
      const strangar = [...kod.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`|>([^<>{}\n]+)</g)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4] ?? '')
      for (const s of strangar) {
        expect(s.includes('—'), `${fil}: ${s}`).toBe(false)
        expect(/\s·\s/.test(s), `${fil}: ${s}`).toBe(false)
        if (/[A-ZÅÄÖa-zåäö]/.test(s) && /\s/.test(s)) expect(/\bpass(et|en)?\b/i.test(s), `${fil}: ${s}`).toBe(false)
      }
    }
  })

  it('inga lucide-ikoner och aldrig Sparkles i sessionen', () => {
    const rot = path.resolve(__dirname, '..')
    const sok = (d: string): string[] =>
      fs.readdirSync(d).flatMap((f) => {
        const p = path.join(d, f)
        if (f === '__tests__') return []
        return fs.statSync(p).isDirectory() ? sok(p) : /\.tsx?$/.test(f) ? [fs.readFileSync(p, 'utf8')] : []
      })
    for (const kod of sok(rot)) {
      expect(kod.includes("from 'lucide-react'")).toBe(false)
      expect(kod.includes('Sparkles')).toBe(false)
    }
  })
})
