/**
 * SEO-svepet för CV-klustret 2026-11-17 (docs/plan-seo-cv-kluster-2026-11-17.md,
 * avsnitt 4.2 och 4.3): titlar högst 60 tecken, beskrivningar 110 till 158,
 * inga tankstreck, inget "mall" i exempelsidornas titlar, inga dubbletter av
 * titel eller de fem första orden i klustret, och de tio omdirigeringarna i
 * B2 som ett hopp utan kedjor.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  BESKRIVNING_MAX,
  BESKRIVNING_MIN,
  CV_MALLAR_BESKRIVNING,
  STIL_SIDOR,
  TITEL_MAX,
  exempelTitel,
  pilotBeskrivning,
  pilotTitel,
  stilMallar,
  yrkeILopptext,
  yrkesmallBeskrivning,
  yrkesmallTitel,
} from '../cv-kluster'
import { PILOT_SAMMANSLAGNA, YRKESMALL_LIST, YRKESMALL_PUBLIKA } from '@/app/(public)/cv-mallar/yrkesmall-data'
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'
import { pilotInnehall, pilotMallar, normalisera } from '@/components/publikt/innehall/exempel/pilot'
import { metadata as skapaCvMeta } from '@/app/(public)/verktyg/skapa-cv/layout'
import { metadata as exempelMeta } from '@/app/(public)/exempel/layout'
import nextConfig from '../../../../next.config'

const TANKSTRECK = new RegExp('[\\u2013\\u2014]')

/** Exempelsidornas data ur källan: slug, yrke och metaDescription. */
function exempelSidor(): { slug: string; yrke: string; beskrivning: string }[] {
  const kalla = fs.readFileSync(path.join(process.cwd(), 'src/app/(public)/cv-exempel/[yrke]/page.tsx'), 'utf8')
  const ut: { slug: string; yrke: string; beskrivning: string }[] = []
  let aktuell: { slug: string; yrke?: string; beskrivning?: string } | null = null
  for (const rad of kalla.split(/\r?\n/)) {
    const s = rad.match(/^  '([a-z0-9-]+)': \{/)
    if (s) aktuell = { slug: s[1] }
    const y = rad.match(/^    yrke: '(.*)',$/)
    if (y && aktuell) aktuell.yrke = y[1]
    const d = rad.match(/^    metaDescription: '(.*)',$/)
    if (d && aktuell) {
      aktuell.beskrivning = d[1].replace(/\\'/g, "'")
      ut.push(aktuell as { slug: string; yrke: string; beskrivning: string })
      aktuell = null
    }
  }
  return ut
}

function kontrolleraTitel(t: string) {
  expect(t.length, t).toBeLessThanOrEqual(TITEL_MAX)
  expect(t, t).not.toMatch(TANKSTRECK)
  expect(t, t).not.toMatch(/2026|!/)
}

function kontrolleraBeskrivning(d: string) {
  expect(d.length, d).toBeGreaterThanOrEqual(BESKRIVNING_MIN)
  expect(d.length, d).toBeLessThanOrEqual(BESKRIVNING_MAX)
  expect(d, d).not.toMatch(TANKSTRECK)
  expect(d, d).not.toMatch(/!/)
}

const forstaFem = (t: string) => t.toLowerCase().split(/\s+/).slice(0, 5).join(' ')

describe('yrkesmallsidorna (B6)', () => {
  it('piloten tas bort ur de publika, datan finns kvar', () => {
    expect(YRKESMALL_LIST).toHaveLength(74)
    expect(YRKESMALL_PUBLIKA).toHaveLength(YRKESMALL_LIST.length - PILOT_SAMMANSLAGNA.length)
    for (const slug of PILOT_SAMMANSLAGNA) expect(YRKESMALL_LIST.some((y) => y.slug === slug)).toBe(true)
    for (const s of ['word', 'foto', 'enkla']) expect(YRKESMALL_LIST.some((y) => y.slug === s)).toBe(false)
  })

  it.each(YRKESMALL_PUBLIKA.map((y) => [y.slug, y.namnBestamd]))('%s: titel och beskrivning', (_slug, namn) => {
    const t = yrkesmallTitel(namn)
    kontrolleraTitel(t)
    expect(t.startsWith('CV-mall för ')).toBe(true)
    expect(t).not.toMatch(/gratis nedladdning/i)
    kontrolleraBeskrivning(yrkesmallBeskrivning(namn))
  })

  it('yrket står i gemener utom förkortningar', () => {
    expect(yrkeILopptext('IT-tekniker')).toBe('IT-tekniker')
    expect(yrkeILopptext('Personlig Assistent')).toBe('personlig assistent')
    expect(yrkeILopptext('LSS-handläggare')).toBe('LSS-handläggare')
  })
})

describe('exempelsidorna (B3, B6)', () => {
  const sidor = exempelSidor()
  /** Beskrivningarna som hade ordet mall och skrevs om 2026-11-17; övriga rördes inte (B6). */
  const OMSKRIVNA = new Set([
    'butiksbitrade', 'specialistsjukskoterska', 'enhetschef', 'personlig-assistent', 'chef', 'produktchef', 'elevassistent',
    'kundradgivare', 'grundskollarare', 'fysioterapeut', 'controller', 'kassorska', 'butikschef', 'ekonom', 'scrum-master',
    'teamledare', 'lss-handlaggare', 'hotellvard', 'boendestod', 'koksbitrade', 'barista', 'terminalarbetare', 'vaktmastare',
    'socionom', 'stodpedagog', 'chauffor', 'it-tekniker', 'telefonforsaljare', 'diskare', 'snickare', 'elektriker', 'vaktare',
    'stadare',
  ])

  it('läser alla 89 exempel', () => {
    expect(sidor).toHaveLength(89)
  })

  it.each(sidor.map((s) => [s.slug, s]))('%s: titel utan mall, beskrivning inom ramen', (slug, s) => {
    const pilot = (PILOT_SAMMANSLAGNA as readonly string[]).includes(slug as string)
    const t = pilot ? pilotTitel(s.yrke) : exempelTitel(s.yrke)
    kontrolleraTitel(t)
    if (!pilot) {
      expect(t, t).not.toMatch(/mall/i)
      expect(s.beskrivning, s.beskrivning).not.toMatch(/mall/i)
      // Beskrivningar som inte innehöll "mall" rördes inte; de som skrevs om håller ramen.
      if (OMSKRIVNA.has(slug as string)) kontrolleraBeskrivning(s.beskrivning)
    } else {
      kontrolleraBeskrivning(pilotBeskrivning(s.yrke))
    }
  })

  it('pilotens fem har mallblocket med tre olika mallar och minst en gratis (P1)', () => {
    for (const slug of PILOT_SAMMANSLAGNA) {
      const mallar = pilotMallar(slug)
      expect(mallar).toHaveLength(3)
      expect(new Set(mallar.map((m) => m.id)).size).toBe(3)
      expect(mallar.some((m) => m.niva === 'gratis')).toBe(true)
      expect(mallar.some((m) => m.niva === 'premium')).toBe(true)
    }
  })

  it('pilotens frågor har inga dubbletter', () => {
    for (const slug of PILOT_SAMMANSLAGNA) {
      const p = pilotInnehall(slug, { faq: [{ fraga: 'Vad ska finnas med i ett säljar-CV?', svar: 'x' }], tips: [] })!
      const n = p.faq.map((f) => normalisera(f.q))
      expect(new Set(n).size).toBe(n.length)
    }
    expect(pilotInnehall('underskoterska', { faq: [], tips: [] })).toBeNull()
  })
})

describe('stilsidorna och hubbarna (B1, B4, B5, B7)', () => {
  it.each(Object.entries(STIL_SIDOR))('%s', (_stil, s) => {
    kontrolleraTitel(s.titel)
    kontrolleraBeskrivning(s.beskrivning)
    expect(s.titel.toLowerCase().startsWith('gratis')).toBe(false)
    expect(s.h1.toLowerCase().startsWith('gratis')).toBe(false)
  })

  it('galleriet visar bara mallar med egenskapen, talen ur katalogen', () => {
    expect(stilMallar('word').every((m) => m.word)).toBe(true)
    expect(stilMallar('foto').every((m) => m.foto)).toBe(true)
    expect(stilMallar('enkla').every((m) => m.familj === 'en-spalt')).toBe(true)
    expect(stilMallar('word')).toHaveLength(MALL_KATALOG.filter((m) => m.word).length)
    expect(STIL_SIDOR.word.titel).toContain(String(MALL_KATALOG.filter((m) => m.word).length))
    expect(STIL_SIDOR.foto.titel).toContain(String(MALL_KATALOG.filter((m) => m.foto).length))
    expect(STIL_SIDOR.enkla.titel).toContain(String(MALL_KATALOG.filter((m) => m.familj === 'en-spalt').length))
  })

  it('/cv-mallar, /verktyg/skapa-cv och /exempel', () => {
    kontrolleraBeskrivning(CV_MALLAR_BESKRIVNING)
    kontrolleraTitel(String(skapaCvMeta.title))
    kontrolleraBeskrivning(String(skapaCvMeta.description))
    expect(String(skapaCvMeta.title)).toBe('Skapa CV gratis: skriv direkt på arket, PDF eller Word')
    kontrolleraTitel(String(exempelMeta.title))
    kontrolleraBeskrivning(String(exempelMeta.description))
    expect(String(exempelMeta.title)).not.toMatch(/mall/i)
  })

  it('inga dubbletter av titel eller de fem första orden i klustret', () => {
    const titlar = [
      ...YRKESMALL_PUBLIKA.map((y) => yrkesmallTitel(y.namnBestamd)),
      ...exempelSidor().map((s) =>
        (PILOT_SAMMANSLAGNA as readonly string[]).includes(s.slug) ? pilotTitel(s.yrke) : exempelTitel(s.yrke),
      ),
      ...Object.values(STIL_SIDOR).map((s) => s.titel),
      String(skapaCvMeta.title),
    ]
    expect(new Set(titlar).size).toBe(titlar.length)
    const fem = titlar.map(forstaFem)
    const dubbletter = fem.filter((f, i) => fem.indexOf(f) !== i)
    expect(dubbletter).toEqual([])
  })
})

describe('omdirigeringarna (B2)', () => {
  const FORVANTADE: [string, string][] = [
    ['/artiklar/cv-mall-gratis-guide', '/cv-mallar'],
    ['/artiklar/cv-mall-word-gratis', '/cv-mallar/word'],
    ['/artiklar/cv-mall-pdf-gratis', '/cv-mallar'],
    ['/cv-mall-gratis-guide', '/cv-mallar'],
    ['/cv-mall-word-gratis', '/cv-mallar/word'],
    ['/cv-mallar/saljare', '/cv-exempel/saljare'],
    ['/cv-mallar/butikssaljare', '/cv-exempel/butikssaljare'],
    ['/cv-mallar/barnskotare', '/cv-exempel/barnskotare'],
    ['/cv-mallar/ingenjor', '/cv-exempel/ingenjor'],
    ['/cv-mallar/larare', '/cv-exempel/larare'],
  ]

  it('alla tio finns, permanenta, ett hopp', async () => {
    const lista = (await nextConfig.redirects!()) as { source: string; destination: string; permanent?: boolean; has?: unknown }[]
    const utanVard = lista.filter((r) => !r.has)
    for (const [fran, till] of FORVANTADE) {
      const traffar = utanVard.filter((r) => r.source === fran)
      expect(traffar, fran).toHaveLength(1)
      expect(traffar[0].destination).toBe(till)
      expect(traffar[0].permanent).toBe(true)
      // Ingen kedja: målet är inte självt en källa.
      expect(utanVard.some((r) => r.source === till), till).toBe(false)
    }
  })
})
