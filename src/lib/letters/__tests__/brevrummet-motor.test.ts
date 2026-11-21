import { describe, expect, it } from 'vitest'
import { avdubblaBrev, arBrevLast, brevlista, oppnaBrevIds } from '../lista'
import { brevetsVag, nastaSteg, stortTalForBrev } from '../lage'
import {
  citatFinns,
  hittaCitat,
  kravMatt,
  kravMedTraffar,
  laggTillMening,
  stadaKravText,
  valideraKrav,
} from '../krav'
import { brevSomText, raknaOrd, styckenForBrev, styckenFranContent, styckenFranText, tolkaStycken } from '../stycken'
import { brevDataFranBrev } from '../brevData'
import { premiumSparr, startmallForBrev, cvMallUrStrukturerad, farSparaMall } from '../brevRegler'
import { slaIhopAndring, tolkaBrevAndring } from '../brevAndring'
import { brevKvot, brevKvotEfterSkrivning, formatGratisbrevDag } from '../brevKvot'
import { ritaBrevHtml } from '../ritaBrev'
import { getDocxTemplate } from '../docx-templates'

const rad = (id: string, updated: string, extra: Record<string, unknown> = {}) => ({
  id,
  is_saved: true,
  job_description: null as string | null,
  updated_at: updated,
  created_at: updated,
  ...extra,
})

describe('listan Dina brev', () => {
  it('sorterar senast uppdaterade först', () => {
    const ut = avdubblaBrev([rad('a', '2026-11-01'), rad('b', '2026-11-03'), rad('c', '2026-11-02')])
    expect(ut.map((r) => r.id)).toEqual(['b', 'c', 'a'])
  })

  it('visar bara den senaste osparade raden per annons, sparade alltid', () => {
    const ut = avdubblaBrev([
      rad('gammal', '2026-11-01', { is_saved: false, job_description: 'Annons A' }),
      rad('ny', '2026-11-02', { is_saved: false, job_description: '  Annons A\n' }),
      rad('sparad', '2026-11-01T10:00:00Z', { is_saved: true, job_description: 'Annons A' }),
      rad('annan', '2026-10-01', { is_saved: false, job_description: 'Annons B' }),
      rad('tom1', '2026-09-01', { is_saved: false, job_description: '' }),
      rad('tom2', '2026-09-02', { is_saved: null, job_description: null }),
    ])
    expect(ut.map((r) => r.id)).toEqual(['ny', 'sparad', 'annan', 'tom2', 'tom1'])
  })

  it('gratis: de två senast uppdaterade efter avdubbleringen är öppna', () => {
    const rader = [
      rad('a', '2026-11-05', { is_saved: false, job_description: 'X' }),
      rad('b', '2026-11-04', { is_saved: false, job_description: 'X' }),
      rad('c', '2026-11-03'),
      rad('d', '2026-11-02'),
    ]
    expect([...oppnaBrevIds(rader, false)].sort()).toEqual(['a', 'c'])
    expect(arBrevLast('b', rader, false)).toBe(true) // gömd dubblett
    expect(arBrevLast('c', rader, false)).toBe(false)
    expect(arBrevLast('d', rader, false)).toBe(true)
    expect(brevlista(rader, false).map((r) => [r.id, r.isLocked])).toEqual([
      ['a', false],
      ['c', false],
      ['d', true],
    ])
  })

  it('Premium: inget är låst', () => {
    const rader = [rad('a', '2026-11-05'), rad('b', '2026-11-04'), rad('c', '2026-11-03')]
    expect(arBrevLast('c', rader, true)).toBe(false)
    expect(brevlista(rader, true).every((r) => !r.isLocked)).toBe(true)
  })

  it('updated_at saknas: created_at räknas', () => {
    const ut = avdubblaBrev([
      { id: 'x', updated_at: null, created_at: '2026-11-10' },
      { id: 'y', updated_at: '2026-11-09', created_at: '2026-11-01' },
    ])
    expect(ut.map((r) => r.id)).toEqual(['x', 'y'])
  })
})

