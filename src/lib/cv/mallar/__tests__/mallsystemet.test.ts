/**
 * Mallsystemet: katalog och register hänger ihop, gamla id löses till en
 * mall som finns, och renderarens HTML är semantisk och ATS-säker
 * (docs/plan-mallar-2026-11-15.md avsnitt 4 och 7).
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'
import { MALL_KATALOG, getMallKort, FORVALD_MALL_ID, GRATIS_MALL_IDS } from '../katalog'
import { MALL_ALIAS, losMallId, losMallIdEllerForval } from '../alias'
import { MALLAR, getMall } from '../register'
import { renderDefHtml, renderMallHtml, tidsaxelHtml } from '../render/html'
import { byggDokument, ordna, periodErfarenhet, periodUtbildning, datum } from '../innehall'
import { tolkaVal, tolkaValUrQuery, typsnittIdForFamilj } from '../val'
import { YRKE_TILL_MALLAR } from '@/app/(public)/cv-mallar/yrkesmall-data'
import { CV_LANGDER, NORMALT_CV } from '../../word/__tests__/fixtures'

const ROT = path.resolve(__dirname, '../../../../..')

/** De 41 mallarna i registret före 2026-11-16. */
const GAMLA_41 = [
  'norrsken', 'aurora', 'atlas', 'galleri', 'pedagog', 'aspekt', 'klinik', 'skymning', 'disk', 'logistik',
  'verkstad', 'myndighet', 'konto', 'disk-plus', 'logistik-plus', 'verkstad-plus', 'myndighet-plus', 'konto-plus',
  'norrsken-plus', 'tidlos-plus', 'stack-plus', 'hantverkare-plus', 'student-plus', 'sidopanel-plus', 'bygg',
  'forskare', 'servering', 'linje', 'spektrum', 'kvist', 'magasin', 'karta', 'avtryck', 'sidebar-icons',
  'editorial-magazine', 'tidlos-formell', 'konsult-kompakt', 'stack-developer', 'bold-modern', 'student-startup',
  'varden-omsorg',
]

/**
 * Id som finns i formatted_cv_downloads (prod, 2026-11-16) men inte bland de
 * 41. Fast lista: inga databasanrop i CI.
 */
const FRAN_DATABASEN = [
  'modern-minimal', 'classic-professional', 'platinum-executive', 'clean-corporate', 'creative-edge',
  'executive-premium', 'creative-minimal',
]

/** De gamla gratismallarna: deras efterföljare måste också vara gratis. */
const GAMLA_GRATIS = ['norrsken', 'student-startup', 'sidebar-icons']

function walk(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '.next') continue
    const full = path.join(dir, e)
    if (statSync(full).isDirectory()) walk(full, acc)
    else acc.push(full)
  }
  return acc
}

describe('katalogen och registret', () => {
  it('samma id i samma ordning, unika', () => {
    expect(MALLAR.map((m) => m.id)).toEqual(MALL_KATALOG.map((m) => m.id))
    expect(new Set(MALL_KATALOG.map((m) => m.id)).size).toBe(MALL_KATALOG.length)
  })

  it('kortet och definitionen säger samma sak', () => {
    for (const k of MALL_KATALOG) {
      const d = getMall(k.id)!
      expect(d.namn).toBe(k.namn)
      expect(d.niva).toBe(k.niva)
      expect(d.word).toBe(k.word)
      expect(d.accenter).toEqual(k.accenter)
      expect(Boolean(d.foto)).toBe(k.foto)
      expect(k.kort.split(/\s+/).length).toBeLessThanOrEqual(4)
      // Word-mallar har ingen egen CSS och bara Word-typsnitt.
      if (d.word) expect(d.extraCss).toBeUndefined()
    }
  })

  it('id i gemener utan å, ä, ö och minst en gratismall', () => {
    for (const k of MALL_KATALOG) expect(k.id).toMatch(/^[a-z0-9-]+$/)
    expect(GRATIS_MALL_IDS.length).toBeGreaterThan(0)
    expect(getMallKort(FORVALD_MALL_ID)?.niva).toBe('gratis')
  })
})

