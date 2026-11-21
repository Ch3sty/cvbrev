/**
 * Mallvisaren för personliga brev (byggspecen våg 2, 2026-11-21): namnraden
 * och fotraden ur brevets katalog, orten ur adressen och översättningen från
 * de publika exempelbreven till brevmotorns BrevData.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { brevMallKort } from '@/lib/letters/brevmall/katalog'
import { avslutsRad } from '@/lib/letters/brevmall/text'
import { BREV_MALL_ANTAL, brevMiniatyrSrc } from '@/components/publikt/brevmallar'
import { ARTIKEL_BREV, ARTIKEL_BREV_NYCKLAR } from '@/components/mdx/personligt-brev-preview-data'
import { VISARE_MALL_IDS, brevDataFranFalt, brevTextDelar, idagISverige, namnradMening, ortUrAdress, visarFot, visarMallar } from '../visare-data'
import { VISARE_TEXT } from '../texter'

describe('namnraden och fotraden ur katalogen', () => {
  it('fem mallar i skissens ordning, med katalogens namn och miniatyrer', () => {
    expect([...VISARE_MALL_IDS]).toEqual(['linne', 'bjork', 'koppar', 'ritning', 'terrakotta'])
    const m = visarMallar()
    expect(m.map((x) => x.id)).toEqual([...VISARE_MALL_IDS])
    for (const x of m) {
      const k = brevMallKort(x.id)!
      expect(x.namn).toBe(k.namn)
      expect(x.bild).toBe(brevMiniatyrSrc(x.id))
    }
  })

  it('gratis och Premium med Word, Premium utan Word för Ritning och Terrakotta', () => {
    const [linne, bjork, koppar, ritning, terrakotta] = visarMallar()
    expect(`${linne.namn}. ${linne.rad}`).toBe('Linne. Gratis, även som Word.')
    expect(bjork.rad).toBe('Gratis, även som Word.')
    expect(`${koppar.namn}. ${koppar.rad}`).toBe('Koppar. Ingår i Premium, även som Word.')
    expect(`${ritning.namn}. ${ritning.rad}`).toBe('Ritning. Ingår i Premium.')
    expect(`${terrakotta.namn}. ${terrakotta.rad}`).toBe('Terrakotta. Ingår i Premium.')
  })

  it('mening följer katalogens nivå och word; utan Word faller tillägget bort', () => {
    expect(namnradMening(false, false)).toBe('Ingår i Premium.')
    expect(namnradMening(true, false)).toBe('Gratis.')
    const terrakotta = brevMallKort('terrakotta')!
    expect(terrakotta.word).toBe(false)
    expect(namnradMening(terrakotta.niva === 'gratis', terrakotta.word)).toBe('Ingår i Premium.')
    for (const x of visarMallar()) {
      const k = brevMallKort(x.id)!
      expect(x.rad).toBe(namnradMening(k.niva === 'gratis', k.word))
    }
  })

  it('fotraden: fem av katalogens antal', () => {
    expect(BREV_MALL_ANTAL).toBe(40)
    expect(visarFot()).toBe('Det här är fem av 40 mallar. Med ett konto provar du alla med ditt eget brev.')
  })

  it('inga engelska ord, inga kronor och inga tankstreck i visarens texter', () => {
    const texter = [
      ...(Object.values(VISARE_TEXT) as unknown[]).filter((v): v is string => typeof v === 'string'),
      VISARE_TEXT.mall('Linne'),
      VISARE_TEXT.arkTitel('Koppar', 'projektledare'),
      visarFot(),
      ...visarMallar().map((m) => m.rad),
    ]
    for (const t of texter) {
      expect(t).not.toMatch(/—|–|\bkr\b|kronor|preview|template|download/i)
    }
    expect(VISARE_TEXT.arkTitel('Koppar', 'projektledare')).toBe('Personligt brev för projektledare i mallen Koppar')
    expect(VISARE_TEXT.arkTitel('Koppar')).toBe('Personligt brev i mallen Koppar')
  })
})

describe('orten ur adressen', () => {
  it('allt efter postnumret, även orter i två ord', () => {
    expect(ortUrAdress('Exportgatan 12, 422 46 Hisings Backa')).toBe('Hisings Backa')
    expect(ortUrAdress('Storgatan 12, 111 23 Stockholm')).toBe('Stockholm')
    expect(ortUrAdress('Terminalvägen 8, 424 57 Angered')).toBe('Angered')
    expect(ortUrAdress('Gatan 1, 12345 Västra Frölunda')).toBe('Västra Frölunda')
  })

  it('utan postnummer: sista delen efter komma, annars hela', () => {
    expect(ortUrAdress('Södermalm, Stockholm')).toBe('Stockholm')
    expect(ortUrAdress('Hägersten')).toBe('Hägersten')
    expect(ortUrAdress('')).toBeNull()
    expect(ortUrAdress(undefined)).toBeNull()
  })
})

describe('exempelbrevet som BrevData', () => {
  const bas = { namn: 'Sara Lindström', adress: 'Storgatan 12, 111 23 Stockholm', telefon: '070-123 45 67', epost: 'sara@exempel.se', arbetsgivare: 'TechFlow Sweden AB', roll: 'Senior Projektledare' }

  it('hälsningen följer med, avslutet och namnet tas bort (motorn skriver sitt eget)', () => {
    const d = brevDataFranFalt({ ...bas, brevText: 'Hej,\n\nFörsta stycket.\n\nAndra stycket.\n\nVarma hälsningar,\nSara Lindström' }, '2026-11-21')
    expect(d.halsning).toBe('Hej,')
    expect(d.stycken).toEqual(['Första stycket.', 'Andra stycket.'])
    expect(d.avsandare).toEqual({ namn: 'Sara Lindström', titel: null, epost: 'sara@exempel.se', telefon: '070-123 45 67', ort: 'Stockholm' })
    expect(d.mottagare).toEqual({ foretag: 'TechFlow Sweden AB', person: null })
    expect(d.tjanst).toBe('Senior Projektledare')
    expect(d.datum).toBe('2026-11-21')
  })

  it('"Hej!" räknas som hälsning, ett brev utan hälsning får motorns', () => {
    expect(brevDataFranFalt({ ...bas, brevText: 'Hej!\n\nJag söker jobbet.' }, '2026-11-21')).toMatchObject({ halsning: 'Hej!', stycken: ['Jag söker jobbet.'] })
    const utan = brevDataFranFalt({ ...bas, brevText: 'Jag söker jobbet.\n\nTack för att du läste.' }, '2026-11-21')
    expect(utan.halsning).toBeNull()
    expect(brevTextDelar(utan).halsning).toBe('Hej,')
  })

  it('stad i stället för adress, företag i stället för arbetsgivare', () => {
    const d = brevDataFranFalt({ namn: 'A', stad: 'Vasastan, Stockholm', foretag: 'Firma AB', brevText: 'Hej,\n\nText.' }, '2026-11-21')
    expect(d.avsandare.ort).toBe('Stockholm')
    expect(d.mottagare.foretag).toBe('Firma AB')
    expect(d.tjanst).toBeNull()
  })

  it('artiklarnas sex brev: texten slutar med motorns avslut och namnet, som arket', () => {
    expect([...ARTIKEL_BREV_NYCKLAR]).toEqual(['student', 'underskoterska', 'saljare', 'ekonomiassistent', 'lagerarbetare', 'butikssaljare'])
    for (const n of ARTIKEL_BREV_NYCKLAR) {
      const b = ARTIKEL_BREV[n]
      const t = brevTextDelar(brevDataFranFalt(b, '2026-11-21'))
      expect(t.avslut).toBe(avslutsRad('sv'))
      expect(t.namn).toBe(b.namn)
      expect(t.stycken.length).toBeGreaterThan(1)
      // Inget av brevets eget avslut ligger kvar i styckena.
      expect(t.stycken.join('\n')).not.toMatch(/hälsning(ar)?,?$/im)
      expect(t.stycken[t.stycken.length - 1]).not.toContain(b.namn)
    }
  })

  it('dagens datum i svensk tid', () => {
    expect(idagISverige(new Date('2026-11-21T23:30:00Z'))).toBe('2026-11-22')
    expect(idagISverige(new Date('2026-06-01T12:00:00Z'))).toBe('2026-06-01')
  })
})