describe('stycken', () => {
  it('delar på tomma rader, annars på rader', () => {
    expect(styckenFranText('Ett.\n\nTvå\nmed radbrytning.\n\n\nTre.')).toEqual(['Ett.', 'Två med radbrytning.', 'Tre.'])
    expect(styckenFranText('Ett.\nTvå.\n')).toEqual(['Ett.', 'Två.'])
    expect(styckenFranText('**Fet** text.')).toEqual(['Fet text.'])
    expect(styckenFranText(null)).toEqual([])
  })

  it('läser styckena ur ett gammalt brevs HTML', () => {
    const html = getDocxTemplate('classic').generateHTML(
      { full_name: 'Anna Berg', email: 'anna@exempel.se', phone: null, location: null, include_phone_in_letters: false, include_location_in_letters: false },
      { title: 'Ansökan', company: 'Nordanvind', position: 'Projektledare' },
      'Första stycket &amp; mer.\nAndra stycket.'
    )
    expect(styckenFranContent(html)).toEqual(['Första stycket & mer.', 'Andra stycket.'])
  })

  it('ren text från det publika utkastet', () => {
    expect(styckenFranContent('Hej!\n\nJag söker tjänsten.')).toEqual(['Hej!', 'Jag söker tjänsten.'])
  })

  it('sparade stycken går före content', () => {
    expect(styckenForBrev({ body_stycken: ['A'], content: '<div class="body-content"><p>B</p></div><style>' })).toEqual(['A'])
    expect(styckenForBrev({ body_stycken: null, content: '<style></style><div class="body-content"><p>B</p></div>' })).toEqual(['B'])
  })

  it('validerar stycken från klienten', () => {
    expect(tolkaStycken(['  a  b ', '', 'c'])).toEqual(['a b', 'c'])
    expect(tolkaStycken('a')).toBeNull()
    expect(tolkaStycken([1])).toBeNull()
    expect(tolkaStycken(new Array(21).fill('x'))).toBeNull()
  })

  it('räknar ord utan skiljetecken', () => {
    expect(raknaOrd(['Hej på dig, du!', '– 12 år.'])).toBe(6)
  })

  it('brevet som text med hälsning, avslut och namn', () => {
    expect(
      brevSomText({ halsning: null, stycken: ['Ett.', 'Två.'], sprak: 'sv', avsandare: { namn: 'Anna Berg' } })
    ).toBe('Hej,\n\nEtt.\n\nTvå.\n\nMed vänlig hälsning\nAnna Berg')
    expect(
      brevSomText({ halsning: 'Hi Maria,', stycken: ['One.'], sprak: 'en', avsandare: { namn: 'Anna' } })
    ).toBe('Hi Maria,\n\nOne.\n\nKind regards\nAnna')
  })
})