describe('alias', () => {
  it('varje gammalt id löses till en mall som finns', () => {
    for (const id of [...GAMLA_41, ...FRAN_DATABASEN]) {
      expect(MALL_ALIAS[id], id).toBeDefined()
      const ny = losMallId(id)
      expect(ny, id).not.toBeNull()
      expect(getMallKort(ny), id).toBeDefined()
    }
  })

  it('en gammal gratismall pekar på en gratismall', () => {
    for (const id of GAMLA_GRATIS) expect(getMallKort(losMallId(id))?.niva, id).toBe('gratis')
  })

  it('aliaskartan pekar bara på mallar som finns', () => {
    for (const [gammal, ny] of Object.entries(MALL_ALIAS)) expect(getMallKort(ny), `${gammal} -> ${ny}`).toBeDefined()
  })

  it('yrkesdatan pekar bara på id som löses', () => {
    for (const [yrke, { free, premium }] of Object.entries(YRKE_TILL_MALLAR)) {
      expect(losMallId(free), `${yrke} free ${free}`).not.toBeNull()
      expect(losMallId(premium), `${yrke} premium ${premium}`).not.toBeNull()
    }
  })

  it('artiklarnas och sidornas ?mall= löses', () => {
    const filer = [...walk(path.join(ROT, 'content')), ...walk(path.join(ROT, 'src'))].filter(
      (f) => /\.(mdx?|tsx?)$/.test(f) && !f.includes('__tests__') && !f.includes(`${path.sep}api${path.sep}public${path.sep}exempel${path.sep}brev`)
    )
    const hittade = new Set<string>()
    for (const f of filer) {
      for (const m of readFileSync(f, 'utf8').matchAll(/[?&]mall=([a-z0-9-]+)/g)) hittade.add(m[1])
    }
    for (const id of hittade) expect(losMallId(id), `?mall=${id}`).not.toBeNull()
  })

  it('id som redan finns returneras som de är, okända ger null eller förval', () => {
    for (const k of MALL_KATALOG) expect(losMallId(k.id)).toBe(k.id)
    expect(losMallId('finns-inte')).toBeNull()
    expect(losMallId('')).toBeNull()
    expect(losMallId(undefined)).toBeNull()
    expect(losMallIdEllerForval('finns-inte')).toBe(FORVALD_MALL_ID)
  })
})

describe('innehållet', () => {
  it('perioderna skrivs som i ett svenskt CV', () => {
    expect(periodErfarenhet({ position: 'a', company: 'b', startDate: '2021', description: [] })).toBe('2021 – Pågående')
    expect(periodErfarenhet({ position: 'a', company: 'b', startDate: '2018', endDate: '2021', description: [] })).toBe('2018 – 2021')
    expect(periodErfarenhet({ position: 'a', company: 'b', startDate: '2021-03', endDate: 'present', description: [] })).toBe('mar 2021 – Pågående')
    // Aldrig "2018 – 2018": examensåret är bara reserv för slutet.
    expect(periodUtbildning({ degree: 'a', institution: 'b', graduationYear: '2018', endDate: '2018' })).toBe('2018')
    expect(periodUtbildning({ degree: 'a', institution: 'b', startDate: '2015', graduationYear: '2018' })).toBe('2015 – 2018')
    expect(datum('2020-13')).toBe('2020')
  })

  it('ordningsvalen flyttar avsnittet direkt efter profilen', () => {
    const bas = ['profil', 'erfarenhet', 'utbildning', 'kompetenser', 'intyg', 'sprak'] as const
    expect(ordna(bas, 'intyg')).toEqual(['profil', 'intyg', 'erfarenhet', 'utbildning', 'kompetenser', 'sprak'])
    expect(ordna(bas, 'utbildning')).toEqual(['profil', 'utbildning', 'erfarenhet', 'kompetenser', 'intyg', 'sprak'])
    expect(ordna(bas, 'standard')).toEqual([...bas])
    expect(ordna(['erfarenhet', 'intyg'], 'intyg')).toEqual(['intyg', 'erfarenhet'])
  })

  it('inget innehåll tappas: varje avsnitt med innehåll finns i någon spalt', () => {
    for (const def of MALLAR) {
      const dok = byggDokument(NORMALT_CV, def)
      const alla = [...dok.fullBredd, ...dok.huvudspalt, ...dok.sidospalt].map((a) => a.sektion)
      for (const s of ['profil', 'erfarenhet', 'utbildning', 'kompetenser', 'intyg', 'sprak', 'referenser']) {
        expect(alla, `${def.id} ${s}`).toContain(s)
      }
      expect(new Set(alla).size).toBe(alla.length)
    }
  })
})

