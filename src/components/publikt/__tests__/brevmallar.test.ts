/**
 * Brevmallarna på de publika sidorna (byggspecen våg 1, 2026-11-21): talen
 * kommer ur brevets katalog, varje vald mall har sin miniatyr i rätt mått,
 * och formatmärket följer katalogens word.
 *
 * @vitest-environment node
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { brevMallKatalog, brevMallKort } from '@/lib/letters/brevmall/katalog'
import {
  BREV_FORVALD_NAMN,
  BREV_GRATIS_NAMN,
  BREV_MALL_ANTAL,
  BREV_PREMIUM_ANTAL,
  BREV_WORD_ANTAL,
  FUNKTIONER_MALL_IDS,
  MINIATYR_BREDD,
  MINIATYR_HOJD,
  SALJ_MALL_IDS,
  brevMallKortFor,
  brevMiniatyrSrc,
  formatMarke,
  namnLista,
} from '../brevmallar'

const PUBLIC = path.resolve(__dirname, '../../../../public')

describe('brevmallarna på de publika sidorna', () => {
  it('talen och namnen läses ur katalogen', () => {
    const k = brevMallKatalog()
    expect(BREV_MALL_ANTAL).toBe(k.length)
    expect(BREV_PREMIUM_ANTAL).toBe(k.filter((m) => m.niva === 'premium').length)
    expect(BREV_WORD_ANTAL).toBe(k.filter((m) => m.word).length)
    expect(BREV_GRATIS_NAMN).toBe(namnLista(k.filter((m) => m.niva === 'gratis').map((m) => m.namn)))
    expect(BREV_FORVALD_NAMN).toBe(brevMallKort('linne')?.namn)
    // Facit i dag (byggspecen): 40 mallar, 26 i Word, Linne och Björk gratis.
    expect([BREV_MALL_ANTAL, BREV_WORD_ANTAL, BREV_PREMIUM_ANTAL, BREV_GRATIS_NAMN]).toEqual([40, 26, 38, 'Linne och Björk'])
  })

  it('säljsidans sju mallar i UX:s ordning, alla i katalogen', () => {
    expect([...SALJ_MALL_IDS]).toEqual(['linne', 'bjork', 'koppar', 'kalksten', 'granit', 'kolumn', 'terrakotta'])
    expect(brevMallKortFor(SALJ_MALL_IDS).map((m) => m.id)).toEqual([...SALJ_MALL_IDS])
    for (const id of FUNKTIONER_MALL_IDS) expect(SALJ_MALL_IDS).toContain(id)
  })

  it('formatmärket följer katalogens word (Terrakotta bara PDF)', () => {
    for (const m of brevMallKortFor(SALJ_MALL_IDS)) {
      expect(formatMarke(m.word)).toBe(m.word ? 'PDF · Word' : 'PDF')
    }
    expect(formatMarke(brevMallKort('terrakotta')!.word)).toBe('PDF')
    expect(formatMarke(brevMallKort('linne')!.word)).toBe('PDF · Word')
  })

  it('varje vald mall har sin miniatyr under public/ i måtten som står i HTML', async () => {
    for (const id of new Set<string>([...SALJ_MALL_IDS, ...FUNKTIONER_MALL_IDS])) {
      const fil = path.join(PUBLIC, brevMiniatyrSrc(id))
      expect(fs.existsSync(fil), `${fil} saknas, kör npx tsx scripts/brevmallar-miniatyrer.ts`).toBe(true)
      const meta = await sharp(fil).metadata()
      expect(meta.format).toBe('webp')
      expect([meta.width, meta.height]).toEqual([MINIATYR_BREDD, MINIATYR_HOJD])
      expect(fs.statSync(fil).size).toBeLessThan(80 * 1024)
    }
  })
})