describe('kraven', () => {
  const stycken = [
    'Jag har lett tre systembyten i logistikbranschen.',
    'Jag talar och skriver engelska dagligen i mitt nuvarande jobb.',
    'Jag har B-körkort och egen bil.',
  ]

  it('godkänner bara citat som står ordagrant, blanksteg normaliserade', () => {
    expect(citatFinns('lett  tre\nsystembyten', stycken)).toBe(true)
    expect(citatFinns('lett fyra systembyten', stycken)).toBe(false)
  })

  it('validerar modellens svar: falska citat blir null, dubbletter bort, högst åtta', () => {
    const ut = valideraKrav(
      {
        krav: [
          { krav: 'erfarenhet av systembyten.', citat: 'Jag har lett tre systembyten' },
          { krav: 'Engelska i tal och skrift', citat: 'Jag är flytande i engelska' },
          { krav: 'B-körkort', citat: 'Jag har B-körkort och egen bil.' },
          { krav: 'b-körkort', citat: null },
          { krav: 42 },
        ],
      },
      stycken
    )
    expect(ut).toEqual([
      { krav: 'Erfarenhet av systembyten', citat: 'Jag har lett tre systembyten' },
      { krav: 'Engelska i tal och skrift', citat: null },
      { krav: 'B-körkort', citat: 'Jag har B-körkort och egen bil.' },
    ])
    const manga = Array.from({ length: 12 }, (_, i) => ({ krav: `Krav ${i}`, citat: null }))
    expect(valideraKrav(manga, stycken)).toHaveLength(8)
  })

  it('färre än tre krav ger [], otolkbart svar ger null', () => {
    expect(valideraKrav({ krav: [{ krav: 'A1', citat: null }, { krav: 'B2', citat: null }] }, stycken)).toEqual([])
    expect(valideraKrav('trasigt', stycken)).toBeNull()
  })

  it('citatet behåller brevets citattecken', () => {
    expect(hittaCitat('kallas "Ankaret"', ['Projektet kallas ”Ankaret” internt.'])).toBe('kallas ”Ankaret”')
  })

  it('kravets text kapas vid ordslut och får versal', () => {
    const t = stadaKravText('mycket god erfarenhet av att leda stora tvärfunktionella projekt')
    expect(t.length).toBeLessThanOrEqual(40)
    expect(t.startsWith('Mycket god erfarenhet')).toBe(true)
  })

  it('räknar om träffarna efter en textändring, utan AI', () => {
    const krav = [
      { krav: 'Systembyten', citat: 'lett tre systembyten' },
      { krav: 'Engelska', citat: 'engelska dagligen' },
      { krav: 'Körkort', citat: null },
    ]
    const andrad = [stycken[0], 'Jag talar svenska.', stycken[2]]
    expect(kravMedTraffar(krav, andrad)).toEqual([
      { krav: 'Systembyten', citat: 'lett tre systembyten' },
      { krav: 'Engelska', citat: null },
      { krav: 'Körkort', citat: null },
    ])
    expect(kravMatt(kravMedTraffar(krav, andrad))).toEqual({ antal: 3, medSvar: 1, saknas: 2 })
    expect(kravMatt([])).toBeNull()
    expect(kravMatt(null)).toBeNull()
  })

  it('lägger till en mening i näst sista stycket och gör den till citat', () => {
    const krav = [
      { krav: 'A', citat: null },
      { krav: 'B', citat: null },
      { krav: 'C', citat: null },
    ]
    const ut = laggTillMening(stycken, krav, 1, '  Jag har läst engelska på universitetet. ')
    expect(ut?.stycke).toBe(1)
    expect(ut?.stycken[1]).toBe(`${stycken[1]} Jag har läst engelska på universitetet.`)
    expect(ut?.krav[1].citat).toBe('Jag har läst engelska på universitetet.')
    expect(kravMatt(kravMedTraffar(ut!.krav, ut!.stycken))?.medSvar).toBe(1)
    expect(laggTillMening(stycken, krav, 0, 'Mening.', 2)?.stycke).toBe(2)
    expect(laggTillMening(stycken, krav, 9, 'Mening.')).toBeNull()
    expect(laggTillMening(stycken, krav, 0, 'Mening.', 5)).toBeNull()
    expect(laggTillMening(['Ett.'], krav, 0, 'Mening.')?.stycke).toBe(0)
  })
})