describe('HTML:en', () => {
  const tolka = (html: string) => new DOMParser().parseFromString(html, 'text/html')

  for (const def of MALLAR) {
    describe(def.id, () => {
      for (const [langd, cv] of Object.entries(CV_LANGDER)) {
        it(`${langd}: namnet först, data-falt, avsnitt och poster`, () => {
          const doc = tolka(renderDefHtml(cv, def))
          expect(doc.documentElement.getAttribute('data-mall')).toBe(def.id)
          expect(doc.documentElement.lang).toBe('sv')
          const h1 = doc.querySelectorAll('h1')
          expect(h1).toHaveLength(1)
          expect(h1[0].getAttribute('data-falt')).toBe('namn')
          expect(h1[0].textContent).toBe(cv.personalInfo.fullName)
          // Namnet är första texten i dokumentet.
          const forstaText = doc.body.textContent!.trim()
          expect(forstaText.startsWith(cv.personalInfo.fullName), forstaText.slice(0, 60)).toBe(true)
          expect(doc.querySelector('[data-falt="titel"]')?.textContent).toBe(cv.personalInfo.title ?? '')
          // Varje h2 sitter i sitt avsnitt med samma sektion.
          for (const h2 of Array.from(doc.querySelectorAll('h2'))) {
            const s = h2.getAttribute('data-sektion')
            expect(s).toBeTruthy()
            expect(h2.closest('section')?.getAttribute('data-avsnitt')).toBe(s)
          }
          expect(doc.querySelectorAll('[data-post]').length).toBe(
            cv.experience.length + cv.education.length + (cv.projects?.length ?? 0)
          )
          // Inget absolut placerat (utom tidsaxelns punkter), ingen gradienttext.
          const css = doc.querySelector('style')!.textContent ?? ''
          expect(css).not.toMatch(/background-clip:\s*text/)
          if (!def.tidsaxel) expect(css).not.toMatch(/position:\s*absolute/)
        })
      }

      it('initialen i tom fotoplats bara i förhandsvisningen', () => {
        const cv = structuredClone(NORMALT_CV)
        delete cv.personalInfo.profilePhotoUrl
        const pdf = renderDefHtml(cv, def, { foto: true })
        expect(pdf).not.toMatch(/class="[^"]*foto-tom/)
        const forhand = renderDefHtml(cv, def, { foto: true }, { forhandsvisning: true })
        expect(/class="[^"]*foto-tom/.test(forhand)).toBe(Boolean(def.foto))
      })

      it('foto av lämnar ingen fotoplats', () => {
        const cv = structuredClone(NORMALT_CV)
        cv.personalInfo.profilePhotoUrl = 'https://exempel.se/foto.jpg'
        expect(renderDefHtml(cv, def, { foto: false }, { forhandsvisning: true })).not.toContain('class="foto')
        expect(renderDefHtml(cv, def, { foto: true }).includes('https://exempel.se/foto.jpg')).toBe(Boolean(def.foto))
      })

      it('valda rubriker och vald accent syns', () => {
        const html = renderDefHtml(NORMALT_CV, def, { rubriker: { erfarenhet: 'Mina anställningar' }, farg: 2 })
        expect(html).toContain('>Mina anställningar</h2>')
        expect(html.toLowerCase()).toContain(def.accenter[2].toLowerCase())
      })
    })
  }

  it('renderMallHtml löser gamla id', () => {
    expect(renderMallHtml(NORMALT_CV, 'norrsken')).toContain(`data-mall="${losMallId('norrsken')}"`)
  })

  it('text escapas', () => {
    const cv = structuredClone(NORMALT_CV)
    cv.personalInfo.fullName = 'Ada <script>alert(1)</script>'
    expect(renderDefHtml(cv, MALLAR[0])).not.toContain('<script>alert')
  })
})

describe('valen', () => {
  it('tolkaVal släpper bara giltiga värden', () => {
    expect(tolkaVal({ ordning: 'intyg', farg: 3, typsnitt: 'garamond', foto: false, enSida: true, uppsattning: 'vard' })).toEqual({
      ordning: 'intyg',
      farg: 3,
      typsnitt: 'garamond',
      foto: false,
      enSida: true,
      uppsattning: 'vard',
    })
    expect(tolkaVal({ ordning: 'x', farg: 9, typsnitt: 'comic', uppsattning: 'x' })).toEqual({})
    expect(tolkaVal(null, { includePhoto: true, fontId: 'arial' })).toEqual({ foto: true, typsnitt: 'arial' })
  })

  it('query: rubriker som uppsättning eller JSON', () => {
    expect(tolkaValUrQuery(new URLSearchParams('rubriker=it&farg=1')).uppsattning).toBe('it')
    expect(tolkaValUrQuery(new URLSearchParams('rubriker={"profil":"Om mig"}')).rubriker).toEqual({ profil: 'Om mig' })
    expect(tolkaValUrQuery(new URLSearchParams('farg=1')).farg).toBe(1)
  })

  it('typsnittets id ur en CSS-stack', () => {
    expect(typsnittIdForFamilj("'Open Sans', Arial, sans-serif")).toBe('open-sans')
    expect(typsnittIdForFamilj("'Times New Roman', Times, serif")).toBe('times')
    expect(typsnittIdForFamilj('Comic Sans')).toBeUndefined()
  })
})

describe('foto av', () => {
  it('fotomallar utan foto i CV:t ger ingen bild i PDF:ens HTML', () => {
    for (const def of MALLAR.filter((m) => m.foto)) {
      const cv = structuredClone(NORMALT_CV)
      delete cv.personalInfo.profilePhotoUrl
      const html = renderDefHtml(cv, def, {})
      expect(html, def.id).not.toMatch(/<img/)
      expect(html, def.id).not.toMatch(/class="[^"]*foto-tom/)
    }
  })
})

describe('Horisonts tidsaxel', () => {
  it('inga etiketter överlappar på samma rad, också i långt CV', () => {
    const def = getMall('horisont')!
    for (const cv of Object.values(CV_LANGDER)) {
      const punkter = byggDokument(cv, def).tidsaxel
      if (punkter.length < 2) continue
      const { lagen } = tidsaxelHtml(punkter, 170)
      for (let i = 0; i < lagen.length; i++) {
        for (let j = i + 1; j < lagen.length; j++) {
          if (lagen[i].rad !== lagen[j].rad) continue
          const overlapp = lagen[i].fran < lagen[j].till + 2 && lagen[j].fran < lagen[i].till + 2
          expect(overlapp, `${cv.personalInfo.fullName}: etikett ${i} och ${j}`).toBe(false)
        }
      }
    }
  })
})