describe('brevets väg och nästa steg', () => {
  it('vägen', () => {
    expect(brevetsVag({ forberett_at: null }, false)).toEqual({ steg: 'las-igenom', klara: ['annonsen', 'brevet'] })
    expect(brevetsVag({ forberett_at: '2026-11-20' }, false)).toEqual({
      steg: 'skickat',
      klara: ['annonsen', 'brevet', 'las-igenom'],
    })
    expect(brevetsVag({ forberett_at: null }, true)).toEqual({
      steg: 'skickat',
      klara: ['annonsen', 'brevet', 'las-igenom', 'skickat'],
    })
  })

  const kravSex = [
    ...Array.from({ length: 6 }, (_, i) => ({ krav: `Krav ${i}`, citat: `mening ${i}` })),
    { krav: 'Engelska', citat: null },
  ]
  const text = Array.from({ length: 6 }, (_, i) => `Här står mening ${i} i brevet.`)

  it('inga brev, CV finns / saknas', () => {
    const forsta = nastaSteg({ brev: [], sokta: new Set(), harCv: true })
    expect(forsta.lage).toBe('forsta-brevet')
    expect(forsta.overrad).toBe('Ditt första brev · ingår gratis')
    expect(forsta.knapp).toEqual({ text: 'Skriv brevet', href: '/dashboard/skapa-brev' })
    expect(nastaSteg({ brev: [], sokta: new Set(), harCv: true, harBetalt: true }).overrad).toBe('Ditt första brev')
    const utanCv = nastaSteg({ brev: [], sokta: new Set(), harCv: false })
    expect(utanCv.lage).toBe('cv-saknas')
    expect(utanCv.knapp).toEqual({ text: 'Öppna CV', href: '/dashboard/profil/cv' })
  })

  it('ett krav saknas: skissens text och talet "6 av 7"', () => {
    const s = nastaSteg({
      brev: [{ id: 'a', company: 'Nordanvind Energi', updated_at: '2026-11-20', krav: kravSex, body_stycken: text }],
      sokta: new Set(),
      harCv: true,
    })
    expect(s.lage).toBe('krav-saknas')
    expect(s.overrad).toBe('Nästa steg · brevet till Nordanvind Energi')
    expect(s.text).toBe('Brevet är skrivet mot annonsen och ditt CV. Ett krav saknas, sedan är det klart att skicka.')
    expect(s.stortTal).toEqual({ tal: '6', rest: 'av 7 krav i annonsen' })
    expect(s.knapp.href).toBe('/dashboard/mina-brev/a')
  })

  it('två krav saknas följer verkligheten', () => {
    const s = nastaSteg({
      brev: [{ id: 'a', company: 'X', krav: kravSex, body_stycken: text.slice(0, 5) }],
      sokta: new Set(),
      harCv: true,
    })
    expect(s.text).toContain('Två krav saknas')
  })

  it('utan kravmått: läs igenom och ordantal', () => {
    const s = nastaSteg({ brev: [{ id: 'a', company: 'X', krav: [], body_stycken: ['Ett två tre.'] }], sokta: new Set(), harCv: true })
    expect(s.lage).toBe('las-igenom')
    expect(s.text).toBe('Brevet är skrivet mot annonsen och ditt CV. Läs igenom det en gång, sedan är det klart att skicka.')
    expect(s.stortTal).toEqual({ tal: '3', rest: 'ord' })
  })

  it('förberett men inte skickat', () => {
    const s = nastaSteg({
      brev: [{ id: 'a', company: 'X', forberett_at: '2026-11-20', forberett_som: 'kopierat', body_stycken: ['a'] }],
      sokta: new Set(),
      harCv: true,
    })
    expect(s.lage).toBe('skicka')
    expect(s.rubrik).toBe('Skicka ansökan')
    expect(s.text).toBe('Brevet är kopierat. Markera det som sökt när ansökan är inne, så håller vi ordning på den.')
  })

  it('väljer senast uppdaterade brev som inte är skickat', () => {
    const s = nastaSteg({
      brev: [
        { id: 'skickat', company: 'A', updated_at: '2026-11-20', body_stycken: ['a'] },
        { id: 'oppet', company: 'B', updated_at: '2026-11-19', body_stycken: ['a'] },
        { id: 'aldre', company: 'C', updated_at: '2026-11-01', body_stycken: ['a'] },
      ],
      sokta: new Set(['skickat']),
      harCv: true,
    })
    expect(s.brevId).toBe('oppet')
  })

  it('alla brev skickade', () => {
    const s = nastaSteg({
      brev: [
        { id: 'a', company: 'A' },
        { id: 'b', company: 'B' },
      ],
      sokta: new Set(['a', 'b']),
      harCv: true,
    })
    expect(s.lage).toBe('alla-skickade')
    expect(s.stortTal).toEqual({ tal: '2', rest: 'ansökningar skickade' })
    expect(s.knapp.text).toBe('Skriv nytt brev')
  })

  it('stora talet läser gamla brevs HTML när stycken saknas', () => {
    expect(stortTalForBrev({ content: '<style></style><div class="body-content"><p>Ett två.</p></div>' })).toEqual({
      tal: '2',
      rest: 'ord',
    })
  })
})

describe('brevets data', () => {
  const profil = {
    full_name: 'Anna Berg',
    email: 'konto@exempel.se',
    contact_email: 'anna@exempel.se',
    phone: '070-111 22 33',
    location: 'Sundsvall',
    include_phone_in_letters: true,
    include_location_in_letters: false,
    titel: 'Projektledare',
  }

  it('bygger BrevData ur raden och profilen', () => {
    const d = brevDataFranBrev(
      {
        company: ' Nordanvind Energi ',
        job_title: 'IT-projektledare',
        mottagare_person: '',
        halsning: null,
        language: 'sv',
        body_stycken: ['Ett.', 'Två.'],
        created_at: '2026-11-20T23:30:00Z',
      },
      profil
    )
    expect(d).toEqual({
      avsandare: { namn: 'Anna Berg', titel: 'Projektledare', epost: 'anna@exempel.se', telefon: '070-111 22 33', ort: null },
      mottagare: { foretag: 'Nordanvind Energi', person: null },
      tjanst: 'IT-projektledare',
      datum: '2026-11-21',
      halsning: null,
      stycken: ['Ett.', 'Två.'],
      sprak: 'sv',
    })
  })

  it('gamla brev: stycken ur content, engelska', () => {
    const d = brevDataFranBrev(
      { language: 'en', content: '<style></style><div class="body-content"><p>One.</p><p>Two.</p></div>' },
      profil
    )
    expect(d.stycken).toEqual(['One.', 'Two.'])
    expect(d.sprak).toBe('en')
  })
})

describe('Premium på servern', () => {
  it('gratis: bara Linne och Björk, ingen Helvetica, ingen auto', () => {
    expect(premiumSparr({ mallId: 'linne' }, false)).toBeNull()
    expect(premiumSparr({ mallId: 'bjork', fontId: 'georgia', ton: 'professional' }, false)).toBeNull()
    expect(premiumSparr({ mallId: 'koppar' }, false)).toBe('mall')
    expect(premiumSparr({ fontId: 'helvetica' }, false)).toBe('typsnitt')
    expect(premiumSparr({ ton: 'auto' }, false)).toBe('ton')
    expect(premiumSparr({ mallId: 'koppar', fontId: 'helvetica', ton: 'auto' }, true)).toBeNull()
  })

  it('brevets mall från start: CV:ts om den får sparas, annars Linne', () => {
    expect(startmallForBrev('bjork', false)).toBe('bjork')
    expect(startmallForBrev('koppar', false)).toBe('linne')
    expect(startmallForBrev('koppar', true)).toBe('koppar')
    expect(startmallForBrev(null, true)).toBe('linne')
    expect(startmallForBrev('finns-inte', true)).toBe('linne')
    expect(cvMallUrStrukturerad({ bygge: { utkast: false, mall: 'kalksten' } })).toBe('kalksten')
    expect(cvMallUrStrukturerad({})).toBeNull()
    expect(farSparaMall('koppar', true)).toBe(true)
    expect(farSparaMall('koppar', false)).toBe(false)
  })
})

describe('ändringar utan AI', () => {
  it('tar bara emot tillåtna fält', () => {
    const t = tolkaBrevAndring({
      stycken: ['Ett.'],
      halsning: ' Hej Maria, ',
      mall_id: 'bjork',
      font_id: 'georgia',
      company: 'Nordanvind',
      user_id: 'någon annan',
      krav: [],
    })
    expect(t).toEqual({
      ok: true,
      andring: { body_stycken: ['Ett.'], halsning: 'Hej Maria,', mall_id: 'bjork', font_id: 'georgia', company: 'Nordanvind' },
    })
  })

  it('nekar okänd mall och okänt typsnitt', () => {
    expect(tolkaBrevAndring({ mall_id: 'finns-inte' })).toMatchObject({ ok: false, falt: 'mall_id' })
    expect(tolkaBrevAndring({ font_id: 'comic-sans' })).toMatchObject({ ok: false, falt: 'font_id' })
    expect(tolkaBrevAndring({ stycken: 'text' })).toMatchObject({ ok: false, falt: 'stycken' })
  })

  it('gammalt brev flyttas till nya formatet vid första ändringen', () => {
    const gammalt = {
      body_stycken: null,
      mall_id: null,
      content: '<style></style><div class="body-content"><p>Ett.</p><p>Två.</p></div>',
    }
    const { rad, ritaOm } = slaIhopAndring(gammalt, { font_id: 'georgia' }, 'linne')
    expect(ritaOm).toBe(true)
    expect(rad.body_stycken).toEqual(['Ett.', 'Två.'])
    expect(rad.mall_id).toBe('linne')
  })

  it('bara titel på ett gammalt brev: ingen flytt', () => {
    const { rad, ritaOm } = slaIhopAndring({ body_stycken: null, mall_id: null, content: 'x' }, { title: 'Ny' }, 'linne')
    expect(ritaOm).toBe(false)
    expect(rad.mall_id).toBeNull()
  })

  it('äldre klient som skickar HTML på ett nytt brev: styckena läses ur den', () => {
    const { rad, ritaOm } = slaIhopAndring(
      { body_stycken: ['Gammalt.'], mall_id: 'linne', content: 'x' },
      { content: '<style></style><div class="body-content"><p>Nytt.</p></div>' },
      'linne'
    )
    expect(ritaOm).toBe(true)
    expect(rad.body_stycken).toEqual(['Nytt.'])
  })
})

describe('kvoten', () => {
  const nu = new Date('2026-11-21T10:00:00Z')

  it('kvar när fönstret är gammalt', () => {
    expect(brevKvot({ weekly_letter_count: 1, weekly_letter_first_used_at: '2026-11-10T10:00:00Z' }, false, nu)).toEqual({
      harBetalt: false,
      grans: 1,
      anvant: 0,
      kvar: 1,
      nastaGratisbrev: null,
    })
  })

  it('slut: nästa gratisbrev när fönstret löper ut', () => {
    const k = brevKvot({ weekly_letter_count: 1, weekly_letter_first_used_at: '2026-11-20T09:00:00Z' }, false, nu)
    expect(k.kvar).toBe(0)
    expect(k.nastaGratisbrev).toBe('2026-11-27T09:00:00.000Z')
    expect(formatGratisbrevDag(k.nastaGratisbrev!)).toBe('fredag 27 nov')
  })

  it('efter skrivning startar ett nytt fönster', () => {
    const k = brevKvotEfterSkrivning({ weekly_letter_count: 0, weekly_letter_first_used_at: null }, nu)
    expect(k.kvar).toBe(0)
    expect(k.nastaGratisbrev).toBe('2026-11-28T10:00:00.000Z')
  })

  it('Premium: ingen kvot', () => {
    expect(brevKvot(null, true, nu).kvar).toBeNull()
  })
})

describe('ritningen', () => {
  const data = brevDataFranBrev(
    { company: 'Nordanvind', job_title: 'Projektledare', body_stycken: ['Ett <b>stycke</b>.', 'Två.'], created_at: '2026-11-21T10:00:00Z' },
    { full_name: 'Anna Berg', email: 'anna@exempel.se' }
  )

  it('ritar brevet utan att text blir HTML, och styckena går att läsa tillbaka', () => {
    const html = ritaBrevHtml({ mall_id: 'linne', font_id: 'georgia' }, data)
    expect(html).toContain('Nordanvind')
    expect(html).not.toContain('<b>stycke</b>')
    expect(html).toContain('Georgia')
    expect(styckenFranContent(html)).toEqual(['Ett ‹b›stycke‹/b›.', 'Två.'])
  })

  it('gamla brev ritas i sin gamla mall', () => {
    const html = ritaBrevHtml({ mall_id: null, template_id: 'minimal' }, data)
    expect(html).toBe(
      getDocxTemplate('minimal').generateHTML(
        { full_name: 'Anna Berg', email: 'anna@exempel.se', phone: null, location: null, include_phone_in_letters: false, include_location_in_letters: false },
        { title: 'Projektledare', company: 'Nordanvind', position: 'Projektledare', recipient: undefined },
        'Ett ‹b›stycke‹/b›.\nTvå.',
        '21 november 2026',
        undefined
      )
    )
  })
})
